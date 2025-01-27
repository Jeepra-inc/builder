'use client';

import { useState } from 'react';
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

type ItemType = {
  id: string;
  label: string;
};

type LayoutType = {
  [key: string]: string[];
};

const items: ItemType[] = [
  { id: 'cart', label: 'Shopping Cart' },
  { id: 'logo', label: 'Logo' },
  { id: 'menu', label: 'Navigation Menu' },
  { id: 'search', label: 'Search' },
  { id: 'social', label: 'Social Links' },
  { id: 'button', label: 'Button' },
];

const initialLayout: LayoutType = {
  top_left: ['social'],
  top_center: [],
  top_right: ['cart', 'search'],
  bottom_left: ['logo'],
  bottom_center: ['menu'],
  bottom_right: ['button'],
};

const DragAndDropGridsss: React.FC = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [layout, setLayout] = useState<LayoutType>(initialLayout);
  const [draggedItem, setDraggedItem] = useState<ItemType | null>(null);

  const handleDragStart = ({ active }: any) => {
    const activeItem = items.find((item) => item.id === active.id) || null;
    setDraggedItem(activeItem);
  };

  const handleDragEnd = ({ active, over }: any) => {
    setDraggedItem(null);
    if (!over || active.id === over.id) return;

    setLayout((prevLayout) => {
      const overContainerId =
        over.id in prevLayout
          ? over.id
          : over.data.current.sortable.containerId;
      const containerItems = prevLayout[overContainerId];
      const activeIndex = containerItems.indexOf(active.id);
      const overIndex = containerItems.indexOf(over.id);

      return {
        ...prevLayout,
        [overContainerId]: arrayMove(containerItems, activeIndex, overIndex),
      };
    });
  };

  const handleDragOver = ({ active, over }: any) => {
    if (!over || active.id === over.id) return;

    const activeContainerId = active.data.current.sortable.containerId;
    const overContainerId =
      over.id in layout ? over.id : over.data.current.sortable.containerId;

    if (activeContainerId === overContainerId) return;

    setLayout((prevLayout) => {
      const activeItems = prevLayout[activeContainerId].filter(
        (id) => id !== active.id
      );
      const overItems = [...prevLayout[overContainerId], active.id];

      return {
        ...prevLayout,
        [activeContainerId]: activeItems,
        [overContainerId]: overItems,
      };
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="grid grid-cols-3 gap-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {Object.keys(layout).map((containerId) => (
            <Container
              key={containerId}
              id={containerId}
              items={layout[containerId]}
            >
              {layout[containerId].map((itemId) => {
                const item = items.find((item) => item.id === itemId);
                return item ? (
                  <Item
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    isActive={draggedItem?.id === item.id}
                  />
                ) : null;
              })}
            </Container>
          ))}
          <DragOverlay>
            {draggedItem && (
              <Item id={draggedItem.id} label={draggedItem.label} />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

const Container: React.FC<{ id: string; items: string[]; children: React.ReactNode }> = ({
  id,
  items,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id });
  const align = id.split('_').pop();

  return (
    <SortableContext id={id} items={items}>
      <div
        ref={setNodeRef}
        className={`p-4 bg-white rounded-lg shadow-md min-h-[100px] flex flex-col gap-2 ${
          align === 'left'
            ? 'items-start'
            : align === 'right'
            ? 'items-end'
            : 'items-center'
        }`}
      >
        <div className="w-full text-sm font-medium text-gray-500 capitalize mb-2">
          {id.replace('_', ' ')}
        </div>
        {children}
      </div>
    </SortableContext>
  );
};

const Item: React.FC<{ id: string; label: string; isActive?: boolean }> = ({
  id,
  label,
  isActive,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-4 py-2 bg-blue-100 rounded cursor-move select-none ${
        isActive ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {label}
    </div>
  );
};

export default DragAndDropGridsss;