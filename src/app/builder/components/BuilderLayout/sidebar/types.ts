export interface PresetLayout {
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
  [key: string]: any[] | undefined;
}

export interface PresetLayouts {
  [key: string]: PresetLayout;
}

export interface SidebarLeftProps {
  sections: any[];
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  onHoverSection: (sectionId: string | null) => void;
  contentRef: React.RefObject<HTMLIFrameElement>;
  toggleNarrowSidebar: (panel: string) => void;
  settingsPanelRef: React.RefObject<HTMLDivElement>;
  activeSubmenu: string | null;
  headerSettings?: any;
}
