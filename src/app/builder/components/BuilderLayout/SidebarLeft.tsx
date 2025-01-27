"use client";
import React, { useRef } from 'react';
import { SortableLayersPanel } from '@/app/builder/components/BuilderLayout/SortableLayersPanel';
import { SectionSettingsPanel } from '@/app/builder/components/BuilderLayout/SectionSettingsPanel';
import { GlobalSettingsPanel } from '@/app/builder/components/BuilderLayout/GlobalSettingsPanel';
import { HeaderSettingsPanel } from '@/app/builder/components/BuilderLayout/HeaderSettingsPanel';
import { FooterSettingsPanel } from '@/app/builder/components/BuilderLayout/FooterSettingsPanel';
import { SidebarLeftProps, SidebarSection } from '@/app/builder/types';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const defaultHeaderSettings = {
  logo: {
    text: 'Your Brand',
    showText: true,
    size: 'medium'
  },
  navigation: {
    items: [
      { text: 'Home', url: '#', isButton: false },
      { text: 'About', url: '#', isButton: false },
      { text: 'Contact', url: '#', isButton: true }
    ]
  },
  layout: {
    sticky: true,
    transparent: false,
    maxWidth: '1200px',
    padding: '1rem 2rem'
  },
  style: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e5e7eb',
    buttonStyle: 'filled'
  }
};

export function SidebarLeft({
  screenWidth,
  activeNarrowSidebar,
  sections,
  selectedSectionId,
  onSelectSection,
  onHoverSection,
  contentRef,
  toggleNarrowSidebar,
}: SidebarLeftProps) {
  const isWideScreen = screenWidth > 1612;
  const showLayersPanel = isWideScreen || activeNarrowSidebar === 'layers';
  
  // Get the selected section's type
  const selectedSection = sections.find(section => section.id === selectedSectionId);
  const selectedSectionType = selectedSection?.type;
  
  const settingsPanelRef = useRef<HTMLIFrameElement | null>(null);

  const handleHeaderSettingsUpdate = (newSettings: any) => {
    if (contentRef.current?.contentWindow) {
      contentRef.current.contentWindow.postMessage({
        type: 'UPDATE_HEADER_SETTINGS',
        settings: newSettings
      }, '*');
    }
  };

  const handleFooterSettingsUpdate = (newSettings: any) => {
    if (contentRef.current?.contentWindow) {
      contentRef.current.contentWindow.postMessage({
        type: 'UPDATE_FOOTER_SETTINGS',
        settings: newSettings
      }, '*');
    }
  };

  const layerSections: SidebarSection[] = [
    {
      title: 'Header',
      component: (
        <div className="px-2 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal"
            onClick={() => toggleNarrowSidebar('header-settings')}
          >
            Header
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ),
      showWhen: showLayersPanel
    },
    {
      title: 'Header Settings',
      component: (
        <div>
          <HeaderSettingsPanel
            settings={defaultHeaderSettings}
            onUpdateSettings={handleHeaderSettingsUpdate}
          />
        </div>
      ),
      showWhen: !isWideScreen && activeNarrowSidebar === 'header-settings'
    },
    {
      title: 'Template',
      component: (
        <SortableLayersPanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={onSelectSection}
          onHoverSection={onHoverSection}
          setSections={() => {/* You could pass it or handle differently */}}
          contentRef={contentRef}
        />
      ),
      showWhen: showLayersPanel
    },
    {
      title: 'Footer',
      component: (
        <div className="px-2 py-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal"
            onClick={() => toggleNarrowSidebar('footer-settings')}
          >
            Footer
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ),
      showWhen: showLayersPanel
    },
    {
      title: 'Footer Settings',
      component: (
        <div className="p-4">
          <FooterSettingsPanel
            settings={{}}
            onUpdateSettings={handleFooterSettingsUpdate}
          />
        </div>
      ),
      showWhen: !isWideScreen && activeNarrowSidebar === 'footer-settings'
    },
    {
      title: selectedSectionType ? `${selectedSectionType.charAt(0).toUpperCase() + selectedSectionType.slice(1)} Settings` : 'Section Settings',
      component: (
        <div className="p-4">
          <SectionSettingsPanel
            selectedSectionId={selectedSectionId}
            sections={sections}
            contentRef={contentRef}
            settingsPanelRef={settingsPanelRef}
            onToggleLayers={() => toggleNarrowSidebar('layers')}
          />
        </div>
      ),
      showWhen: !isWideScreen && activeNarrowSidebar === 'settings'
    },
    {
      title: 'Global Settings',
      component: (
        <GlobalSettingsPanel />
      ),
      showWhen: !isWideScreen && activeNarrowSidebar === 'global-settings'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {layerSections.map((section, index) => (
        section.showWhen && (
          <div key={index}>
            <div className='p-3'>
              {(section.title === 'Header Settings' || 
                section.title === 'Footer Settings' || 
                section.title === 'Global Settings' ||
                section.title.includes('Settings')) ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleNarrowSidebar('layers')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-md font-semibold">{section.title}</h2>
                </div>
              ) : (
                <h2 className="text-md font-semibold">{section.title}</h2>
              )}
            </div>
            <Separator />
            <div className={`pb-4 ${section.title.toLowerCase() !== 'global settings' ? 'border-b px-3' : ''}`}>
              {section.component}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
