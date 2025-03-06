"use client";
import { useEffect } from 'react';
import { Section } from '@/app/builder/types';
import { ActiveSidebar } from '@/app/builder/types';


interface UseIframeMessagesProps {
  contentRef: React.RefObject<HTMLIFrameElement | null>;
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  toggleNarrowSidebar: React.Dispatch<React.SetStateAction<ActiveSidebar>>;
  handleUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  setSelectedSectionId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useIframeMessages({
  contentRef,
  sections,
  setSections,
  toggleNarrowSidebar,
  handleUpdateSection,
  setSelectedSectionId,
}: UseIframeMessagesProps) {

  // Listen for messages from the Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ignore messages not from the iframe
      if (event.source !== contentRef.current?.contentWindow) return;

      try {
        switch (event.data.type) {
          case 'SECTION_SELECTED': {
            if (event.data.sectionId) {
              const foundSection = sections.find(sec => sec.id === event.data.sectionId);
              if (foundSection) {
                setSelectedSectionId(foundSection.id);
                toggleNarrowSidebar('settings');
              }
            }
            break;
          }
          case 'UPDATE_SECTION': {
            handleUpdateSection(event.data.sectionId, event.data.updates);
            break;
          }
          case 'SECTIONS_UPDATED': {
            if (Array.isArray(event.data.sections)) {
              setSections(event.data.sections);
            }
            break;
          }
          case 'SELECT_SECTION': {
            if (event.data.sectionId) {
              const s = sections.find(sec => sec.id === event.data.sectionId);
              if (s) {
                setSelectedSectionId(s.id);
                toggleNarrowSidebar('settings');
                
                // Dispatch event to switch to section settings tab
                window.dispatchEvent(
                  new CustomEvent("switchTab", { 
                    detail: { targetTab: "Section Settings" } 
                  })
                );
              }
            }
            break;
          }
          case 'ADD_SECTION': {
            const { section, index } = event.data;
            setSections(prevSections => {
              const newSections = [...prevSections];
              if (index !== undefined && index !== null) {
                newSections.splice(index, 0, section);
              } else {
                newSections.push(section);
              }
              return newSections;
            });
            setSelectedSectionId(section.id);
            toggleNarrowSidebar('settings');
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    contentRef,
    sections,
    toggleNarrowSidebar,
    handleUpdateSection,
    setSections,
    setSelectedSectionId
  ]);
}