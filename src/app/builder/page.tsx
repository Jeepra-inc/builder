"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Section, ViewportSize } from '@/app/builder/types';
import { ActiveSidebar } from '@/app/builder/types';

import { useDndHandlers } from '@/app/builder/hooks/useDndHandlers';
import { useUndoRedo } from '@/app/builder/hooks/useUndoRedo';
import { useIframeMessages } from '@/app/builder/hooks/useIframeMessages';
import { useBuilder } from './contexts/BuilderContext';

import { PageBuilderLayout } from './components/BuilderLayout/PageBuilderLayout';
import { SidebarLeft } from './components/BuilderLayout/SidebarLeft';
import { SidebarRight } from './components/BuilderLayout/SidebarRight';
import { IframeContent } from './components/BuilderLayout/IframeContent';
import { NarrowSidebar } from './components/BuilderLayout/NarrowSidebar';
import { TopBar } from './components/BuilderLayout/TopBar';
import { HeaderLayoutBuilder } from '@/app/builder/components/BuilderLayout/HeaderLayoutBuilder';

export default function PageBuilder() {
  // ----------------- Refs -----------------
  const contentRef = useRef<HTMLIFrameElement>(null);
  const { backgroundColor } = useBuilder();

  // ----------------- States -----------------
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [activeNarrowSidebar, setActiveNarrowSidebar] = useState<ActiveSidebar | null>('layers');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isGlobalSettingsPanelOpen, setIsGlobalSettingsPanelOpen] = useState(false);

  // Screen width
  const [screenWidth, setScreenWidth] = useState<number>(1920);

  // Update screenWidth on client side
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize(); // Set initial width
    console.log('Initial screen width:', window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('Active Narrow Sidebar:', activeNarrowSidebar);
    console.log('Is Left Sidebar Open:', isLeftSidebarOpen);
  }, [activeNarrowSidebar, isLeftSidebarOpen]);

  useEffect(() => {
    if (contentRef.current?.contentWindow) {
      contentRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_BACKGROUND_COLOR',
          backgroundColor,
        },
        '*'
      );
    }
  }, [backgroundColor]);

  // ----------------- Hooks -----------------
  const { handleUndo, handleRedo } = useUndoRedo({ sections, setSections });
  const { isDragging, restrictAxis, handleDragStart, handleDragOver, handleDragEnd } = useDndHandlers({
    contentRef,
    setSections,
  });

  // Iframe message hooks
  const handleUpdateSection = useCallback(
    (sectionId: string, updates: Partial<Section>) => {
      console.group('🔍 UpdateSection Debug');
      console.log('Input sectionId:', sectionId);
      console.log('Input updates:', updates);

      const currentSection = sections.find(s => s.id === sectionId);
      if (!currentSection) {
        console.error('Section not found');
        console.groupEnd();
        return;
      }

      console.log('Current section before update:', currentSection);

      const newSection: Section = { ...currentSection, ...updates };

      console.log('New section after update:', newSection);

      const idx = sections.findIndex(s => s.id === sectionId);
      if (idx !== -1) {
        const updatedSections = [...sections];
        updatedSections[idx] = newSection;
        console.log('Sections after update:', updatedSections);
        setSections(updatedSections);

        contentRef.current?.contentWindow?.postMessage(
          {
            type: 'UPDATE_SECTION',
            sectionId: sectionId,
            updates,
          },
          '*'
        );

        window.parent.postMessage(
          {
            type: 'SECTIONS_UPDATED',
            sections: updatedSections,
          },
          '*'
        );
      }
      console.groupEnd();
    },
    [sections]
  );

  useIframeMessages({
    contentRef,
    sections,
    setSections,
    screenWidth,
    toggleNarrowSidebar: setActiveNarrowSidebar,
    handleUpdateSection,
    setSelectedSectionId,
  });

  // ----------------- Effects -----------------

  // ----------------- Callbacks -----------------
  const handleSectionHover = useCallback((id: string | null) => {
    // Optional highlight logic
  }, []);

  const handleSelectSection = useCallback(
    (id: string) => {
      setSelectedSectionId(id);
      if (screenWidth <= 1612) {
        setActiveNarrowSidebar('settings');
      }
      contentRef.current?.contentWindow?.postMessage(
        {
          type: 'SCROLL_TO_SECTION',
          sectionId: id,
        },
        '*'
      );
    },
    [screenWidth]
  );

  const handleOpenGlobalSettings = useCallback(() => {
    setIsGlobalSettingsPanelOpen(true);
    // If screen is narrow, switch to global settings
    if (screenWidth <= 1612) {
      setActiveNarrowSidebar('global-settings');
    }
  }, [screenWidth]);

  const handleCloseGlobalSettings = useCallback(() => {
    setIsGlobalSettingsPanelOpen(false);
  }, []);

  const handleViewportChange = useCallback(
    (size: ViewportSize) => {
      setViewportSize(size);
      switch (size) {
        case 'desktop':
          setIsLeftSidebarOpen(true);
          setActiveNarrowSidebar('layers');
          break;
        case 'fullscreen':
          setIsLeftSidebarOpen(false);
          setActiveNarrowSidebar(null);
          break;
        case 'mobile':
        case 'tablet':
          setIsLeftSidebarOpen(true);
          setActiveNarrowSidebar('layers');
          break;
      }

      contentRef.current?.contentWindow?.postMessage(
        {
          type: 'VIEWPORT_CHANGE',
          viewport: size,
        },
        '*'
      );
    },
    [contentRef]
  );

  const handleHeaderClick = () => {
    setActiveNarrowSidebar('header-settings');
  };

  const isHeaderLayoutBuilderVisible = activeNarrowSidebar === 'header-settings';

  // ----------------- Render -----------------
  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col">
        {/* TOP CONTROL BAR */}
        <TopBar
          viewportSize={viewportSize}
          onViewportChange={handleViewportChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenGlobalSettings={handleOpenGlobalSettings}
        />

        {/* MAIN CONTENT */}
        <div className="flex flex-grow overflow-hidden">
          <NarrowSidebar
            screenWidth={screenWidth}
            viewportSize={viewportSize}
            activeNarrowSidebar={activeNarrowSidebar}
            toggleNarrowSidebar={setActiveNarrowSidebar}
            handleOpenGlobalSettings={handleOpenGlobalSettings}
            onHeaderClick={handleHeaderClick}
          />

          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictAxis]}
          >
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <PageBuilderLayout
                leftSidebar={
                  <SidebarLeft
                    screenWidth={screenWidth}
                    activeNarrowSidebar={activeNarrowSidebar}
                    sections={sections}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={handleSelectSection}
                    onHoverSection={handleSectionHover}
                    contentRef={contentRef}
                    toggleNarrowSidebar={setActiveNarrowSidebar}
                  />
                }
                content={
                  <>
                    <IframeContent
                      isDragging={isDragging}
                      viewportSize={viewportSize}
                      iframeRef={contentRef}
                    />
                    {isHeaderLayoutBuilderVisible && (
                      <HeaderLayoutBuilder
                        contentRef={contentRef}
                        isOpen={isHeaderLayoutBuilderVisible}
                        onClose={() => setActiveNarrowSidebar('header-settings')}
                      />
                    )}
                  </>
                }
                rightSidebar={
                  screenWidth > 1612 ? (
                    <SidebarRight
                      selectedSectionId={selectedSectionId}
                      sections={sections}
                      contentRef={contentRef}
                      toggleNarrowSidebar={setActiveNarrowSidebar}
                    />
                  ) : null
                }
                isLeftSidebarOpen={isLeftSidebarOpen}
                screenWidth={screenWidth}
              />
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </TooltipProvider>
  );
}
