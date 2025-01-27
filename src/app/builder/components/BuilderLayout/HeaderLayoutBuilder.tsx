'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { getAllHeaderItems, HeaderItem as HeaderItemType } from './data/headerItems';
import clsx from 'clsx';
import { Settings } from 'lucide-react';

type ItemType = HeaderItemType;

type LayoutType = {
  top_left: string[];
  top_center: string[];
  top_right: string[];
  middle_left: string[];
  middle_center: string[];
  middle_right: string[];
  bottom_left: string[];
  bottom_center: string[];
  bottom_right: string[];
  available: string[];
};

type LayoutKey = keyof LayoutType;

const items = getAllHeaderItems();

// Get all used items across all sections
const usedItems = ['logo']; // Items that are pre-placed in the layout

// Initialize with all items in the available section, excluding used items
const initialLayout: LayoutType = {
  top_left: [],
  top_center: ['logo'],
  top_right: [],
  middle_left: [],
  middle_center: [],
  middle_right: [],
  bottom_left: [],
  bottom_center: [],
  bottom_right: [],
  available: items
    .map((item) => item.id)
    .filter(id => id !== 'logo') // Only exclude logo since it's placed in bottom_left
};

const hasLogo = (containerId: string, layout: LayoutType) => {
  return layout[containerId as keyof LayoutType]?.includes('logo') || false;
};

export function HeaderLayoutBuilder() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [layout, setLayout] = useState<LayoutType>(initialLayout);
  const [draggedItem, setDraggedItem] = useState<ItemType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = useCallback(({ active }: any) => {
    setActiveId(active.id);
    const activeItem = items.find((item) => item.id === active.id) || null;
    setDraggedItem(activeItem);
  }, []);

  const handleDragEnd = useCallback(({ active, over }: any) => {
    setDraggedItem(null);
    
    if (!over) return;
    const activeContainerId = active.data.current?.sortable?.containerId;
    const overContainerId = over.data.current?.sortable?.containerId || over.id;

    setLayout((prevLayout) => {
      // Prevent dropping in containers that have logo
      if (hasLogo(overContainerId, prevLayout)) {
        return prevLayout;
      }

      if (activeContainerId === overContainerId) {
        // If in the same container, just reorder
        const items = [...(prevLayout[activeContainerId as keyof LayoutType] || [])];
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return {
            ...prevLayout,
            [activeContainerId]: arrayMove(items, oldIndex, newIndex),
          };
        }
        return prevLayout;
      } else {
        // Moving between containers
        const sourceItems = [...(prevLayout[activeContainerId as keyof LayoutType] || [])];
        const destItems = [...(prevLayout[overContainerId as keyof LayoutType] || [])];
        const sourceIndex = sourceItems.indexOf(active.id);

        if (sourceIndex !== -1) {
          // Remove from source
          sourceItems.splice(sourceIndex, 1);
          
          // Add to destination
          const destIndex = over.id === overContainerId ? 
            destItems.length : 
            destItems.indexOf(over.id);
          destItems.splice(destIndex >= 0 ? destIndex : destItems.length, 0, active.id);

          // Create new layout with updated arrays
          const newLayout = {
            ...prevLayout,
            [activeContainerId]: sourceItems,
            [overContainerId]: destItems,
          };

          return newLayout;
        }
        return prevLayout;
      }
    });
  }, []);

  const handleDragOver = useCallback(({ active, over }: any) => {
    if (!over || active.id === over.id) return;

    const activeContainerId = active.data.current?.sortable?.containerId;
    const overContainerId = over.data.current?.sortable?.containerId || over.id;

    setLayout((prevLayout) => {
      // Prevent dropping in containers that have logo
      if (hasLogo(overContainerId, prevLayout)) {
        return prevLayout;
      }

      if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) return prevLayout;

      const sourceItems = [...(prevLayout[activeContainerId as keyof LayoutType] || [])];
      const destItems = [...(prevLayout[overContainerId as keyof LayoutType] || [])];
      const sourceIndex = sourceItems.indexOf(active.id);

      if (sourceIndex !== -1) {
        // Remove from source
        sourceItems.splice(sourceIndex, 1);
        
        // Add to destination
        const destIndex = over.id === overContainerId ? 
          destItems.length : 
          destItems.indexOf(over.id);
        destItems.splice(destIndex >= 0 ? destIndex : destItems.length, 0, active.id);

        return {
          ...prevLayout,
          [activeContainerId]: sourceItems,
          [overContainerId]: destItems,
        };
      }
      return prevLayout;
    });
  }, []);

  return (
    <div className="bg-gray-100 z-50 absolute bottom-0 w-full bg-zinc-700">
      <div className='flex align-center justify-between p-3 bg-white border-b border-t mb-2 inset-shadow-sm'>
        <h3>Header Builder</h3>
        <div className='flex align-center justify-between gap-2'>
          <Button size={'sm'}>Desktop</Button>
          <Button size={'sm'}>Mobile</Button>
        </div>
        <div className='flex align-center justify-between gap-2'>
          <Button size={'sm'}>Preset</Button>
          <Button size={'sm'}>Clear All</Button>
          <Button size={'sm'}>Close</Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col gap-2 p-3">
          <div className="flex gap-2 w-full">
            {(['top_left', 'top_center', 'top_right'] as const).map((containerId) => (
              <Container
                key={containerId}
                id={containerId}
                items={layout[containerId] || []}
                isDropDisabled={hasLogo(containerId, layout)}
              >
                {(layout[containerId] || []).map((itemId) => {
                  const item = items.find((item) => item.id === itemId);
                  return item ? (
                    <Item
                      key={item.id}
                      id={item.id}
                      label={item.builderLabel || item.label}
                      isActive={draggedItem?.id === item.id}
                      containerId={containerId}
                      type={item.type}
                    />
                  ) : null;
                })}
              </Container>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            {(['middle_left', 'middle_center', 'middle_right'] as const).map((containerId) => (
              <Container
                key={containerId}
                id={containerId}
                items={layout[containerId] || []}
                isDropDisabled={hasLogo(containerId, layout)}
              >
                {(layout[containerId] || []).map((itemId) => {
                  const item = items.find((item) => item.id === itemId);
                  return item ? (
                    <Item
                      key={item.id}
                      id={item.id}
                      label={item.builderLabel || item.label}
                      isActive={draggedItem?.id === item.id}
                      containerId={containerId}
                      type={item.type}
                    />
                  ) : null;
                })}
              </Container>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            {(['bottom_left', 'bottom_center', 'bottom_right'] as const).map((containerId) => (
              <Container
                key={containerId}
                id={containerId}
                items={layout[containerId] || []}
                isDropDisabled={hasLogo(containerId, layout)}
              >
                {(layout[containerId] || []).map((itemId) => {
                  const item = items.find((item) => item.id === itemId);
                  return item ? (
                    <Item
                      key={item.id}
                      id={item.id}
                      label={item.builderLabel || item.label}
                      isActive={draggedItem?.id === item.id}
                      containerId={containerId}
                      type={item.type}
                    />
                  ) : null;
                })}
              </Container>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            <Container
              id="available"
              items={layout.available || []}
            >
              {(layout.available || []).map((itemId) => {
                const item = items.find((item) => item.id === itemId);
                return item ? (
                  <Item
                    key={item.id}
                    id={item.id}
                    label={item.builderLabel || item.label}
                    isActive={draggedItem?.id === item.id}
                    containerId="available"
                    type={item.type}
                  />
                ) : null;
              })}
            </Container>
          </div>
          <DragOverlay>
            {draggedItem && (
              <Item 
                id={draggedItem.id} 
                label={draggedItem.builderLabel || draggedItem.label} 
                type={draggedItem.type}
              />
            )}
          </DragOverlay>
        </div>
      </DndContext>
    </div>
  );
}

const Container: React.FC<{ id: LayoutKey; items: string[]; children: React.ReactNode; isDropDisabled?: boolean }> = ({
  id,
  items,
  children,
  isDropDisabled,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isDropDisabled,
  });

  const hasLogo = items.includes('logo');
  const align = id.split('_').pop();
  
  return (
    <SortableContext id={id} items={items}>
      <div
        ref={setNodeRef}
        className={clsx(
          'p-2 bg-zinc-900 border border-dashed border-gray-300 rounded shadow-sm min-h-[40px] flex gap-2',
          {
            'border-primary-500': isOver && !isDropDisabled,
            'w-[105px]': hasLogo,
            'flex-1': !hasLogo,
            'justify-start items-center': align === 'left',
            'justify-end items-center': align === 'right',
            'justify-center items-center': align === 'center',
            'pointer-events-none opacity-75': isDropDisabled
          }
        )}
      >
        {children}
      </div>
    </SortableContext>
  );
};

const Item: React.FC<{
  id: string;
  label: string;
  isActive?: boolean;
  containerId?: string;
  type?: string;
}> = ({
  id,
  label,
  isActive,
  containerId,
  type
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const showSettings = containerId !== 'available' && type !== 'divider';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-4 text-nowrap py-2 bg-blue-100 rounded text-xs cursor-move select-none flex items-center gap-2 ${
        isActive ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <span>{label}</span>
      {showSettings && (
        <Settings 
          className="w-3 h-3 text-gray-600 cursor-pointer hover:text-gray-900" 
          onClick={(e) => {
            e.stopPropagation();
            // Handle settings click
          }} 
        />
      )}
    </div>
  );
};
