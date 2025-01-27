"use client";
import React from 'react';
import { ResizablePanelGroup, ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { PageBuilderLayoutProps } from './types';

export function PageBuilderLayout({
  leftSidebar,
  content,
  rightSidebar,
  isLeftSidebarOpen,
  screenWidth,
}: PageBuilderLayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-grow">
      {/* LEFT SIDEBAR */}
      <ResizablePanel
        defaultSize={20}
        minSize={10}
        maxSize={30}
        className={`bg-white shadow-md ${!isLeftSidebarOpen ? 'hidden' : ''}`}
      >
        {leftSidebar}
      </ResizablePanel>

      {isLeftSidebarOpen && <ResizableHandle withHandle />}

      {/* CONTENT PANEL */}
      <ResizablePanel
        defaultSize={screenWidth > 1612 ? 70 : 85}
        minSize={50}
        className="flex justify-center items-center bg-gray-100 relative"
      >
        {content}
      </ResizablePanel>

      {/* RIGHT SIDEBAR (only if wide) */}
      {screenWidth > 1612 && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={15}
            minSize={10}
            maxSize={30}
            className="bg-white shadow-md"
          >
            {rightSidebar}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
