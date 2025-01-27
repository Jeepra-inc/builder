import { useState, useCallback } from 'react';
import { OutlineState, OUTLINE_CONSTANTS } from '@/app/builder/types';

export const useOutlineManager = (enabled: boolean = true) => {
  const [hovered, setHovered] = useState<OutlineState>({
    element: null,
    rect: null,
    sectionType: '',
  });
  
  const [selected, setSelected] = useState<OutlineState>({
    element: null,
    rect: null,
    sectionType: '',
  });

  const getRect = (el: HTMLElement) => el.getBoundingClientRect();

  const isTopComponent = useCallback((rect: DOMRect) => {
    return rect.top <= OUTLINE_CONSTANTS.TOP_THRESHOLD;
  }, []);

  const updateOutlineState = useCallback((
    element: HTMLElement | null,
    setState: React.Dispatch<React.SetStateAction<OutlineState>>
  ) => {
    if (!element) {
      setState({ element: null, rect: null, sectionType: '' });
      return;
    }
    setState({
      element,
      rect: getRect(element),
      sectionType: element.getAttribute('data-section-type') || OUTLINE_CONSTANTS.DEFAULT_SECTION_TEXT,
    });
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const sectionElement = target.closest('[data-section-type]') as HTMLElement | null;

    if (sectionElement && sectionElement !== hovered.element) {
      updateOutlineState(sectionElement, setHovered);
    } else if (!sectionElement) {
      updateOutlineState(null, setHovered);
    }
  }, [enabled, hovered.element, updateOutlineState]);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    const sectionElement = target.closest('[data-section-type]') as HTMLElement | null;

    if (!sectionElement) return;

    if (selected.element === sectionElement) {
      updateOutlineState(null, setSelected);
    } else {
      updateOutlineState(sectionElement, setSelected);
    }
  }, [enabled, selected.element, updateOutlineState]);

  const handleScrollOrResize = useCallback(() => {
    if (selected.element) {
      updateOutlineState(selected.element, setSelected);
    }
    if (hovered.element) {
      updateOutlineState(hovered.element, setHovered);
    }
  }, [selected.element, hovered.element, updateOutlineState]);

  return {
    hovered,
    selected,
    isTopComponent,
    handlers: {
      handleMouseMove,
      handleClick,
      handleScrollOrResize,
      handleMouseLeave: () => updateOutlineState(null, setHovered),
    },
  };
};
