"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  Type,
  Image,
  Settings,
  Layers,
  LayoutPanelLeft,
  PanelRight,
} from "lucide-react";
import { SectionSettingsPanel } from "@/app/builder/components/BuilderLayout/SectionSettingsPanel";
import { GlobalSettingsPanel } from "@/app/builder/components/BuilderLayout/GlobalSettings/GlobalSettingsPanel";
import { SortableLayersPanel } from "@/app/builder/components/BuilderLayout/SortableLayersPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MultiLevelSidebar from "../common/multiLevelSidebar";
import {
  GalleryVertical,
  PanelTop,
  PanelBottom,
  SlidersHorizontal,
  AppWindow,
} from "lucide-react";
import { HeaderLayoutsPanel } from "./header/settings/HeaderLayoutsPanel";
import { TopBarSettingsPanel } from "./header/settings/TopBarSettingsPanel";
import { HeaderMainSettings } from "./header/settings/HeaderMainSettings";
import { HeaderBottomSettings } from "./header/settings/HeaderBottomSettings";
import { HeaderNavigationSettings } from "./header/settings/HeaderNavigationSettings";
import { HeaderSearchSettings } from "./header/settings/HeaderSearchSettings";
import { HeaderButtonSettings } from "./header/settings/HeaderButtonSettings";
import { HeaderSocialSettings } from "./header/settings/HeaderSocialSettings";
import { HeaderHtmlSettings } from "./header/settings/HeaderHtmlSettings";
import { FooterSettingsPanel } from "./footer/FooterSettingsPanel";
import { SidebarLeftProps } from "@/app/builder/types";
import { HeaderSettingsPanel } from "./header/HeaderSettingsPanel";

const SECTION_SETTINGS_TAB = "Section Settings";

export function SidebarLeft({
  sections,
  selectedSectionId,
  onSelectSection,
  onHoverSection,
  contentRef,
  toggleNarrowSidebar,
  settingsPanelRef,
  activeSubmenu,
  headerSettings,
}: SidebarLeftProps) {
  const [localSections, setLocalSections] = useState(sections);
  const [currentSubmenu, setCurrentSubmenu] = useState<string | null>(
    activeSubmenu
  );
  const [selectedHeaderSetting, setSelectedHeaderSetting] = useState<
    string | null
  >(null);

  // Initialize currentPreset from headerSettings if available, otherwise default to preset1
  const [currentPreset, setCurrentPreset] = useState<string>(
    headerSettings?.layout?.currentPreset || "preset1"
  );

  // Update currentPreset when headerSettings changes
  useEffect(() => {
    if (headerSettings?.layout?.currentPreset) {
      setCurrentPreset(headerSettings.layout.currentPreset);
    }
  }, [headerSettings]);

  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const { targetTab, targetSubmenu } = event.detail;
      console.log("Switch tab event received:", { targetTab, targetSubmenu });

      if (targetTab === "Header") {
        setCurrentSubmenu(targetSubmenu);
        toggleNarrowSidebar("header-settings");
      } else if (targetTab === "Design") {
        setCurrentSubmenu(null);
      } else if (targetTab === "Section Settings") {
        toggleNarrowSidebar("settings");
      }
    };

    const handleHeaderSettingSelected = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      switch (event.data.type) {
        case "HEADER_SETTING_SELECTED":
          // Prevent any auto-save operations during setting selection
          event.preventDefault();
          setSelectedHeaderSetting(event.data.settingId);
          toggleNarrowSidebar("header-settings");

          // Find the appropriate submenu for this setting
          if (event.data.settingId?.startsWith("html_block_")) {
            setCurrentSubmenu("HTML");
          }
          break;

        case "HEADER_PRESET_LOADED":
          // Update the current preset state when the header loads a preset
          if (event.data.presetId) {
            setCurrentPreset(event.data.presetId);
          }
          break;

        case "GET_PRESET_DATA":
          // The iframe is requesting preset data
          // Import the preset layouts and send them back to the iframe
          import("./data/headerPresets")
            .then(({ presetLayouts }) => {
              const { presetId } = event.data;
              if (presetId && presetLayouts[presetId]) {
                // Update the current preset state
                setCurrentPreset(presetId);

                // Send the preset layout data to the iframe
                contentRef.current?.contentWindow?.postMessage(
                  {
                    type: "UPDATE_HEADER_LAYOUT",
                    presetId,
                    ...presetLayouts[presetId],
                  },
                  "*"
                );
              }
            })
            .catch((error) => {
              console.error("Error loading header presets:", error);
            });
          break;
      }
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener("message", handleHeaderSettingSelected);

    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener("message", handleHeaderSettingSelected);
    };
  }, [toggleNarrowSidebar, contentRef]);

  useEffect(() => {
    setCurrentSubmenu(activeSubmenu);
  }, [activeSubmenu]);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  // Fix the error by safely accessing the type property
  const sectionTitle =
    selectedSection && selectedSection.type
      ? `${selectedSection.type
          .charAt(0)
          .toUpperCase()}${selectedSection.type.slice(1)} Settings`
      : SECTION_SETTINGS_TAB;

  const handleMenuItemClick = useCallback(
    (item: any) => {
      const isHeaderSubmenuItem = item.parent === "Header";

      // Prevent any auto-save operations during menu item clicks
      if (!isHeaderSubmenuItem && item.title !== "Header") {
        toggleNarrowSidebar("layers");
        setCurrentSubmenu(null);
      } else {
        // For header-related items, just update the UI state
        toggleNarrowSidebar("header-settings");
      }

      if (item.onClick) {
        item.onClick();
      }
    },
    [toggleNarrowSidebar]
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      setCurrentPreset(presetId);

      // Send message to iframe to update the header layout
      contentRef.current?.contentWindow?.postMessage(
        {
          type: "SELECT_PRESET",
          presetId,
        },
        "*"
      );

      // Don't switch submenu - stay on current layout panel
      // This allows the user to see the change immediately without navigating away
    },
    [contentRef]
  );

  // const handleHeaderClose = useCallback(() => {
  //   toggleNarrowSidebar("layers");
  //   setCurrentSubmenu(null);

  //   window.dispatchEvent(
  //     new CustomEvent("switchTab", {
  //       detail: { targetTab: "Design" },
  //     })
  //   );
  // }, [toggleNarrowSidebar]);

  // const handleOpenLayoutPanel = useCallback(() => {
  //   toggleNarrowSidebar("header-settings");
  //   setCurrentSubmenu("Layout");
  // }, [toggleNarrowSidebar]);

  const headerMenuItems = [
    {
      title: "Layout",
      component: HeaderLayoutsPanel,
      componentProps: {
        onSelectPreset: handleSelectPreset,
        currentPreset,
      },
      icon: LayoutPanelLeft,
      parent: "Header",
    },
    {
      title: "Top Bar Setting",
      component: TopBarSettingsPanel,
      icon: AppWindow,
      parent: "Header",
    },
    {
      title: "Header Main Setting",
      component: HeaderMainSettings,
      icon: Type,
      parent: "Header",
    },
    {
      title: "Header Bottom Setting",
      component: HeaderBottomSettings,
      icon: Image,
      parent: "Header",
    },
    {
      title: "Header Navigation Setting",
      component: HeaderNavigationSettings,
      icon: PanelRight,
      parent: "Header",
    },
    {
      title: "Header Search Setting",
      component: HeaderSearchSettings,
      icon: Settings,
      parent: "Header",
    },
    {
      title: "Buttons",
      component: HeaderButtonSettings,
      icon: Layers,
      parent: "Header",
    },
    {
      title: "Social",
      component: HeaderSocialSettings,
      icon: LayoutPanelLeft,
      parent: "Header",
    },
    {
      title: "HTML",
      component: HeaderHtmlSettings,
      componentProps: { selectedSetting: selectedHeaderSetting },
      icon: AppWindow,
      parent: "Header",
    },
  ];

  const footerMenuItems = [
    {
      title: "Footer Settings",
      component: FooterSettingsPanel,
      icon: PanelRight,
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
                detail: { targetTab: SECTION_SETTINGS_TAB },
              })
            );
          },
          onHoverSection,
          contentRef,
          setSections: setLocalSections,
        },
        icon: GalleryVertical,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Header",
        subMenu: headerMenuItems,
        icon: PanelTop,
        onClick: () => {
          toggleNarrowSidebar("header-settings");
        },
      },
      {
        title: "Footer",
        subMenu: footerMenuItems,
        icon: PanelBottom,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Global Settings Panel",
        component: GlobalSettingsPanel,
        icon: SlidersHorizontal,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: SECTION_SETTINGS_TAB,
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
        icon: AppWindow,
        hidden: true,
      },
    ],
  };

  return (
    <ScrollArea className="h-full">
      <MultiLevelSidebar
        initialMenu={initialMenu}
        onNavigate={(item) => {
          console.log("MultiLevelSidebar: Navigated to:", item.title);
          setCurrentSubmenu(item.title);
        }}
        onBack={() => {
          console.log("MultiLevelSidebar: Went back");
          setCurrentSubmenu(null);
        }}
        onMenuItemClick={handleMenuItemClick}
        defaultSubmenu={currentSubmenu}
      />
    </ScrollArea>
  );
}
