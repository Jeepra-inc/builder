"use client";
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { RefObject, useState, useCallback } from 'react';
import { Section } from '@/app/builder/types';

interface UseDndHandlersProps {
  contentRef: RefObject<HTMLIFrameElement | null>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
}

export function useDndHandlers({ contentRef, setSections }: UseDndHandlersProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Restrict axis if needed
  const restrictAxis = useCallback((args: any) => {
    const { transform } = args;
    return {
      ...transform,
      x: 0,
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true);
    contentRef.current?.contentWindow?.postMessage(
      {
        type: 'DRAG_START',
        sectionId: event.active.id,
      },
      '*'
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      contentRef.current?.contentWindow?.postMessage(
        {
          type: 'DRAG_OVER',
          activeSectionId: active.id,
          overSectionId: over?.id,
        },
        '*'
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (active.id !== over?.id) {
      setSections(prevSections => {
        const oldIndex = prevSections.findIndex(sec => sec.id === active.id);
        const newIndex = prevSections.findIndex(sec => sec.id === over?.id);
        const newArr = arrayMove(prevSections, oldIndex, newIndex);

        contentRef.current?.contentWindow?.postMessage(
          {
            type: 'REORDER_SECTIONS',
            sections: newArr,
          },
          '*'
        );

        return newArr;
      });
    }
  };

  return {
    isDragging,
    restrictAxis,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
