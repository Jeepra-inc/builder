'use client';

import React, { useRef, useEffect, useCallback, useReducer, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useBuilder } from '../contexts/BuilderContext';

// Layout Components
import Header from '@/app/builder/components/BuilderLayout/Header';
import Footer from '@/app/builder/components/BuilderLayout/Footer';
import { AddSectionModal } from '../components/IframeContent/AddSectionModal';
import { SectionControls } from '../components/IframeContent/SectionControls';

// Types and Utils
import { SectionType } from '@/app/builder/types';
import { allComponents } from '@/app/builder/elements/sections';
import {
  sectionsReducer as importedSectionsReducer,
  initialSectionState,
  SectionState,
  Section,
  SectionAction,
} from '../components/IframeContent/sectionReducer';

export default function IframeContent() {
  // ----------------- State + Reducer -----------------
  const { backgroundColor } = useBuilder();
  const [state, dispatch] = useReducer(localSectionsReducer, initialSectionState);
  const { sections } = state;
  
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [lastMovedSection, setLastMovedSection] = useState<string | null>(null);
  const [activeInsertIndex, setActiveInsertIndex] = useState<number | null>(null);

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});
  const contentRef = useRef<HTMLIFrameElement | null>(null);

  // Ensure sections are always available
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  // Add headerSettings state
  const [headerSettings, setHeaderSettings] = useState({
    logo: {
      text: 'Your Brand',
      showText: true
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
      maxWidth: '1200px'
    }
  });

  // Add footer settings state
  const [footerSettings, setFooterSettings] = useState({
    content: {
      copyright: ' 2024 Your Company. All rights reserved.',
      description: 'Building amazing websites with ease'
    },
    links: {
      items: [
        { text: 'About Us', url: '#' },
        { text: 'Contact', url: '#' },
        { text: 'Privacy Policy', url: '#' }
      ]
    },
    layout: {
      maxWidth: '1200px',
      showSocials: true,
      multiColumn: true
    }
  });

  // Add header selection state
  const [isHeaderSelected, setIsHeaderSelected] = useState(false);
  const [isFooterSelected, setIsFooterSelected] = useState(false);

  const handleHeaderSelect = useCallback(() => {
    setIsHeaderSelected(true);
    setIsFooterSelected(false);
    if (window.parent) {
      window.parent.postMessage({ 
        type: 'HEADER_SELECTED',
        settings: headerSettings
      }, '*');
    }
  }, [headerSettings]);

  const handleFooterSelect = useCallback(() => {
    setIsFooterSelected(true);
    setIsHeaderSelected(false);
    if (window.parent) {
      window.parent.postMessage({ 
        type: 'FOOTER_SELECTED',
        settings: footerSettings
      }, '*');
    }
  }, [footerSettings]);

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper functions
  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    const updatedSections = localSections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates } 
        : section
    );
    
    setLocalSections(updatedSections);
    dispatch({
      type: 'UPDATE_SECTION',
      sectionId,
      updates
    });
  }, [localSections]);

  const duplicateSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = localSections.find(s => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const sectionIndex = localSections.findIndex(s => s.id === sectionId);
    const newSection: Section = {
      ...sectionToDuplicate,
      id: generateUniqueId(), // Ensure a new unique ID
    };

    const updatedSections = [...localSections];
    updatedSections.splice(sectionIndex + 1, 0, newSection);

    setLocalSections(updatedSections);
    dispatch({
      type: 'ADD_SECTION',
      payload: newSection,
      index: sectionIndex + 1
    });
  }, [localSections]);

  const deleteSection = useCallback((sectionId: string) => {
    const updatedSections = localSections.filter(section => section.id !== sectionId);
    
    setLocalSections(updatedSections);
    dispatch({
      type: 'DELETE_SECTION',
      sectionId
    });
  }, [localSections]);

  const moveSectionVertically = useCallback((sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = localSections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= localSections.length) return;

    const updatedSections = [...localSections];
    const [removed] = updatedSections.splice(currentIndex, 1);
    updatedSections.splice(newIndex, 0, removed);
    
    setLocalSections(updatedSections);
    dispatch({
      type: 'MOVE_SECTION',
      sectionId,
      direction
    });
  }, [localSections]);

  // Sync local sections with state
  useEffect(() => {
    console.log('Syncing local sections with state:', {
      stateSections: sections,
      localSections
    });
    
    if (sections.length > 0) {
      setLocalSections(sections);
    }
  }, [sections]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      const { type } = event.data;
      console.log('Received message:', event.data);

      switch (type) {
        case 'UPDATE_BACKGROUND_COLOR': {
          console.log('Updating background color to:', event.data.backgroundColor);
          document.body.style.backgroundColor = event.data.backgroundColor;
          break;
        }
        case 'REORDER_SECTIONS': {
          const { sectionId, blocks } = event.data;
          dispatch({
            type: 'REORDER_SECTIONS',
            sectionId: sectionId,
            blocks,
          });
          break;
        }
        case 'UPDATE_HEADER_SETTINGS': {
          const { settings } = event.data;
          setHeaderSettings(prev => ({ ...prev, ...settings }));
          break;
        }
        case 'UPDATE_FOOTER_SETTINGS': {
          const { settings } = event.data;
          setFooterSettings(prev => ({ ...prev, ...settings }));
          break;
        }
        case 'SECTION_SELECTED': {
          setIsHeaderSelected(false);
          setIsFooterSelected(false);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) {
        console.warn('Invalid message received');
        return;
      }

      switch (event.data.type) {
        case 'TOGGLE_SECTION_VISIBILITY': {
          const { sectionId, isVisible } = event.data;
          
          if (!sectionId) {
            console.error('Invalid sectionId in visibility toggle');
            return;
          }

          const existingSection = localSections.find(s => s.id === sectionId);
          
          if (!existingSection || existingSection.isVisible !== isVisible) {
            setLocalSections(prevSections => 
              prevSections.map(section => 
                section.id === sectionId
                  ? { 
                      ...section, 
                      isVisible: isVisible ?? section.isVisible,
                      settings: {
                        ...section.settings,
                        isVisible: isVisible ?? section.settings?.isVisible ?? true
                      }
                    }
                  : section
              )
            );

            dispatch({
              type: 'TOGGLE_SECTION_VISIBILITY',
              sectionId,
              isVisible
            });
          }
          break;
        }

        case 'UPDATE_SECTION': {
          dispatch({
            type: 'UPDATE_SECTION',
            sectionId: event.data.sectionId,
            updates: event.data.updates.settings ?? {},
          });
          break;
        }

        case 'SECTIONS_UPDATED': {
          dispatch({ type: 'SET_SECTIONS', payload: event.data.sections });
          break;
        }

        case 'DELETE_SECTION': {
          dispatch({
            type: 'DELETE_SECTION', 
            sectionId: event.data.sectionId
          });
          break;
        }

        case 'ADD_SECTION': {
          dispatch({
            type: 'ADD_SECTION',
            payload: event.data.section,
            index: event.data.index,
          });

          if (event.data.scrollToSection) {
            const newSectionId = event.data.section.id;
            
            setTimeout(() => {
              const sectionRef = sectionRefs.current[newSectionId];
              sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
          break;
        }

        case 'SCROLL_TO_SECTION': {
          const sectionId = event.data.sectionId;
          const sectionRef = sectionRefs.current[sectionId];
          sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }

        case 'REORDER_SECTIONS': {
          dispatch({ type: 'REORDER_SECTIONS', sectionId: event.data.sectionId, blocks: event.data.blocks });
          if (event.data.scrollToSectionId) {
            setHoveredSection(event.data.scrollToSectionId);
            const sectionRef = sectionRefs.current[event.data.scrollToSectionId];
            sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => setHoveredSection(null), 2000);
          }
          break;
        }

        case 'HOVER_SECTION': {
          const id = event.data.sectionId;
          setHoveredSection(id);
          const sectionRef = sectionRefs.current[id];
          sectionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHoveredSection(null), 2000);
          break;
        }

        case 'UNDO': {
          dispatch({ type: 'UNDO' });
          break;
        }

        case 'REDO': {
          dispatch({ type: 'REDO' });
          break;
        }

        case 'DUPLICATE_LAYER': {
          const newSection = {
            ...event.data.layer,
            id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
          
          const insertIndex = event.data.currentIndex !== undefined 
            ? event.data.currentIndex + 1 
            : sections.length;
          
          dispatch({
            type: 'ADD_SECTION', 
            payload: newSection,
            index: insertIndex
          });
          break;
        }
        
        case 'DELETE_LAYER': {
          dispatch({
            type: 'DELETE_SECTION', 
            sectionId: event.data.layerId
          });
          break;
        }

        case 'UPDATE_BACKGROUND_COLOR': {
          const { backgroundColor } = event.data;
          document.body.style.backgroundColor = backgroundColor;
          break;
        }

        case 'UPDATE_HEADER': {
          const { settings } = event.data;
          const header = document.querySelector('header');
          if (header) {
            if (settings.backgroundColor) {
              header.style.backgroundColor = settings.backgroundColor;
            }
            const logo = header.querySelector('img');
            if (logo && settings.logoUrl) {
              logo.src = settings.logoUrl;
              logo.style.width = `${settings.logoWidth}px`;
            }
          }
          break;
        }

        case 'UPDATE_TYPOGRAPHY': {
          const { settings } = event.data;
          const root = document.documentElement;
          if (settings.headingColor) {
            root.style.setProperty('--heading-color', settings.headingColor);
          }
          break;
        }

        case 'UPDATE_CUSTOM_CSS': {
          const { settings } = event.data;
          const customStyleElement = document.getElementById('custom-css');
          if (customStyleElement) {
            customStyleElement.textContent = settings.customCSS;
          }
          break;
        }

        case 'UPDATE_HEADER_SETTINGS': {
          const { settings } = event.data;
          setHeaderSettings(prev => ({ ...prev, ...settings }));
          break;
        }

        case 'UPDATE_FOOTER_SETTINGS': {
          const { settings } = event.data;
          setFooterSettings(prev => ({ ...prev, ...settings }));
          break;
        }

        case 'SECTION_SELECTED': {
          setIsHeaderSelected(false);
          setIsFooterSelected(false);
          break;
        }

        default:
          console.warn(`Unhandled message type: ${event.data.type}`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [localSections, dispatch]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedSectionId) return;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSectionVertically(selectedSectionId, 'up');
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSectionVertically(selectedSectionId, 'down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSectionId, moveSectionVertically]);

  useEffect(() => {
    sections.forEach((section) => {
      if (!sectionRefs.current[section.id]) {
        sectionRefs.current[section.id] = React.createRef<HTMLDivElement | null>();
      }
    });
  }, [sections]);

  useEffect(() => {
    if (window.parent) {
      window.parent.postMessage({ type: 'SECTIONS_UPDATED', sections }, '*');
    }
  }, [sections]);

  useEffect(() => {
    console.log('Background color effect triggered:', backgroundColor);
    const iframe = contentRef.current;
    console.log('Iframe ref:', iframe);
    
    if (!iframe || !iframe.contentWindow) {
      console.log('No iframe or contentWindow found');
      return;
    }

    const updateBackgroundColor = () => {
      console.log('Attempting to update background color');
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.log('No iframe document found');
        return;
      }

      console.log('Current body backgroundColor:', iframeDoc.body.style.backgroundColor);
      console.log('Setting new backgroundColor:', backgroundColor);
      
      // Update background color
      iframeDoc.body.style.backgroundColor = backgroundColor;
      
      console.log('Updated body backgroundColor:', iframeDoc.body.style.backgroundColor);
    };

    // Wait for iframe to load
    console.log('Adding load event listener');
    iframe.addEventListener('load', () => {
      console.log('Iframe load event triggered');
      updateBackgroundColor();
    });
    
    console.log('Attempting immediate update');
    updateBackgroundColor(); // Also try to update immediately

    return () => {
      console.log('Cleaning up background color effect');
      iframe.removeEventListener('load', updateBackgroundColor);
    };
  }, [backgroundColor]);

  useEffect(() => {
    console.log('Sections content effect triggered');
    const iframe = contentRef.current;
    if (!iframe || !iframe.contentWindow) {
      console.log('No iframe or contentWindow found in sections effect');
      return;
    }

    const updateSectionsContent = () => {
      if (!iframe) return;
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) return;

      let sectionsContainer = iframeDoc.getElementById('sections-container');

      if (!sectionsContainer) {
        sectionsContainer = iframeDoc.createElement('div');
        sectionsContainer.id = 'sections-container';
        iframeDoc.body.appendChild(sectionsContainer);
      }

      // Use ReactDOM to render the content
      const content = sections.map(section => {
        const SectionComponent = allComponents[section.type];
        if (!SectionComponent) {
          console.error(`No component found for section type: ${section.type}`);
          return null;
        }

        return (
          <div key={section.id}>
            <SectionComponent
              section={section}
              isEditing={true}
              isSelected={selectedSectionId === section.id}
              onUpdateSection={(updates: Partial<Section>) => {
                updateSection(section.id, updates);
              }}
            />
          </div>
        );
      });

      const root = ReactDOM.createRoot(sectionsContainer);
      root.render(
        <React.StrictMode>
          {content}
        </React.StrictMode>
      );
    };

    updateSectionsContent();
  }, [sections, selectedSectionId]);

  useEffect(() => {
    const customStyleElement = document.createElement('style');
    customStyleElement.id = 'custom-css';
    document.head.appendChild(customStyleElement);

    return () => {
      document.head.removeChild(customStyleElement);
    };
  }, []);

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    window.parent.postMessage(
      {
        type: 'SECTION_SELECTED',
        sectionId,
        action: 'OPEN_SETTINGS',
      },
      '*'
    );
  }, []);

  const handleUndo = () => dispatch({ type: 'UNDO' });

  const handleRedo = () => dispatch({ type: 'REDO' });

  const handleAddSection = useCallback((sectionType: string, index?: number) => {
    const newSection = {
      id: generateUniqueId(),
      type: sectionType as SectionType,
      content: ["Example content"], 
      settings: {}
    };

    dispatch({
      type: 'ADD_SECTION',
      payload: newSection,
      index,
    });
    setActiveInsertIndex(null);

    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  const getSectionRef = useCallback((sectionId: string) => {
    if (!sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId] = React.createRef<HTMLDivElement | null>();
    }
    return sectionRefs.current[sectionId];
  }, []);

  // ----------------- RENDER -----------------
  return (
    <>
      <Header 
        settings={headerSettings}
        isEditing={true}
        isSelected={isHeaderSelected}
        onSelect={handleHeaderSelect}
      />
      <TooltipProvider>
        <div className="relative w-full h-full" ref={scrollAreaRef}>
          {localSections.map((section, index) => {
            const isVisible = section.isVisible !== false && section.settings?.isVisible !== false;

            if (!isVisible) {
              return null;
            }

            const SectionComponent = allComponents[section.type];

            if (!SectionComponent) {
              console.error(`No component found for section type: ${section.type}`);
              return null;
            }

            return (
              <div
                key={section.id}
                className="relative group hover:outline-8"
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                {hoveredSection === section.id && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <AddSectionModal
                      open={activeInsertIndex === index}
                      onOpenChange={(open: boolean) => setActiveInsertIndex(open ? index : null)}
                      onAddSection={(type: string) => handleAddSection(type, index)}
                    />
                  </div>
                )}

                <div
                  ref={getSectionRef(section.id)}
                  onClick={() => handleSectionClick(section.id)}
                >
                  {hoveredSection === section.id && (
                    <SectionControls
                      sectionId={section.id}
                      index={index}
                      totalSections={localSections.length}
                      onMoveUp={() => moveSectionVertically(section.id, 'up')}
                      onMoveDown={() => moveSectionVertically(section.id, 'down')}
                      onDuplicate={() => duplicateSection(section.id)}
                      onDelete={() => deleteSection(section.id)}
                      onToggleVisibility={() => {
                        const newVisibility = section.isVisible !== false ? false : true;
                        dispatch({
                          type: 'TOGGLE_SECTION_VISIBILITY',
                          sectionId: section.id,
                          isVisible: newVisibility
                        });
                      }}
                      isVisible={isVisible}
                    />
                  )}
                  <SectionComponent
                    section={section}
                    isEditing={true}
                    isSelected={selectedSectionId === section.id}
                    onUpdateSection={(updates: Partial<Section>) => {
                      updateSection(section.id, updates);
                    }}
                  />
                </div>

                {hoveredSection === section.id && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                    <AddSectionModal
                      open={activeInsertIndex === index + 1}
                      onOpenChange={(open: boolean) => setActiveInsertIndex(open ? index + 1 : null)}
                      onAddSection={(type: string) => handleAddSection(type, index + 1)}
                    />
                  </div>
                )}
              </div>
            );
          })}
          
          {localSections.length === 0 && (
            <div className="flex justify-center">
              <AddSectionModal
                open={activeInsertIndex === 0}
                onOpenChange={(open: boolean) => setActiveInsertIndex(open ? 0 : null)}
                onAddSection={(type: string) => handleAddSection(type, 0)}
              />
            </div>
          )}
          
          <div className="fixed bottom-4 right-4 z-50">
            <AddSectionModal onAddSection={(type: string) => handleAddSection(type)} />
          </div>
        </div>
        <Footer 
          settings={footerSettings}
          isEditing={true}
          isSelected={isFooterSelected}
          onSelect={handleFooterSelect}
        />
      </TooltipProvider>
    </>
  );
}

function localSectionsReducer(state: SectionState, action: SectionAction): SectionState {
  console.log('Local Reducer Action:', action.type, action);

  if (action.type === 'TOGGLE_SECTION_VISIBILITY') {
    const updatedSections = state.sections.map(section => 
      section.id === action.sectionId
        ? { ...section, isVisible: action.isVisible }
        : section
    );
    return { ...state, sections: updatedSections };
  }

  if (action.type === 'MOVE_SECTION') {
    const { sectionId, direction } = action;
    const currentIndex = state.sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return state;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= state.sections.length) return state;

    const updatedSections = [...state.sections];
    const [removed] = updatedSections.splice(currentIndex, 1);
    updatedSections.splice(newIndex, 0, removed);

    return { ...state, sections: updatedSections };
  }

  return importedSectionsReducer(state, action);
}
