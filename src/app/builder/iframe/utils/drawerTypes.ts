/**
 * Types related to drawer functionality
 */

/**
 * Represents the effect applied to a drawer when it opens and closes
 * - slide: The drawer slides in from outside the viewport
 * - fade: The drawer fades in/out
 * - push: The drawer pushes the main content when opening
 */
export type DrawerEffect = "slide" | "fade" | "push";

/**
 * Represents the direction from which the drawer appears
 * - left: The drawer appears from the left side
 * - right: The drawer appears from the right side
 * - top: The drawer appears from the top
 */
export type DrawerDirection = "left" | "right" | "top";

/**
 * Complete drawer type names combining effect and direction
 * Used for CSS class names and DOM references
 */
export type DrawerTypeName =
  | "slide-left"
  | "slide-right"
  | "slide-top"
  | "fade-left"
  | "fade-right"
  | "fade-top"
  | "push-left"
  | "push-right"
  | "push-top";

/**
 * Helper function to create a drawer type name from effect and direction
 */
export const getDrawerTypeName = (
  effect: DrawerEffect,
  direction: DrawerDirection
): DrawerTypeName => {
  return `${effect}-${direction}` as DrawerTypeName;
};

/**
 * Represents navigation icon types
 * - hamburger: Traditional three horizontal lines
 * - chevron: A chevron arrow
 * - dots: Three horizontal dots
 * - justify: Full width horizontal lines
 */
export type NavIconType = "hamburger" | "chevron" | "dots" | "justify";

/**
 * Position of the icon relative to any text
 */
export type IconPosition = "left" | "right";

/**
 * Settings related to the navigation icon that triggers the drawer
 */
export interface NavIconSettings {
  /**
   * Whether to show the navigation icon
   */
  show: boolean;

  /**
   * The type of icon to display
   */
  type: NavIconType;

  /**
   * Whether to show text next to the icon
   */
  showText: boolean;

  /**
   * The text to display
   */
  text: string;

  /**
   * Position of the icon relative to the text
   */
  position: IconPosition;

  /**
   * The effect to apply when opening the drawer
   */
  drawerEffect: DrawerEffect;

  /**
   * The direction from which the drawer should appear
   */
  drawerDirection: DrawerDirection;

  /**
   * Size of the icon in pixels
   */
  iconSize: string;

  /**
   * Color of the icon
   */
  iconColor?: string;

  /**
   * Color of the text
   */
  textColor?: string;
}

/**
 * Settings for the drawer element
 */
export interface DrawerSettings {
  /**
   * The effect to apply when opening/closing
   */
  effect: DrawerEffect;

  /**
   * The direction from which the drawer appears
   */
  direction: DrawerDirection;

  /**
   * Custom links to display in the drawer
   */
  links?: { text: string; url: string }[];
}
