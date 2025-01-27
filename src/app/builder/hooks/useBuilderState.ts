import { useState } from 'react';
import { Section } from '../types';

export function useBuilderState() {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  const toggleViewportSize = (size: 'mobile' | 'tablet' | 'desktop') => {
    setViewportSize(size);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(prev => !prev);
  };

  const toggleSidebar = (side: 'left' | 'right') => {
    if (side === 'left') {
      setIsLeftSidebarOpen(prev => !prev);
    } else {
      setIsRightSidebarOpen(prev => !prev);
    }
  };

  const updateSections = (newSections: Section[]) => {
    setSections(newSections);
  };

  const selectSection = (sectionId: string | null) => {
    setSelectedSectionId(sectionId);
  };

  return {
    viewportSize,
    isFullscreen,
    isPreviewMode,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    sections,
    selectedSectionId,
    toggleViewportSize,
    toggleFullscreen,
    togglePreviewMode,
    toggleSidebar,
    updateSections,
    selectSection,
    backgroundColor,
    setBackgroundColor,
  };
}
