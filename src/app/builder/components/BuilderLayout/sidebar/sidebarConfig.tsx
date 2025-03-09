import {
  HeaderLayoutsPanel,
  TopBarSettingsPanel,
  HeaderMainSettings,
  HeaderBottomSettings,
  HeaderSearchSettings,
  HeaderButtonSettings,
  HeaderSocialSettings,
  HeaderHtmlSettings,
  HeaderAccountSettings,
  HeaderNavIconSettings,
  HeaderContactSettings,
} from "@/app/builder/components/BuilderLayout/header/settings";
import { FooterSettingsPanel } from "@/app/builder/components/BuilderLayout/footer/FooterSettingsPanel";
import { SortableLayersPanel } from "@/app/builder/components/BuilderLayout/SortableLayersPanel";
import { SectionSettingsPanel } from "@/app/builder/components/BuilderLayout/SectionSettingsPanel";
import {
  DesignIcon,
  HeaderIcon,
  FooterIcon,
  GlobalSettingsIcon,
  SEOIcon,
  PageSettingIcon,
  LayoutPanelIcon,
  PanelRightIcon,
  TypeIcon,
  ImageIcon,
  SettingsIcon,
  MenuIcon,
  PhoneIcon,
  UserIcon,
  AppWindowIcon,
} from "./sidebarIcons";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSettingsPanel } from "../GlobalSettings/GlobalSettingsPanel";
import { SEOSettingsPanel } from "./SEOSettingsPanel";
import { PageSettingsPanel } from "./PageSettingsPanel";

export const createMenuConfig = (
  localSections: any[],
  selectedSectionId: string | null,
  onSelectSection: (sectionId: string) => void,
  onHoverSection: (sectionId: string | null) => void,
  contentRef: React.RefObject<HTMLIFrameElement>,
  setLocalSections: (sections: any[]) => void,
  toggleNarrowSidebar: (panel: string) => void,
  sectionTitle: string,
  sections: any[],
  settingsPanelRef: React.RefObject<HTMLDivElement>,
  handleSelectPreset: (presetId: string) => void,
  currentPreset: string
) => {
  const headerMenuItems = [
    {
      title: "Layout",
      component: HeaderLayoutsPanel,
      componentProps: {
        onSelectPreset: handleSelectPreset,
        currentPreset,
      },
      icon: LayoutPanelIcon,
      parent: "Header",
    },
    {
      title: "Top Bar Setting",
      component: TopBarSettingsPanel,
      icon: AppWindowIcon,
      parent: "Header",
    },
    {
      title: "Header Main Setting",
      component: HeaderMainSettings,
      icon: TypeIcon,
      parent: "Header",
    },
    {
      title: "Header Bottom Setting",
      component: HeaderBottomSettings,
      icon: ImageIcon,
      parent: "Header",
    },
    {
      title: "Header Search Setting",
      component: HeaderSearchSettings,
      icon: SettingsIcon,
      parent: "Header",
    },
    {
      title: "Navigation Icon",
      component: HeaderNavIconSettings,
      icon: MenuIcon,
      parent: "Header",
    },
    {
      title: "Contact",
      component: HeaderContactSettings,
      icon: PhoneIcon,
      parent: "Header",
    },
    {
      title: "Account Setting",
      component: HeaderAccountSettings,
      icon: UserIcon,
      parent: "Header",
    },
    {
      title: "Buttons",
      component: HeaderButtonSettings,
      icon: ImageIcon,
      parent: "Header",
    },
    {
      title: "Social",
      component: HeaderSocialSettings,
      icon: LayoutPanelIcon,
      parent: "Header",
    },
    {
      title: "HTML",
      component: HeaderHtmlSettings,
      icon: AppWindowIcon,
      parent: "Header",
    },
  ];

  const footerMenuItems = [
    {
      title: "Footer Settings",
      component: FooterSettingsPanel,
      icon: PanelRightIcon,
      parent: "Footer",
    },
  ];

  const initialMenu = {
    title: "Main Menu",
    items: [
      {
        title: "Design",
        component: SortableLayersPanel,
        componentProps: {
          sections: localSections,
          selectedSectionId,
          onSelectSection: (sectionId: string) => {
            onSelectSection(sectionId);
            window.dispatchEvent(
              new CustomEvent("switchTab", {
                detail: { targetTab: "Section Settings" },
              })
            );
          },
          onHoverSection,
          contentRef,
          setSections: setLocalSections,
        },
        icon: DesignIcon,
        onClick: () => toggleNarrowSidebar("layers"),
      },
      {
        title: "Header",
        subMenu: headerMenuItems,
        icon: HeaderIcon,
        onClick: () => toggleNarrowSidebar("header-settings"),
      },
      {
        title: "Footer",
        subMenu: footerMenuItems,
        icon: FooterIcon,
        onClick: () => toggleNarrowSidebar("layers"),
      },
      {
        title: "Global Settings",
        component: GlobalSettingsPanel,
        icon: GlobalSettingsIcon,
        onClick: () => toggleNarrowSidebar("layers"),
      },
      {
        title: "SEO",
        component: SEOSettingsPanel,
        icon: SEOIcon,
        onClick: () => toggleNarrowSidebar("layers"),
      },
      {
        title: "Page Settings",
        component: PageSettingsPanel,
        icon: PageSettingIcon,
        onClick: () => toggleNarrowSidebar("layers"),
      },
      {
        title: "Section Settings",
        component: () => (
          <div>
            <div className="flex items-center gap-2 p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("switchTab", {
                      detail: { targetTab: "Design" },
                    })
                  );
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-md font-semibold">{sectionTitle}</span>
            </div>
            <SectionSettingsPanel
              selectedSectionId={selectedSectionId}
              sections={sections}
              contentRef={contentRef}
              settingsPanelRef={settingsPanelRef}
            />
          </div>
        ),
        icon: AppWindowIcon,
        hidden: true,
      },
    ],
  };

  return { headerMenuItems, footerMenuItems, initialMenu };
};
