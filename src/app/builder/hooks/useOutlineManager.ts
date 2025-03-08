import { useState, useCallback, useEffect } from "react";
import { OutlineState, OUTLINE_CONSTANTS } from "@/app/builder/types";

export const useOutlineManager = (enabled: boolean = true) => {
  const [hovered, setHovered] = useState<OutlineState>({
    element: null,
    rect: null,
    sectionType: "",
  });

  const [selected, setSelected] = useState<OutlineState>({
    element: null,
    rect: null,
    sectionType: "",
  });

  // Single instance flag to track if we're handling a click
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  const getRect = (el: HTMLElement) => el.getBoundingClientRect();

  const isTopComponent = useCallback((rect: DOMRect) => {
    return rect.top <= OUTLINE_CONSTANTS.TOP_THRESHOLD;
  }, []);

  const updateOutlineState = useCallback(
    (
      element: HTMLElement | null,
      setState: React.Dispatch<React.SetStateAction<OutlineState>>
    ) => {
      if (!element) {
        setState({ element: null, rect: null, sectionType: "" });
        return;
      }
      setState({
        element,
        rect: getRect(element),
        sectionType:
          element.getAttribute("data-section-type") ||
          OUTLINE_CONSTANTS.DEFAULT_SECTION_TEXT,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled || isProcessingClick) return;

      const target = event.target as HTMLElement;
      const sectionElement = target.closest(
        "[data-section-type]"
      ) as HTMLElement | null;

      if (sectionElement && sectionElement !== hovered.element) {
        updateOutlineState(sectionElement, setHovered);
      } else if (!sectionElement) {
        updateOutlineState(null, setHovered);
      }
    },
    [enabled, hovered.element, updateOutlineState, isProcessingClick]
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      // Set processing flag to prevent concurrent events
      setIsProcessingClick(true);

      const target = event.target as HTMLElement;
      const sectionElement = target.closest(
        "[data-section-type]"
      ) as HTMLElement | null;

      if (!sectionElement) {
        // Clear selection if clicking outside sections
        updateOutlineState(null, setSelected);
      } else if (selected.element === sectionElement) {
        // Toggle selection off if clicking the same element
        updateOutlineState(null, setSelected);
      } else {
        // Set new selection immediately
        updateOutlineState(sectionElement, setSelected);

        // Dispatch a custom event to notify other components about section selection
        window.dispatchEvent(
          new CustomEvent("section-selected", {
            detail: {
              sectionId: sectionElement.getAttribute("data-section-id"),
              sectionType: sectionElement.getAttribute("data-section-type"),
            },
          })
        );
      }

      // Clear hover state to avoid competing with selection
      updateOutlineState(null, setHovered);

      // Reset processing flag after a short delay
      setTimeout(() => {
        setIsProcessingClick(false);
      }, 50);
    },
    [enabled, selected.element, updateOutlineState]
  );

  const handleScrollOrResize = useCallback(() => {
    if (selected.element) {
      updateOutlineState(selected.element, setSelected);
    }
    if (hovered.element) {
      updateOutlineState(hovered.element, setHovered);
    }
  }, [selected.element, hovered.element, updateOutlineState]);

  const handleMouseLeave = useCallback(() => {
    if (!isProcessingClick) {
      updateOutlineState(null, setHovered);
    }
  }, [updateOutlineState, isProcessingClick]);

  // Clear processing flag after timeout as a safety measure
  useEffect(() => {
    if (isProcessingClick) {
      const timer = setTimeout(() => {
        setIsProcessingClick(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isProcessingClick]);

  return {
    hovered,
    selected,
    isTopComponent,
    handlers: {
      handleMouseMove,
      handleClick,
      handleScrollOrResize,
      handleMouseLeave,
    },
  };
};
