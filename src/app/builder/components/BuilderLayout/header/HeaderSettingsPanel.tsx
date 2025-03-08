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
  HeaderNavigationSettings,
  HeaderSearchSettings,
  HeaderButtonSettings,
  HeaderSocialSettings,
  HeaderHtmlSettings,
  HeaderAccountSettings,
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
  navigation: (props: any) => ReactElement;
  search: (props: any) => ReactElement;
  buttons: (props: any) => ReactElement;
  social: (props: any) => ReactElement;
  html: (props: any) => ReactElement;
  account: (props: any) => ReactElement;
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

  const handleSettingsSelect = (settingId: string) => {
    const settingMap: Record<string, string> = {
      // HTML blocks
      html_block_1: "html",
      html_block_2: "html",
      html_block_3: "html",
      html_block_4: "html",
      html_block_5: "html",

      // Logo
      logo: "headerMain",

      // Navigation
      mainMenu: "navigation",
      topBarMenu: "navigation",

      // Search
      search: "search",

      // Buttons
      buttons: "buttons",

      // Social
      followIcons: "social",

      // Top bar
      topBar: "topBar",

      // Header sections
      headerMain: "headerMain",
      headerBottom: "headerBottom",

      // Account
      account: "account",

      // Cart
      cart: "buttons",
    };

    const targetView = settingMap[settingId] || "main";
    setCurrentView(targetView);
    setSelectedSetting(settingId);
  };

  const items = [
    { title: "Header Layouts", view: "layouts" },
    { title: "Top Bar", view: "topBar" },
    { title: "Header Main", view: "headerMain" },
    { title: "Header Bottom", view: "headerBottom" },
    { title: "Navigation", view: "navigation" },
    { title: "Search", view: "search" },
    { title: "Account", view: "account" },
    { title: "Buttons", view: "buttons" },
    { title: "Social Icons", view: "social" },
    { title: "HTML Blocks", view: "html" },
  ];

  const settingsComponents: SettingsComponents = {
    layouts: HeaderLayoutsPanel,
    topBar: TopBarSettingsPanel,
    headerMain: HeaderMainSettings,
    headerBottom: HeaderBottomSettings,
    navigation: HeaderNavigationSettings,
    search: HeaderSearchSettings,
    account: HeaderAccountSettings,
    buttons: HeaderButtonSettings,
    social: HeaderSocialSettings,
    html: HeaderHtmlSettings,
  };

  const currentItem = items.find((item) => item.view === currentView);
  const panelTitle = selectedSetting
    ? `${currentItem?.title} - ${selectedSetting}`
    : currentItem?.title || "Header Settings";

  const renderSettingsPanel = () => {
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
    const Component = settingsComponents[currentView];
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

    return (
      <div>
        {items.map((item, index) => (
          <ClickableItem
            key={`${item.view}_${index}`} // Update the key to ensure uniqueness
            title={item.title}
            onClick={() => setCurrentView(item.view)}
          />
        ))}
      </div>
    );
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
