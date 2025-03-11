export interface HeaderLayout {
  [key: string]: string[] | undefined;
  top_left: string[];
  top_center: string[];
  top_right: string[];
  middle_left: string[];
  middle_center: string[];
  middle_right: string[];
  bottom_left: string[];
  bottom_center: string[];
  bottom_right: string[];
  available?: string[];
}

export class LayoutSettings {
  sticky: boolean = false; // initializing with a default value
  maxWidth: string = "";
  currentPreset?: string;
  containers?: HeaderLayout;
}

export interface HeaderSettings {
  theme?: string;
  layout?: LayoutSettings;
  html_block_1?: string;
  html_block_2?: string;
  html_block_3?: string;
  html_block_4?: string;
  html_block_5?: string;
  topBarVisible?: boolean;
  topBarHeight?: number;
  showTopBarButton?: boolean;
  topBarColorScheme?: string;
  mainBarColorScheme?: string; // Added for main section
  bottomBarColorScheme?: string; // Added for bottom section
  bottomEnabled?: boolean; // Added for bottom section visibility
  topBarNavStyle?: "style1" | "style2" | "style3";
  topBarTextTransform?: "uppercase" | "capitalize" | "lowercase";
  logo?: { text?: string; showText?: boolean; image?: string; size?: string };
  lastSelectedSetting?: string | null; // Track the last selected setting
  lastSelectedSubmenu?: string | null; // Track the last selected submenu
  showAccount?: boolean; // Whether to show the account widget
  account?: {
    showText?: boolean;
    text?: string;
    showIcon?: boolean;
    style?: string;
    dropdownEnabled?: boolean;
    loginEnabled?: boolean;
    registerEnabled?: boolean;
    loginUrl?: string;
    registerUrl?: string;
    iconSize?: string;
    iconStyle?: string; // New property for icon style variants
  };
  contact?: {
    show?: boolean;
    email?: string;
    emailLabel?: string;
    phone?: string;
    location?: string;
    locationLabel?: string;
    openHours?: string;
    hoursDetails?: string;
  };
  navigation?: {
    menuType: string;
    items: any[];
  };
  search?: {
    show: boolean;
    type: string;
    placeholder?: string;
    rounded?: number;
    showText: boolean;
    behavior: string;
    design: string;
    style?: string;
    shape?: string;
    showIcon?: boolean;
    iconPosition?: string;
    iconColor?: string;
    iconSize?: string;
    fontSize?: string;
    textColor?: string;
    width?: string;
    showButton?: boolean;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  navIcon?: {
    show: boolean;
    type: string; // hamburger, dots, chevron, etc.
    showText: boolean;
    text: string;
    position: string; // left, right
    drawerEffect: string; // slide, fade, push
    drawerDirection: string; // left, right, top
    iconSize: string;
    iconColor?: string;
    textColor?: string;
  };
}

export interface HeaderProps {
  settings?: HeaderSettings;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Export a type for the HTML content map
export type HTMLContentMapType = Record<string, string>;
