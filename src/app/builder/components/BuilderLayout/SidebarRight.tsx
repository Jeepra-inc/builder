"use client";
import React from 'react';
import { SidebarRightProps } from '@/app/builder/types';

export function SidebarRight({
  screenWidth,
  activeNarrowSidebar,
  sections,
  selectedSectionId,
  contentRef,
  settingsPanelRef,
  onToggleLayers,
}: SidebarRightProps) {
  return (
    <div className="h-full flex flex-col">
      {/* This sidebar is now empty as all panels are managed in SidebarLeft */}
    </div>
  );
}
