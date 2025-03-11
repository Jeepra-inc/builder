/**
 * Type definitions for the iframe component
 */

import { SectionType } from "@/app/builder/types";
import {
  DrawerEffect,
  DrawerDirection,
  NavIconType,
  IconPosition,
} from "./utils/drawerTypes";

/**
 * Header settings interface for the iframe
 */
export interface HeaderSettings {
  /**
   * Logo settings
   */
  logo?: {
    /** Logo text */
    text: string;
    /** Whether to show text */
    showText: boolean;
    /** Optional image URL */
    image?: string;
    /** Logo size (small, medium, large, xlarge) */
    size?: string;
  };

  /**
   * Navigation settings
   */
  navigation?: {
    /** Type of menu */
    menuType: string;
    /** Menu items */
    items: any[];
  };

  /**
   * Layout settings
   */
  layout?: {
    /** Whether header is sticky */
    sticky: boolean;
    /** Max width for the header */
    maxWidth: string;
    /** Current preset applied */
    currentPreset: string;
    /** Container layout configuration */
    containers: {
      top_left: any[];
      top_center: any[];
      top_right: any[];
      middle_left: any[];
      middle_center: any[];
      middle_right: any[];
      bottom_left: any[];
      bottom_center: any[];
      bottom_right: any[];
      available: any[];
    };
  };

  /**
   * Search settings
   */
  search?: {
    /** Whether to show search */
    show: boolean;
    /** Search type (form, dropdown, etc.) */
    type: string;
    /** Whether to show text with search */
    showText: boolean;
    /** Search behavior (inline, overlay, etc.) */
    behavior: string;
    /** Search design (standard, minimal, etc.) */
    design: string;
    /** Placeholder text */
    placeholder?: string;
    /** Border radius */
    rounded?: number;
    /** Style variant */
    style?: string;
    /** Shape variant */
    shape?: string;
    /** Whether to show icon */
    showIcon?: boolean;
    /** Position of icon */
    iconPosition?: string;
    /** Color of icon */
    iconColor?: string;
    /** Size of icon */
    iconSize?: string;
    /** Font size */
    fontSize?: string;
    /** Text color */
    textColor?: string;
    /** Width of search field */
    width?: string;
    /** Whether to show button */
    showButton?: boolean;
    /** Button text */
    buttonText?: string;
    /** Button color */
    buttonColor?: string;
    /** Button text color */
    buttonTextColor?: string;
    /** Allow additional properties */
    [key: string]: any;
  };

  /**
   * Account settings
   */
  account?: {
    /** Whether to show text */
    showText: boolean;
    /** Account text */
    text: string;
    /** Whether to show icon */
    showIcon: boolean;
    /** Style variant */
    style?: string;
    /** Icon style */
    iconStyle?: string;
    /** Icon size */
    iconSize?: string;
    /** Whether dropdown is enabled */
    dropdownEnabled?: boolean;
    /** Whether login is enabled */
    loginEnabled?: boolean;
    /** Whether register is enabled */
    registerEnabled?: boolean;
    /** Allow additional properties */
    [key: string]: any;
  };

  /**
   * Contact information settings
   */
  contact?: {
    /** Whether to show contact info */
    show: boolean;
    /** Email address */
    email?: string;
    /** Email label */
    emailLabel?: string;
    /** Phone number */
    phone?: string;
    /** Location */
    location?: string;
    /** Location label */
    locationLabel?: string;
    /** Open hours */
    openHours?: string;
    /** Hours details */
    hoursDetails?: string;
  };

  /**
   * Navigation icon settings
   */
  navIcon?: {
    /** Whether to show navigation icon */
    show: boolean;
    /** Icon type (hamburger, chevron, dots, justify) */
    type: NavIconType;
    /** Whether to show text */
    showText: boolean;
    /** Button text */
    text: string;
    /** Icon position (left or right of text) */
    position: IconPosition;
    /** Drawer effect (slide, fade, push) */
    drawerEffect: DrawerEffect;
    /** Drawer direction (left, right, top) */
    drawerDirection: DrawerDirection;
    /** Icon size */
    iconSize: string;
    /** Icon color */
    iconColor?: string;
    /** Text color */
    textColor?: string;
  };

  /** Allow additional properties */
  [key: string]: any;
}

/**
 * Footer settings interface
 */
export interface FooterSettings {
  content?: {
    copyright?: string;
    description?: string;
  };
  links?: {
    items: { text: string; url: string }[];
  };
  layout?: {
    maxWidth: string;
    showSocials: boolean;
    multiColumn: boolean;
  };
  [key: string]: any;
}

/**
 * Global styles settings interface
 */
export interface GlobalStyles {
  /** Branding settings */
  branding: {
    /** Primary color */
    primaryColor: string;
    /** Secondary color */
    secondaryColor: string;
    /** Background color */
    backgroundColor: string;
    /** Text color */
    textColor: string;
    /** Logo URL */
    logoUrl?: string;
    /** Logo for header */
    logoForHeader?: string;
    /** Logo size for header */
    logoSizeForHeader?: string;
  };

  /** Typography settings */
  typography: {
    /** Heading font with optional weight (e.g., 'Roboto:700') */
    headingFont: string;
    /** Body font with optional weight */
    bodyFont: string;
    /** Heading color */
    headingColor: string;
    /** Heading size scale (percentage) */
    headingSizeScale: number;
    /** Body size scale (percentage) */
    bodySizeScale: number;
  };

  /** Custom CSS */
  customCSS?: string;
}

/**
 * Settings for the iframe page
 */
export interface IframeSettings {
  /** Header settings */
  headerSettings: HeaderSettings;
  /** Footer settings */
  footerSettings: FooterSettings;
  /** Global styles */
  globalStyles: GlobalStyles;
  /** Page sections */
  sections: Section[];
}

/**
 * Section interface
 */
export interface Section {
  /** Unique ID for the section */
  id: string;
  /** Section type */
  type: SectionType;
  /** Section content */
  content: any[];
  /** Section settings */
  settings: Record<string, any>;
  /** Optional styles for the section */
  styles?: Record<string, any>;
  /** Whether the section is visible */
  isVisible?: boolean;
}
