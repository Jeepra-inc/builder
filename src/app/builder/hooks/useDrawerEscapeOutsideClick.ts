import { useEffect } from "react";

/**
 * Custom hook to handle Escape key press and outside clicks for drawers
 *
 * @param isOpen - Whether the drawer is open
 * @param onClose - Function to call to close the drawer
 * @param drawerSelector - CSS selector for the drawer element
 * @param excludeOutsideClick - Whether to exclude outside click handling (default: false)
 */
export const useDrawerEscapeOutsideClick = (
  isOpen: boolean,
  onClose: () => void,
  drawerSelector: string,
  excludeOutsideClick: boolean = false
) => {
  useEffect(() => {
    // Handler for Escape key press
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Handler for clicking outside the drawer
    const handleOutsideClick = (event: MouseEvent) => {
      // Get the drawer element
      const drawerEl = document.querySelector(drawerSelector);

      // If click is outside the drawer, close it
      if (drawerEl && !drawerEl.contains(event.target as Node)) {
        onClose();
      }
    };

    // Only add event listeners if drawer is open
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);

      if (!excludeOutsideClick) {
        document.addEventListener("mousedown", handleOutsideClick);
      }

      // Clean up event listeners
      return () => {
        document.removeEventListener("keydown", handleEscapeKey);

        if (!excludeOutsideClick) {
          document.removeEventListener("mousedown", handleOutsideClick);
        }
      };
    }
  }, [isOpen, onClose, drawerSelector, excludeOutsideClick]);
};
