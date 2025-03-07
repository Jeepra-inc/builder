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
  PanelTop,
  PanelBottom,
  SlidersHorizontal,
  AppWindow,
  AlignVerticalSpaceBetween,
} from "lucide-react";
import { SectionSettingsPanel } from "@/app/builder/components/BuilderLayout/SectionSettingsPanel";
import { GlobalSettingsPanel } from "@/app/builder/components/BuilderLayout/GlobalSettings/GlobalSettingsPanel";
import { SortableLayersPanel } from "@/app/builder/components/BuilderLayout/SortableLayersPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import MultiLevelSidebar from "../common/multiLevelSidebar";
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

// Create icon components with increased stroke width
const DesignIcon = (
  props: React.ComponentProps<typeof AlignVerticalSpaceBetween>
) => <AlignVerticalSpaceBetween strokeWidth={2} {...props} />;

const HeaderIcon = (props: React.ComponentProps<typeof PanelTop>) => (
  <PanelTop strokeWidth={2} {...props} />
);

const FooterIcon = (props: React.ComponentProps<typeof PanelBottom>) => (
  <PanelBottom strokeWidth={2} {...props} />
);

const GlobalSettingsIcon = (
  props: React.ComponentProps<typeof SlidersHorizontal>
) => <SlidersHorizontal strokeWidth={2} {...props} />;

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
          // Log for debugging
          console.log("HEADER_SETTING_SELECTED received:", event.data);

          // Prevent any auto-save operations during setting selection
          try {
            event.preventDefault();
          } catch (e) {
            // Ignore if not possible to prevent default
          }

          // Set the selected setting and open the sidebar
          setSelectedHeaderSetting(event.data.settingId);
          toggleNarrowSidebar("header-settings");

          // Find the appropriate submenu for this setting
          let submenuToSelect = event.data.submenu;

          if (!submenuToSelect) {
            // If no submenu specified, try to determine from settingId
            const settingId = event.data.settingId;

            // Determine submenu based on settingId patterns
            if (settingId?.startsWith("html_block_")) {
              submenuToSelect = "HTML";
            } else if (settingId === "logo") {
              submenuToSelect = "Header Main Setting";
            } else if (settingId === "mainMenu" || settingId === "topBarMenu") {
              submenuToSelect = "Header Navigation Setting";
            } else if (settingId === "search") {
              submenuToSelect = "Header Search Setting";
            } else if (settingId?.startsWith("button_")) {
              submenuToSelect = "Buttons";
            } else if (
              settingId === "social_icon" ||
              settingId === "followIcons"
            ) {
              submenuToSelect = "Social";
            } else if (settingId?.includes("top_") || settingId === "contact") {
              submenuToSelect = "Top Bar Setting";
            } else if (settingId?.includes("bottom_")) {
              submenuToSelect = "Header Bottom Setting";
            } else if (settingId?.includes("divider")) {
              submenuToSelect = "Header Main Setting";
            } else if (
              settingId === "account" ||
              settingId === "cart" ||
              settingId === "wishlist"
            ) {
              submenuToSelect = "Header Main Setting";
            }
          }

          // Set the submenu if we have one
          if (submenuToSelect) {
            console.log(
              `Setting submenu to ${submenuToSelect} for item ${event.data.settingId}`
            );
            setCurrentSubmenu(submenuToSelect);
          } else {
            console.log(
              `No submenu identified for ${event.data.settingId}, leaving at current submenu`
            );
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

    // Update the headerSettingsRequested event handler to be more robust
    const handleHeaderSettingsRequested = (event: CustomEvent) => {
      console.log("headerSettingsRequested event received:", event.detail);

      const { settingId, submenu, itemType } = event.detail;

      // Set the selected setting
      if (settingId) {
        setSelectedHeaderSetting(settingId);
        console.log(`Selected header setting: ${settingId}`);
      }

      // Open the header settings sidebar
      toggleNarrowSidebar("header-settings");

      // Determine the submenu to show
      let submenuToUse = submenu;

      // If no submenu was provided, try to infer from the item type or setting ID
      if (!submenuToUse) {
        if (settingId?.startsWith("html_block_")) {
          submenuToUse = "HTML";
        } else if (itemType) {
          // Logic to determine submenu from item type if needed
          if (itemType.includes("logo")) {
            submenuToUse = "Header Main Setting";
          } else if (itemType.includes("menu")) {
            submenuToUse = "Header Navigation Setting";
          } else if (itemType.includes("search")) {
            submenuToUse = "Header Search Setting";
          } else if (itemType.includes("button")) {
            submenuToUse = "Buttons";
          } else if (itemType.includes("social")) {
            submenuToUse = "Social";
          }
        }
      }

      // Set the submenu if we have one
      if (submenuToUse) {
        console.log(`Setting submenu to ${submenuToUse}`);
        setCurrentSubmenu(submenuToUse);
      } else if (settingId?.startsWith("html_block_")) {
        setCurrentSubmenu("HTML");
      }
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener("message", handleHeaderSettingSelected);
    window.addEventListener(
      "headerSettingsRequested",
      handleHeaderSettingsRequested as EventListener
    );

    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener("message", handleHeaderSettingSelected);
      window.removeEventListener(
        "headerSettingsRequested",
        handleHeaderSettingsRequested as EventListener
      );
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
        icon: DesignIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Header",
        subMenu: headerMenuItems,
        icon: HeaderIcon,
        onClick: () => {
          toggleNarrowSidebar("header-settings");
        },
      },
      {
        title: "Footer",
        subMenu: footerMenuItems,
        icon: FooterIcon,
        onClick: () => {
          toggleNarrowSidebar("layers");
        },
      },
      {
        title: "Global Settings Panel",
        component: GlobalSettingsPanel,
        icon: GlobalSettingsIcon,
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
