"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MultiLevelSidebar from "../common/multiLevelSidebar";
import { SidebarLeftProps } from "./sidebar/types";
import { useHeaderSettings } from "./sidebar/useHeaderSettings";
import { useSidebarNavigation } from "./sidebar/useSidebarNavigation";
import { createMenuConfig } from "./sidebar/sidebarConfig";

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
    activeSubmenu || null
  );
  const [selectedHeaderSetting, setSelectedHeaderSetting] = useState<
    string | null
  >(null);
  const [currentPreset, setCurrentPreset] = useState<string>(
    headerSettings?.layout?.currentPreset || "preset1"
  );

  useHeaderSettings(contentRef, setCurrentPreset);
  useSidebarNavigation(
    toggleNarrowSidebar,
    setCurrentSubmenu,
    setSelectedHeaderSetting
  );

  useEffect(() => {
    setCurrentSubmenu(activeSubmenu || null);
  }, [activeSubmenu]);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const sectionTitle = selectedSection?.type
    ? `${selectedSection.type
        .charAt(0)
        .toUpperCase()}${selectedSection.type.slice(1)} Settings`
    : "Section Settings";

  const handleMenuItemClick = useCallback(
    (item: any) => {
      const isHeaderSubmenuItem = item.parent === "Header";
      if (!isHeaderSubmenuItem && item.title !== "Header") {
        toggleNarrowSidebar("layers");
        setCurrentSubmenu(null);
      }
      item.onClick?.();
    },
    [toggleNarrowSidebar]
  );

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      setCurrentPreset(presetId);
      contentRef.current?.contentWindow?.postMessage(
        { type: "SELECT_PRESET", presetId },
        "*"
      );
    },
    [contentRef]
  );

  const { initialMenu } = createMenuConfig(
    localSections,
    selectedSectionId,
    onSelectSection,
    onHoverSection,
    contentRef,
    setLocalSections,
    toggleNarrowSidebar,
    sectionTitle,
    sections,
    settingsPanelRef,
    handleSelectPreset,
    currentPreset
  );

  return (
    <ScrollArea className="h-full">
      <MultiLevelSidebar
        initialMenu={initialMenu}
        onNavigate={(item) => setCurrentSubmenu(item.title)}
        onBack={() => setCurrentSubmenu(null)}
        onMenuItemClick={handleMenuItemClick}
        defaultSubmenu={currentSubmenu}
      />
    </ScrollArea>
  );
}
