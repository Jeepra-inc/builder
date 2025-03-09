// This file adds the nav_icon to the available header items and provides helper functions

// Ensure the nav_icon gets added to the available items
export const ensureNavIconInAvailableItems = (
  availableItems: string[]
): string[] => {
  // If nav_icon isn't already in the array, add it
  if (!availableItems.includes("nav_icon")) {
    return [...availableItems, "nav_icon"];
  }
  return availableItems;
};

// Convert between the two naming conventions for nav icon
export const normalizeNavIconId = (id: string): string => {
  if (id === "navIcon") return "nav_icon";
  if (id === "nav_icon") return "nav_icon";
  return id;
};

export default ensureNavIconInAvailableItems;
