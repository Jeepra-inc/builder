// -- File: types.ts --
import { ReactNode, ReactElement, ReactNode as ReactNodeType } from "react";
import { DivideIcon as LucideIcon } from "lucide-react";
import { GlobalSettings } from "./utils/settingsStorage";

export enum SectionType {
  Text = "text",
  Banner = "banner",
  NewBanner = "newBanner",
  ModernBanner = "modernBanner",
  Hero = "hero1",
  Accordion = "accordion",
  Multicolumn = "multicolumn",
  Card = "card",
  Heronew = "hero",
}

export interface Section {
  id: string;
  type: SectionType;
  label?: string;
  content?: Record<string, any>;
  settings: {
    [key: string]: any;
    items?: {
      id: string;
      title: string;
      content: string;
      settings?: {
        label: string;
        description: string;
      };
    }[];
    title?: string;
    subtitle?: string;
    image?: string;
  };
  props?: Record<string, any>;
  isVisible?: boolean;
}

export interface SectionSchema {
  name: string;
  type: string;
  category?: string;
  schema: SettingField[];
  thumbnail?: string;
  settings?: Record<string, any>;
}

export interface SettingField<T = any> {
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "url"
    | "password"
    | "color"
    | "image"
    | "file"
    | "range"
    | "select"
    | "multiselect"
    | "checkbox"
    | "radio"
    | "switch"
    | "date"
    | "time"
    | "datetime";

  id: string;
  label: string;
  placeholder?: string;
  description?: string;
  subtitle?: string;
  image?: string;
  default?: T;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  options?: Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  of?: any[];
}

export interface SectionComponentProps {
  section: Section;
  isEditing?: boolean;
  isSelected?: boolean;
  className?: string;
  "data-section-type"?: SectionType;
  onUpdateSection?: (updates: Partial<Section>) => void;
  onSelectAccordionItem?: (itemId: string | null) => void;
  schema?: SectionSchema;
}

export interface Theme {
  id: string;
  name: string;
  sections: {
    [key: string]: {
      name: string;
      settings?: Record<string, any> | any[];
    };
  };
}

export interface Field {
  id: string;
  type: string;
  label: string;
  default: any;
}

export interface Setting {
  id: string;
  type: string;
  label: string;
  options?: Array<{ value: string; label: string }>;
  default: any;
}

export type ViewportSize = "mobile" | "tablet" | "desktop" | "fullscreen";

export type ActiveSidebar =
  | "layers"
  | "settings"
  | "global-settings"
  | "header-settings"
  | "footer-settings"
  | null;

export interface BannerSettings {
  title: string;
  description: string;
  textAlignment: "left" | "center" | "right";
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: "primary" | "secondary" | "outline";
}

export interface TopBarProps {
  viewportSize: ViewportSize;
  onViewportChange: (size: ViewportSize) => void;
  onUndo: () => void;
  onRedo: () => void;
  sections?: Section[];
  onImportSections?: (sections: Section[]) => void;
}

export interface SidebarButton {
  type: Exclude<ActiveSidebar, null>;
  icon: React.ElementType;
  tooltip: string;
}

export interface NarrowSidebarButtonsProps {
  active: ActiveSidebar;
  onToggle: (type: ActiveSidebar) => void;
  onOpenGlobalSettings?: () => void;
}

export interface SortableItemProps {
  section: Section;
  onHover: (id: string | null) => void;
  onSelectSection?: (id: string) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onToggleVisibility: (section: Section) => void;
  isOverlay?: boolean;
  isDragging?: boolean;
  className?: string;
  index?: number;
  selectedSectionId?: string | null;
}

export interface ExtendedSortableArguments {
  id: string;
  activationConstraint?: {
    type: "pointer" | "touch";
    activationMethod?: "pointer" | "touch";
  };
}

export interface ActionButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export interface SortableLayersPanelProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onHoverSection: (id: string | null) => void;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  contentRef: React.RefObject<HTMLIFrameElement | null>;
}

export interface AddSectionButtonsProps {
  availableSections: any[];
  onAddSection: (sectionType: any) => void;
}

export interface AddSectionPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popoverTriggerRef: React.RefObject<HTMLButtonElement | null>;
  popoverContentRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNodeType;
  availableSections: any[];
  onAddSection: (sectionType: any) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  modal?: boolean;
}

export interface IframeMessage {
  type: string;
  section?: Section;
  index?: number;
  scrollToSection?: boolean;
  sectionId?: string;
  isVisible?: boolean;
  sections?: Section[];
  source?: string;
  moveInfo?: {
    sectionId: string;
    oldIndex: number;
    newIndex: number;
  };
}

export interface IframeContentProps {
  isDragging: boolean;
  viewportSize: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export interface PageBuilderLayoutProps {
  leftSidebar?: ReactNodeType;
  content?: ReactNodeType;
  rightSidebar?: ReactNodeType;
  isLeftSidebarOpen: boolean;
}

export interface NarrowSidebarProps {
  screenWidth: number;
  viewportSize: string;
  activeNarrowSidebar: ActiveSidebar | null;
  toggleNarrowSidebar: (type: ActiveSidebar) => void;
  handleOpenGlobalSettings: () => void;
  onHeaderClick?: () => void; // Add this line
}

export interface SidebarLeftProps {
  sections: Section[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onHoverSection: (id: string | null) => void;
  contentRef: React.RefObject<HTMLIFrameElement | null>;
  toggleNarrowSidebar: (sidebar: ActiveSidebar) => void;
  settingsPanelRef: React.RefObject<HTMLDivElement | null>; // Ensure it's not undefined
  activeSubmenu?: string | null;
  headerSettings?: any; // Add headerSettings to the props
}

export interface SectionPadding {
  top: number;
  bottom: number;
}

export interface SectionUpdate {
  settings?: {
    padding?: SectionPadding;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SectionSettingsPanelProps {
  selectedSectionId: string | null;
  sections: Section[];
  contentRef: React.RefObject<HTMLIFrameElement | null>;
  settingsPanelRef: React.RefObject<HTMLDivElement | null>; // Add this line
}

export interface SidebarSection {
  title: string;
  component: ReactNode;
  showWhen: boolean;
}

export interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
}

export interface ViewportConfig {
  size: ViewportSize;
  icon: React.ElementType;
  tooltip: string;
}

export interface ViewportSizeControlsProps {
  currentSize: ViewportSize;
  onChange: (size: ViewportSize) => void;
}

export const OUTLINE_CONSTANTS = {
  TOP_THRESHOLD: 10,
  HOVER_BORDER: "1px solid #4A90E2",
  SELECTED_BORDER: "3px solid #4A90E2",
  HOVER_BG: "transparent",
  SELECTED_BG: "rgba(74, 144, 226, 0.1)",
  HOVER_LABEL_BG: "#4A90E2",
  SELECTED_LABEL_BG: "#0070f3",
  Z_INDEX: 9999,
  DEFAULT_SECTION_TEXT: "Section",
  BORDER_RADIUS: "4px",
} as const;

export const OUTLINE_LABEL_STYLE = {
  position: "absolute",
  color: "white",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: "bold",
  pointerEvents: "none",
} as const;

export interface AddSectionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAddSection: (sectionType: SectionType) => void;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  buttonText?: string;
  showButtonText?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export interface SectionCardProps {
  type: SectionType;
  name: string;
  placeholderImage?: string;
  onClick: (type: SectionType) => void;
}

export interface GroupTabProps {
  group: string;
  isActive: boolean;
  onSelect: (group: string) => void;
}

export interface ComponentOutlineProps {
  enabled?: boolean;
}

export interface OutlineState {
  element: HTMLElement | null;
  rect: DOMRect | null;
  sectionType: string;
}

export interface OutlineLabelProps {
  sectionType: string;
  isSelected?: boolean;
  style: React.CSSProperties;
}

export interface OutlineBoxProps {
  rect: DOMRect | null;
  isSelected?: boolean;
  children: React.ReactNode;
}

export interface InputComponentProps<T> {
  value: T | null;
  onChange: (val: T) => void;
  [key: string]: any;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface RangeProps extends InputComponentProps<number> {
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectProps extends InputComponentProps<string> {
  options?: SelectOption[];
}

export interface SectionSettingsRendererProps {
  section: Section;
  onUpdateSection: (updates: Record<string, any>) => void;
}

export interface FieldWrapperProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

export interface SectionControlsProps {
  sectionId: string;
  index: number;
  totalSections: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  isVisible?: boolean;
}

export interface ControlButtonProps {
  icon: typeof LucideIcon;
  onClick: () => void;
  tooltip: string;
  className?: string;
}

export const SETTINGS_CONSTANTS = {
  DEFAULT_PADDING: 20,
  INPUT_STYLES: {
    BASE: "block w-full p-2 border border-gray-300 rounded-lg",
    LABEL: "block text-sm font-medium text-gray-700 mb-1",
  },
} as const;
