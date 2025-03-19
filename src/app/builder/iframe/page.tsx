"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useReducer,
  useState,
} from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBuilder } from "../contexts/BuilderContext";
import { useIframeEffects } from "./hooks/useIframeEffects";
import { useMessageHandler } from "./hooks/useMessageHandler";

// Layout Components
import Header from "@/app/builder/components/BuilderLayout/header/Header";
import Footer from "../components/BuilderLayout/footer/Footer";
import { SectionControls } from "../components/IframeContent/SectionControls";
import { AddSectionModal } from "@/app/builder/components/common/AddSectionModal";

// Types and Utils
import { SectionType } from "@/app/builder/types";
import { HeaderSettings, FooterSettings, Section } from "./types";
import { allComponents } from "@/app/builder/elements/sections";
import {
  sectionsReducer,
  initialSectionState,
} from "../components/IframeContent/sectionReducer";
import { PlusIcon } from "lucide-react";

// Helper component for Add Section button and modal
const AddSectionButton = ({
  index,
  activeInsertIndex,
  setActiveInsertIndex,
  handleAddSection,
  position = "top",
}: {
  index: number;
  activeInsertIndex: number | null;
  setActiveInsertIndex: (index: number | null) => void;
  handleAddSection: (type: SectionType, index?: number) => void;
  position?: "top" | "bottom";
}) => {
  const isActive = activeInsertIndex === index;
  const transformClass =
    position === "top" ? "-translate-y-1/2" : "translate-y-1/2";

  return (
    <div
      className={`absolute ${position}-0 left-1/2 transform -translate-x-1/2 ${transformClass} z-[10000]`}
    >
      <div className="group/add-btn relative">
        {/* Line that appears when hovering over the plus button or when active */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-[3px] bg-blue-500 
          ${isActive ? "w-screen" : "w-0 group-hover/add-btn:w-screen"} 
          transition-all duration-300 -z-10 origin-center`}
        />

        {/* Plus button visible on section hover - stays visible when active */}
        <button
          onClick={() => {
            setActiveInsertIndex(index);
            document.body.style.overflow = "hidden";
          }}
          className={`flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 
            ${isActive ? "opacity-0" : "group-hover/add-btn:opacity-0"} 
            transition-opacity`}
        >
          <PlusIcon className="w-4 h-4" />
        </button>

        {/* Text button - visible on hover or when active */}
        <button
          onClick={() => {
            setActiveInsertIndex(index);
            document.body.style.overflow = "hidden";
          }}
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 
            ${
              isActive
                ? "opacity-100"
                : "opacity-0 group-hover/add-btn:opacity-100"
            } 
            whitespace-nowrap transition-opacity bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 px-3 rounded-md shadow-sm font-medium z-[10000]`}
        >
          Add Section
        </button>
      </div>

      {/* Modal that opens when clicking either button */}
      {isActive && (
        <AddSectionModal
          open={true}
          onOpenChange={(open: boolean) => {
            setActiveInsertIndex(open ? index : null);
            if (!open) {
              document.body.style.overflow = "auto";
            }
          }}
          onAddSection={(type) => {
            handleAddSection(type, index);
            document.body.style.overflow = "auto";
            setActiveInsertIndex(null);
          }}
          buttonVariant="outline"
          buttonSize="icon"
          buttonClassName="hidden" // Hide the default button
        />
      )}
    </div>
  );
};

export default function IframeContent() {
  // ----------------- State + Reducer -----------------
  const { backgroundColor } = useBuilder();
  const [state, dispatch] = useReducer(sectionsReducer, initialSectionState);
  const { sections } = state;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [activeInsertIndex, setActiveInsertIndex] = useState<number | null>(
    null
  );

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement | null>;
  }>({});
  const processingParentSettings = useRef(false);

  // Ensure sections are always available
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  // Add headerSettings state
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    logo: {
      text: "Builder",
      showText: true,
      image: "",
      size: "medium",
    },
    navigation: {
      menuType: "mainMenu",
      items: [],
    },
    layout: {
      sticky: false,
      maxWidth: "1200px",
      currentPreset: "default",
      containers: {
        top_left: [],
        top_center: [],
        top_right: [],
        middle_left: [],
        middle_center: [],
        middle_right: [],
        bottom_left: [],
        bottom_center: [],
        bottom_right: [],
        available: [],
      },
    },
    search: {
      show: true,
      type: "form",
      placeholder: "Search...",
      showText: true,
      behavior: "inline",
      design: "standard",
    },
    account: {
      showText: true,
      text: "Account",
      showIcon: true,
    },
    contact: {
      show: true,
    },
  });

  // Add footer settings state
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    content: {
      copyright: " 2024 Your Company. All rights reserved.",
      description: "Building amazing websites with ease",
    },
    links: {
      items: [
        { text: "About Us", url: "#" },
        { text: "Contact", url: "#" },
        { text: "Privacy Policy", url: "#" },
      ],
    },
    layout: {
      maxWidth: "1200px",
      showSocials: true,
      multiColumn: true,
    },
  });

  // Add header/footer selection state
  const [isHeaderSelected, setIsHeaderSelected] = useState(false);
  const [isFooterSelected, setIsFooterSelected] = useState(false);

  // Function to initialize typography from settings
  const initializeTypographyFromSettings = useCallback(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((settings) => {
        if (settings?.globalStyles?.typography) {
          const {
            headingFont,
            bodyFont,
            headingColor,
            headingSizeScale,
            bodySizeScale,
          } = settings.globalStyles.typography;

          // Apply CSS variables directly
          const root = document.documentElement;

          if (headingFont) {
            const [fontFamily, weight] = headingFont.split(":");
            root.style.setProperty(
              "--heading-font",
              `'${fontFamily}', sans-serif`
            );
            loadGoogleFont(fontFamily, weight || "400");
          }

          if (bodyFont) {
            const [fontFamily, weight] = bodyFont.split(":");
            root.style.setProperty(
              "--body-font",
              `'${fontFamily}', sans-serif`
            );
            loadGoogleFont(fontFamily, weight || "400");
          }

          if (headingColor) {
            root.style.setProperty("--heading-color", headingColor);
          }

          if (headingSizeScale) {
            root.style.setProperty(
              "--heading-size-scale",
              `${headingSizeScale / 100}`
            );
          }

          if (bodySizeScale) {
            root.style.setProperty(
              "--body-size-scale",
              `${bodySizeScale / 100}`
            );
          }
        }
      })
      .catch((error) => {
        console.error(
          "Error loading settings.json for typography initialization:",
          error
        );
      });
  }, []);

  // Function to initialize all settings from settings.json
  const initializeAllSettingsFromJson = useCallback(() => {
    fetch("/settings.json")
      .then((response) => response.json())
      .then((settings) => {
        processingParentSettings.current = true;

        try {
          // Process sections if available
          if (settings.sections) {
            setLocalSections(settings.sections);
            dispatch({ type: "SET_SECTIONS", payload: settings.sections });
          }

          // Process header settings
          if (settings.headerSettings) {
            // Create updated header settings with merged logo info
            const updatedHeaderSettings = {
              ...settings.headerSettings,
            };

            // Check for additional logo info in globalStyles.branding
            if (settings.globalStyles?.branding) {
              const branding = settings.globalStyles.branding;

              // If there's a logo in branding but not in header settings, add it
              if (
                !updatedHeaderSettings.logo ||
                !updatedHeaderSettings.logo.image
              ) {
                const logoFromBranding =
                  branding.logoForHeader || branding.logoUrl;

                if (logoFromBranding) {
                  // Create or update logo object
                  updatedHeaderSettings.logo = {
                    ...(updatedHeaderSettings.logo || {}),
                    text: "Your Brand",
                    showText: true,
                    image: logoFromBranding,
                    size: branding.logoSizeForHeader || "medium",
                  };
                }
              }
            }

            // Apply header settings
            setHeaderSettings(updatedHeaderSettings);

            // Also send a message to the parent to update header settings
            if (window.parent) {
              setTimeout(() => {
                window.parent.postMessage(
                  {
                    type: "UPDATE_HEADER_SETTINGS",
                    settings: updatedHeaderSettings,
                  },
                  "*"
                );

                // Also send a HEADER_SELECTED message to ensure the header is properly initialized
                window.parent.postMessage(
                  {
                    type: "HEADER_SELECTED",
                    settings: updatedHeaderSettings,
                  },
                  "*"
                );
              }, 200);
            }
          }

          // Process footer settings
          if (settings.footerSettings) {
            setFooterSettings(settings.footerSettings);
          }

          // Apply global styles
          if (settings.globalStyles) {
            // Apply background color
            if (settings.globalStyles.branding?.backgroundColor) {
              document.body.style.backgroundColor =
                settings.globalStyles.branding.backgroundColor;
            }

            // Apply custom CSS
            if (settings.globalStyles.customCSS) {
              const customStyleElement = document.getElementById("custom-css");
              if (customStyleElement) {
                customStyleElement.textContent =
                  settings.globalStyles.customCSS;
              }
            }
          }
        } finally {
          // Reset the flag after a short delay to ensure all state updates have been processed
          setTimeout(() => {
            processingParentSettings.current = false;
          }, 500);
        }
      })
      .catch((error) => {
        console.error("Error loading settings.json for initialization:", error);
        processingParentSettings.current = false;
      });
  }, []);

  // Use our custom hooks for effects and message handling
  useIframeEffects({
    headerSettings,
    setHeaderSettings,
    footerSettings,
    setFooterSettings,
    sections,
    setLocalSections,
    dispatch,
    processingParentSettings,
    initializeAllSettingsFromJson,
  });

  const { sendMessageToParent } = useMessageHandler({
    headerSettings,
    setHeaderSettings,
    footerSettings,
    setFooterSettings,
    sections,
    setLocalSections,
    dispatch,
    processingParentSettings,
    initializeAllSettingsFromJson,
  });

  const handleHeaderSelect = useCallback(() => {
    setIsHeaderSelected(true);
    setIsFooterSelected(false);
    if (window.parent) {
      sendMessageToParent({
        type: "HEADER_SELECTED",
        settings: headerSettings,
      });
    }
  }, [headerSettings, sendMessageToParent]);

  const handleFooterSelect = useCallback(() => {
    setIsFooterSelected(true);
    setIsHeaderSelected(false);
    if (window.parent) {
      sendMessageToParent({
        type: "FOOTER_SELECTED",
        settings: footerSettings,
      });
    }
  }, [footerSettings, sendMessageToParent]);

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Section management functions
  const updateSection = useCallback(
    (sectionId: string, updates: Partial<Section>) => {
      const updatedSections = localSections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      );

      setLocalSections(updatedSections);
      dispatch({
        type: "UPDATE_SECTION",
        sectionId,
        updates,
      });
    },
    [localSections]
  );

  const duplicateSection = useCallback(
    (sectionId: string) => {
      const sectionToDuplicate = localSections.find((s) => s.id === sectionId);
      if (!sectionToDuplicate) return;

      const sectionIndex = localSections.findIndex((s) => s.id === sectionId);
      const newSection: Section = {
        ...sectionToDuplicate,
        id: generateUniqueId(),
      };

      const updatedSections = [...localSections];
      updatedSections.splice(sectionIndex + 1, 0, newSection);

      setLocalSections(updatedSections);
      dispatch({
        type: "ADD_SECTION",
        payload: newSection,
        index: sectionIndex + 1,
      });
    },
    [localSections]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      const updatedSections = localSections.filter(
        (section) => section.id !== sectionId
      );

      setLocalSections(updatedSections);
      dispatch({
        type: "DELETE_SECTION",
        sectionId,
      });
    },
    [localSections]
  );

  const moveSectionVertically = useCallback(
    (sectionId: string, direction: "up" | "down") => {
      const currentIndex = localSections.findIndex((s) => s.id === sectionId);
      if (currentIndex === -1) return;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= localSections.length) return;

      const updatedSections = [...localSections];
      const [removed] = updatedSections.splice(currentIndex, 1);
      updatedSections.splice(newIndex, 0, removed);

      setLocalSections(updatedSections);
      dispatch({
        type: "MOVE_SECTION",
        sectionId,
        direction,
      });
    },
    [localSections]
  );

  const handleAddSection = useCallback(
    (sectionType: SectionType, index?: number) => {
      const newSection = {
        id: generateUniqueId(),
        type: sectionType,
        content: ["Example content"],
        settings: {},
      };

      dispatch({
        type: "ADD_SECTION",
        payload: newSection,
        index,
      });
      setActiveInsertIndex(null);

      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    },
    []
  );

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsHeaderSelected(false);
    setIsFooterSelected(false);

    window.parent.postMessage(
      {
        type: "SELECT_SECTION",
        sectionId,
        action: "OPEN_SETTINGS",
      },
      "*"
    );
  }, []);

  // Reference management
  const getSectionRef = useCallback((sectionId: string) => {
    if (!sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId] = React.createRef<HTMLDivElement | null>();
    }
    return sectionRefs.current[sectionId];
  }, []);

  // --------------- Effects ---------------
  // Sync local sections with state
  useEffect(() => {
    if (sections.length > 0) {
      setLocalSections(sections);
    }
  }, [sections]);

  // Setup section refs when sections change
  useEffect(() => {
    sections.forEach((section) => {
      if (!sectionRefs.current[section.id]) {
        sectionRefs.current[section.id] =
          React.createRef<HTMLDivElement | null>();
      }
    });
  }, [sections]);

  // Notify parent of section updates
  useEffect(() => {
    if (window.parent && !processingParentSettings.current) {
      window.parent.postMessage({ type: "SECTIONS_UPDATED", sections }, "*");
    }
  }, [sections]);

  // Apply background color when it changes
  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);

  // Create custom CSS style element on mount
  useEffect(() => {
    const customStyleElement = document.createElement("style");
    customStyleElement.id = "custom-css";
    document.head.appendChild(customStyleElement);

    return () => {
      if (document.head.contains(customStyleElement)) {
        document.head.removeChild(customStyleElement);
      }
    };
  }, []);

  // Keyboard shortcuts for section movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedSectionId) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSectionVertically(selectedSectionId, "up");
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSectionVertically(selectedSectionId, "down");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSectionId, moveSectionVertically]);

  // Add nav icon functionality
  useEffect(() => {
    let currentNavIconHandler: ((event: Event) => void) | null = null;
    let removeMessageListener: (() => void) | null = null;

    import("./utils/drawerUtils").then((drawerUtils) => {
      const navIconClickHandler = drawerUtils.createNavIconClickHandler();
      currentNavIconHandler = navIconClickHandler;
      drawerUtils.attachNavIconListeners(navIconClickHandler);

      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === "UPDATE_HEADER_SETTINGS") {
          setTimeout(
            () => drawerUtils.attachNavIconListeners(navIconClickHandler),
            100
          );
        }
      };

      window.addEventListener("message", messageHandler);
      removeMessageListener = () => {
        window.removeEventListener("message", messageHandler);
      };
    });

    return () => {
      if (removeMessageListener) {
        removeMessageListener();
      }

      if (currentNavIconHandler) {
        const navIcons = document.querySelectorAll('[data-item-id="nav_icon"]');
        navIcons.forEach((navIcon) => {
          navIcon.removeEventListener("click", currentNavIconHandler!);
        });
      }
    };
  }, []);

  // Initialize settings on mount
  useEffect(() => {
    initializeTypographyFromSettings();
    initializeAllSettingsFromJson();
  }, [initializeTypographyFromSettings, initializeAllSettingsFromJson]);

  // Apply top bar height from header settings
  useEffect(() => {
    if (headerSettings && headerSettings.topBarHeight) {
      const height = Number(headerSettings.topBarHeight);
      document.documentElement.style.setProperty(
        "--top-bar-height",
        `${height}px`,
        "important"
      );

      const styleId = "top-bar-height-style";
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
    }
  }, [headerSettings.topBarHeight]);

  // Load Google Font helper function
  const loadGoogleFont = (fontFamily: string, weight: string = "400") => {
    const systemFonts = [
      "Arial",
      "Times New Roman",
      "Helvetica",
      "Courier",
      "Verdana",
      "Georgia",
    ];
    if (systemFonts.some((font) => fontFamily.includes(font))) {
      return;
    }

    const fontId = `google-font-${fontFamily
      .replace(/\s+/g, "-")
      .toLowerCase()}-${weight}`;
    const loadingFonts = new Set<string>();

    if (loadingFonts.has(fontId)) {
      return;
    }

    loadingFonts.add(fontId);

    if (!document.getElementById(fontId)) {
      try {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          fontFamily.replace(/\s+/g, "+")
        )}:wght@${weight}&display=swap`;

        link.onload = () => {
          loadingFonts.delete(fontId);
          document.body.style.opacity = "0.99";
          setTimeout(() => {
            document.body.style.opacity = "1";
          }, 50);
        };

        link.onerror = () => {
          console.error(
            `Failed to load Google Font: ${fontFamily} (weight: ${weight})`
          );
          loadingFonts.delete(fontId);
        };

        document.head.appendChild(link);
      } catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
        loadingFonts.delete(fontId);
      }
    }
  };

  // ----------------- RENDER -----------------
  return (
    <>
      <Header
        settings={headerSettings as any}
        isEditing={true}
        isSelected={isHeaderSelected}
        onSelect={handleHeaderSelect}
      />
      <TooltipProvider>
        <div
          className="relative w-full h-full page-container mx-auto"
          ref={scrollAreaRef}
        >
          {localSections.map((section, index) => {
            const isVisible =
              section.isVisible !== false &&
              section.settings?.isVisible !== false;

            if (!isVisible) {
              return null;
            }

            const SectionComponent = allComponents[section.type];

            if (!SectionComponent) {
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
                  <>
                    <AddSectionButton
                      index={index}
                      activeInsertIndex={activeInsertIndex}
                      setActiveInsertIndex={setActiveInsertIndex}
                      handleAddSection={handleAddSection}
                      position="top"
                    />
                    <SectionControls
                      sectionId={section.id}
                      index={index}
                      totalSections={localSections.length}
                      onMoveUp={() => moveSectionVertically(section.id, "up")}
                      onMoveDown={() =>
                        moveSectionVertically(section.id, "down")
                      }
                      onDuplicate={() => duplicateSection(section.id)}
                      onDelete={() => deleteSection(section.id)}
                      onToggleVisibility={() => {
                        const newVisibility =
                          section.isVisible !== false ? false : true;
                        dispatch({
                          type: "TOGGLE_SECTION_VISIBILITY",
                          sectionId: section.id,
                          isVisible: newVisibility,
                        });
                      }}
                      isVisible={isVisible}
                    />
                    <AddSectionButton
                      index={index + 1}
                      activeInsertIndex={activeInsertIndex}
                      setActiveInsertIndex={setActiveInsertIndex}
                      handleAddSection={handleAddSection}
                      position="bottom"
                    />
                  </>
                )}

                <div
                  ref={getSectionRef(section.id)}
                  onClick={() => handleSectionClick(section.id)}
                  className="cursor-pointer"
                >
                  <SectionComponent
                    section={section}
                    isEditing={true}
                    isSelected={selectedSectionId === section.id}
                    onUpdateSection={(updates: Partial<Section>) => {
                      updateSection(section.id, updates);
                    }}
                  />
                </div>
              </div>
            );
          })}

          {localSections.length === 0 && (
            <div className="flex justify-center items-center h-[200px]">
              <AddSectionModal
                open={activeInsertIndex === 0}
                onOpenChange={(open: boolean) =>
                  setActiveInsertIndex(open ? 0 : null)
                }
                onAddSection={(type) => handleAddSection(type, 0)}
                buttonVariant="outline"
                buttonSize="default"
                showButtonText={true}
              />
            </div>
          )}
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
