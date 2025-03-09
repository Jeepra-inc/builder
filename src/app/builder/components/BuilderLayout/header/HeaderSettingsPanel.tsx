// HeaderSettingsPanel.tsx
"use client";
import React, { useState, useEffect, ReactElement } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
} from "./settings";

interface HeaderSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  onSelectPreset?: (preset: string) => void;
  currentPreset?: string;
  contentRef?: any;
  onSettingSelect?: string;
}

interface ClickableItemProps {
  title: string;
  onClick: () => void;
}

const ClickableItem: React.FC<ClickableItemProps> = ({ title, onClick }) => (
  <>
    <div
      className="px-4 py-3 text-sm font-semibold text-zinc-600 cursor-pointer hover:bg-zinc-100 transition-colors"
      onClick={onClick}
    >
      {title}
    </div>
    <Separator />
  </>
);

type SettingsComponents = {
  layouts: (props: any) => ReactElement;
  topBar: (props: any) => ReactElement;
  headerMain: (props: any) => ReactElement;
  headerBottom: (props: any) => ReactElement;
  search: (props: any) => ReactElement;
  buttons: (props: any) => ReactElement;
  social: (props: any) => ReactElement;
  html: (props: any) => ReactElement;
  account: (props: any) => ReactElement;
  navIcon: (props: any) => ReactElement;
  contact: (props: any) => ReactElement;
  [key: string]: (props: any) => ReactElement;
};

export function HeaderSettingsPanel({
  settings = {},
  onUpdateSettings,
  onSelectPreset,
  currentPreset,
  contentRef,
  onSettingSelect,
}: HeaderSettingsPanelProps) {
  const [currentView, setCurrentView] = useState<string>("main");
  const [selectedSetting, setSelectedSetting] = useState<string | undefined>(
    onSettingSelect
  );

  useEffect(() => {
    if (onSettingSelect) {
      setSelectedSetting(onSettingSelect);
    }
  }, [onSettingSelect]);

  const handleBackClick = () => {
    if (currentView !== "main") {
      setCurrentView("main");
      setSelectedSetting(undefined);
    }
  };

  const items = [
    { title: "Layouts", view: "layouts" },
    { title: "Top Bar", view: "topBar" },
    { title: "Main Bar", view: "headerMain" },
    { title: "Bottom Bar", view: "headerBottom" },
    { title: "Search", view: "search" },
    { title: "Navigation Icon", view: "navIcon" },
    { title: "Account", view: "account" },
    { title: "Buttons", view: "buttons" },
    { title: "Social Icons", view: "social" },
    { title: "HTML Blocks", view: "html" },
    { title: "Contact", view: "contact" },
  ];

  const settingsComponents: SettingsComponents = {
    layouts: HeaderLayoutsPanel,
    topBar: TopBarSettingsPanel,
    headerMain: HeaderMainSettings,
    headerBottom: HeaderBottomSettings,
    search: HeaderSearchSettings,
    account: HeaderAccountSettings,
    buttons: HeaderButtonSettings,
    social: HeaderSocialSettings,
    html: HeaderHtmlSettings,
    navIcon: HeaderNavIconSettings,
    contact: HeaderContactSettings,
  };

  const currentItem = items.find((item) => item.view === currentView);
  const panelTitle = selectedSetting
    ? `${currentItem?.title} - ${selectedSetting}`
    : currentItem?.title || "Header Settings";

  const renderSettingsPanel = () => {
    // Handle main view
    if (currentView === "main") {
      // Debug info
      console.log("HeaderSettingsPanel: Rendering main view", {
        itemCount: items.length,
        hasNavIcon: items.some((item) => item.view === "navIcon"),
      });

      // Main view shows the list of setting options
      return (
        <div>
          {items.map((item, index) => (
            <ClickableItem
              key={`${item.view}_${index}`}
              title={item.title}
              onClick={() => setCurrentView(item.view)}
            />
          ))}
        </div>
      );
    }

    // Special case for HTML settings with a selected block
    if (currentView === "html" && selectedSetting) {
      return (
        <HeaderHtmlSettings
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          contentRef={contentRef}
          selectedSetting={selectedSetting}
        />
      );
    }

    // Special case for Button settings
    if (currentView === "buttons") {
      return (
        <HeaderButtonSettings
          settings={settings}
          selectedSetting={selectedSetting}
          onUpdateSettings={onUpdateSettings}
          contentRef={contentRef}
        />
      );
    }

    // Default rendering for other components
    const Component =
      settingsComponents[currentView as keyof SettingsComponents];
    if (Component) {
      // For the layouts panel, pass the currentPreset prop
      if (currentView === "layouts") {
        return (
          <Component
            settings={settings}
            selectedSetting={selectedSetting}
            onSelectPreset={onSelectPreset}
            onUpdateSettings={onUpdateSettings}
            contentRef={contentRef}
            currentPreset={currentPreset}
          />
        );
      }

      // For other components
      return (
        <Component
          settings={settings}
          selectedSetting={selectedSetting}
          onSelectPreset={onSelectPreset}
          onUpdateSettings={onUpdateSettings}
          contentRef={contentRef}
        />
      );
    }

    // Fallback - should never reach here
    return <div>No settings available for this option</div>;
  };

  return (
    <ScrollArea className="h-full w-full rounded-md">
      <>
        {/* Main Panel Heading with increased specificity and z-index */}
        <div
          className="bg-white sticky top-0 z-50 border-b border-gray-200 !mb-2"
          style={{ position: "sticky" }}
        >
          <h2 className="px-4 py-3 text-lg font-semibold text-gray-800 bg-white">
            Header Settings
          </h2>
          {currentView !== "main" && (
            <>
              <div className="px-4 py-2 flex text-sm font-medium items-center gap-2 bg-gray-50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleBackClick}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {panelTitle}
              </div>
              <Separator />
            </>
          )}
        </div>
        {renderSettingsPanel()}
      </>
    </ScrollArea>
  );
}
