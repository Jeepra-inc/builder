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
import { GlobalSettings } from "../utils/settingsStorage";

// Layout Components
import Header from "@/app/builder/components/BuilderLayout/header/Header";
import Footer from "../components/BuilderLayout/footer/Footer";
import { SectionControls } from "../components/IframeContent/SectionControls";
import { AddSectionModal } from "@/app/builder/components/common/AddSectionModal";

// Types and Utils
import { SectionType } from "@/app/builder/types";
import { allComponents } from "@/app/builder/elements/sections";
import {
  sectionsReducer as importedSectionsReducer,
  initialSectionState,
  SectionState,
  Section,
  SectionAction,
} from "../components/IframeContent/sectionReducer";

export default function IframeContent() {
  // ----------------- State + Reducer -----------------
  const { backgroundColor } = useBuilder();
  const [state, dispatch] = useReducer(
    localSectionsReducer,
    initialSectionState
  );
  const { sections } = state;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [lastMovedSection, setLastMovedSection] = useState<string | null>(null);
  const [activeInsertIndex, setActiveInsertIndex] = useState<number | null>(
    null
  );

  // Refs
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement | null>;
  }>({});
  const contentRef = useRef<HTMLIFrameElement | null>(null);

  // Ensure sections are always available
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  // Add headerSettings state
  const [headerSettings, setHeaderSettings] = useState({
    logo: {
      text: "Your Brand",
      showText: true,
    },
    navigation: {
      items: [
        { text: "Home", url: "#", isButton: false },
        { text: "About", url: "#", isButton: false },
        { text: "Contact", url: "#", isButton: true },
      ],
    },
    layout: {
      sticky: true,
      maxWidth: "1200px",
      currentPreset: "preset1",
      containers: {
        top_left: [],
        top_center: [],
        top_right: [],
        middle_left: ["logo"],
        middle_center: [],
        middle_right: ["cart"],
        bottom_left: [],
        bottom_center: [],
        bottom_right: [],
        available: [],
      },
    },
  });

  // Add footer settings state
  const [footerSettings, setFooterSettings] = useState({
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

  // Add header selection state
  const [isHeaderSelected, setIsHeaderSelected] = useState(false);
  const [isFooterSelected, setIsFooterSelected] = useState(false);

  // Add a flag to track if we're processing settings from parent
  const processingParentSettings = useRef(false);

  const handleHeaderSelect = useCallback(() => {
    setIsHeaderSelected(true);
    setIsFooterSelected(false);
    if (window.parent) {
      window.parent.postMessage(
        {
          type: "HEADER_SELECTED",
          settings: headerSettings,
        },
        "*"
      );
    }
  }, [headerSettings]);

  const handleFooterSelect = useCallback(() => {
    setIsFooterSelected(true);
    setIsHeaderSelected(false);
    if (window.parent) {
      window.parent.postMessage(
        {
          type: "FOOTER_SELECTED",
          settings: footerSettings,
        },
        "*"
      );
    }
  }, [footerSettings]);

  // Helper function to generate unique IDs
  const generateUniqueId = () => {
    return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper functions
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
        id: generateUniqueId(), // Ensure a new unique ID
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

  // Sync local sections with state
  useEffect(() => {
    if (sections.length > 0) {
      setLocalSections(sections);
    }
  }, [sections]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type } = event.data;

      switch (type) {
        case "UPDATE_BACKGROUND_COLOR": {
          document.body.style.backgroundColor = event.data.backgroundColor;
          break;
        }
        case "REORDER_SECTIONS": {
          const { sectionId, blocks } = event.data;
          dispatch({
            type: "REORDER_SECTIONS",
            sectionId: sectionId,
            blocks,
          });
          break;
        }
        case "UPDATE_HEADER_SETTINGS": {
          const { settings } = event.data;
          setHeaderSettings((prev) => ({ ...prev, ...settings }));
          break;
        }
        case "UPDATE_FOOTER_SETTINGS": {
          const { settings } = event.data;
          setFooterSettings((prev) => ({ ...prev, ...settings }));
          break;
        }
        case "SECTION_SELECTED": {
          setIsHeaderSelected(false);
          setIsFooterSelected(false);
          break;
        }
        case "SELECT_HEADER_SETTING": {
          const { settingId } = event.data;
          if (window.parent) {
            window.parent.postMessage(
              {
                type: "HEADER_SETTING_SELECTED",
                settingId,
              },
              "*"
            );
          }
          break;
        }

        case "SELECT_PRESET": {
          const { presetId } = event.data;
          // Send a request to the parent window to get the preset data
          if (window.parent) {
            window.parent.postMessage(
              {
                type: "GET_PRESET_DATA",
                presetId,
              },
              "*"
            );
          }
          break;
        }

        case "UPDATE_HEADER_LAYOUT": {
          // This receives the layout data from the parent after SELECT_PRESET
          const layoutData = event.data;
          // Update the header layout with the preset data
          if (layoutData) {
            const presetId = layoutData.presetId;
            delete layoutData.type; // Remove message type before storing

            setHeaderSettings((prevSettings) => ({
              ...prevSettings,
              layout: {
                ...prevSettings.layout,
                currentPreset: presetId || prevSettings.layout.currentPreset,
                // Store all layout data from the preset
                topLeft: layoutData.top_left || [],
                topCenter: layoutData.top_center || [],
                topRight: layoutData.top_right || [],
                middleLeft: layoutData.middle_left || [],
                middleCenter: layoutData.middle_center || [],
                middleRight: layoutData.middle_right || [],
                bottomLeft: layoutData.bottom_left || [],
                bottomCenter: layoutData.bottom_center || [],
                bottomRight: layoutData.bottom_right || [],
                available: layoutData.available || [],
              },
            }));

            // Also notify parent that header was updated
            if (window.parent) {
              window.parent.postMessage(
                {
                  type: "HEADER_LAYOUT_UPDATED",
                  presetId,
                },
                "*"
              );
            }
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) {
        return;
      }

      switch (event.data.type) {
        case "TOGGLE_SECTION_VISIBILITY": {
          const { sectionId, isVisible } = event.data;

          if (!sectionId) {
            return;
          }

          const existingSection = localSections.find((s) => s.id === sectionId);

          if (!existingSection || existingSection.isVisible !== isVisible) {
            setLocalSections((prevSections) =>
              prevSections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      isVisible: isVisible ?? section.isVisible,
                      settings: {
                        ...section.settings,
                        isVisible:
                          isVisible ?? section.settings?.isVisible ?? true,
                      },
                    }
                  : section
              )
            );

            dispatch({
              type: "TOGGLE_SECTION_VISIBILITY",
              sectionId,
              isVisible,
            });
          }
          break;
        }

        case "UPDATE_SECTION": {
          dispatch({
            type: "UPDATE_SECTION",
            sectionId: event.data.sectionId,
            updates: event.data.updates.settings ?? {},
          });
          break;
        }

        case "SECTIONS_UPDATED": {
          dispatch({ type: "SET_SECTIONS", payload: event.data.sections });
          break;
        }

        case "DELETE_SECTION": {
          dispatch({
            type: "DELETE_SECTION",
            sectionId: event.data.sectionId,
          });
          break;
        }

        case "ADD_SECTION": {
          dispatch({
            type: "ADD_SECTION",
            payload: event.data.section,
            index: event.data.index,
          });

          if (event.data.scrollToSection) {
            const newSectionId = event.data.section.id;

            setTimeout(() => {
              const sectionRef = sectionRefs.current[newSectionId];
              sectionRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          }
          break;
        }

        case "SCROLL_TO_SECTION": {
          const sectionId = event.data.sectionId;
          const sectionRef = sectionRefs.current[sectionId];
          sectionRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          break;
        }

        case "REORDER_SECTIONS": {
          dispatch({
            type: "REORDER_SECTIONS",
            sectionId: event.data.sectionId,
            blocks: event.data.blocks,
          });
          if (event.data.scrollToSectionId) {
            setHoveredSection(event.data.scrollToSectionId);
            const sectionRef =
              sectionRefs.current[event.data.scrollToSectionId];
            sectionRef?.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            setTimeout(() => setHoveredSection(null), 2000);
          }
          break;
        }

        case "HOVER_SECTION": {
          const id = event.data.sectionId;
          setHoveredSection(id);
          const sectionRef = sectionRefs.current[id];
          sectionRef?.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setTimeout(() => setHoveredSection(null), 2000);
          break;
        }

        case "UNDO": {
          dispatch({ type: "UNDO" });
          break;
        }

        case "REDO": {
          dispatch({ type: "REDO" });
          break;
        }

        case "DUPLICATE_LAYER": {
          const newSection = {
            ...event.data.layer,
            id: `section_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          };

          const insertIndex =
            event.data.currentIndex !== undefined
              ? event.data.currentIndex + 1
              : sections.length;

          dispatch({
            type: "ADD_SECTION",
            payload: newSection,
            index: insertIndex,
          });
          break;
        }

        case "DELETE_LAYER": {
          dispatch({
            type: "DELETE_SECTION",
            sectionId: event.data.layerId,
          });
          break;
        }

        case "UPDATE_BACKGROUND_COLOR": {
          const { backgroundColor } = event.data;
          document.body.style.backgroundColor = backgroundColor;
          break;
        }

        case "UPDATE_HEADER": {
          const { settings } = event.data;
          const header = document.querySelector("header");
          if (header) {
            if (settings.backgroundColor) {
              header.style.backgroundColor = settings.backgroundColor;
            }
            const logo = header.querySelector("img");
            if (logo && settings.logoUrl) {
              logo.src = settings.logoUrl;
              logo.style.width = `${settings.logoWidth}px`;
            }
          }
          break;
        }

        case "UPDATE_TYPOGRAPHY": {
          const { settings } = event.data;
          const root = document.documentElement;
          if (settings.headingColor) {
            root.style.setProperty("--heading-color", settings.headingColor);
          }
          break;
        }

        case "UPDATE_CUSTOM_CSS": {
          const { settings } = event.data;
          const customStyleElement = document.getElementById("custom-css");
          if (customStyleElement) {
            customStyleElement.textContent = settings.customCSS;
          }
          break;
        }

        case "UPDATE_HEADER_SETTINGS": {
          const { settings } = event.data;
          setHeaderSettings((prev) => ({ ...prev, ...settings }));
          break;
        }

        case "UPDATE_FOOTER_SETTINGS": {
          const { settings } = event.data;
          setFooterSettings((prev) => ({ ...prev, ...settings }));
          break;
        }

        case "SECTION_SELECTED": {
          setIsHeaderSelected(false);
          setIsFooterSelected(false);
          break;
        }

        default:
          break;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [localSections, dispatch]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "LOAD_SETTINGS") {
        console.log("Iframe received LOAD_SETTINGS message:", event.data);

        // Set flag to prevent sending updates while processing parent settings
        processingParentSettings.current = true;

        try {
          // Process settings from parent
          if (event.data.settings) {
            if (event.data.settings.sections) {
              console.log(
                "Setting sections in iframe:",
                event.data.settings.sections
              );
              setLocalSections(event.data.settings.sections);
            }

            if (event.data.settings.headerSettings) {
              console.log(
                "Setting header settings in iframe:",
                event.data.settings.headerSettings
              );
              setHeaderSettings(event.data.settings.headerSettings);
            }

            if (event.data.settings.footerSettings) {
              console.log(
                "Setting footer settings in iframe:",
                event.data.settings.footerSettings
              );
              setFooterSettings(event.data.settings.footerSettings);
            }

            // Apply global styles
            document.body.style.backgroundColor =
              event.data.settings.globalStyles.branding.backgroundColor;

            // Apply typography settings
            const root = document.documentElement;
            root.style.setProperty(
              "--heading-color",
              event.data.settings.globalStyles.typography.headingColor
            );
            root.style.setProperty(
              "--heading-size-scale",
              `${
                event.data.settings.globalStyles.typography.headingSizeScale /
                100
              }`
            );
            root.style.setProperty(
              "--body-size-scale",
              `${
                event.data.settings.globalStyles.typography.bodySizeScale / 100
              }`
            );

            // Apply custom CSS
            const customStyleElement = document.getElementById("custom-css");
            if (customStyleElement) {
              customStyleElement.textContent =
                event.data.settings.globalStyles.customCSS;
            }
          }
        } finally {
          // Reset the flag after a short delay to ensure all state updates have been processed
          setTimeout(() => {
            processingParentSettings.current = false;
          }, 500);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

  useEffect(() => {
    sections.forEach((section) => {
      if (!sectionRefs.current[section.id]) {
        sectionRefs.current[section.id] =
          React.createRef<HTMLDivElement | null>();
      }
    });
  }, [sections]);

  useEffect(() => {
    // Only notify parent of section updates if not currently processing parent settings
    if (window.parent && !processingParentSettings.current) {
      window.parent.postMessage({ type: "SECTIONS_UPDATED", sections }, "*");
    }
  }, [sections]);

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
  }, [backgroundColor]);

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

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);

    // This is the key fix - send a message to the parent window to open the section settings
    window.parent.postMessage(
      {
        type: "SELECT_SECTION",
        sectionId,
        action: "OPEN_SETTINGS",
      },
      "*"
    );
  }, []);

  const handleUndo = () => dispatch({ type: "UNDO" });

  const handleRedo = () => dispatch({ type: "REDO" });

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

  const getSectionRef = useCallback((sectionId: string) => {
    if (!sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId] = React.createRef<HTMLDivElement | null>();
    }
    return sectionRefs.current[sectionId];
  }, []);

  useEffect(() => {
    const handleHeaderLayoutMessage = (event: MessageEvent) => {
      if (event.data.type === "UPDATE_HEADER_LAYOUT") {
        console.log(
          "Iframe received UPDATE_HEADER_LAYOUT message:",
          event.data
        );

        try {
          const { presetId, ...layoutData } = event.data;

          // Extract the containers from the message
          const containers = {
            top_left: layoutData.top_left || [],
            top_center: layoutData.top_center || [],
            top_right: layoutData.top_right || [],
            middle_left: layoutData.middle_left || [],
            middle_center: layoutData.middle_center || [],
            middle_right: layoutData.middle_right || [],
            bottom_left: layoutData.bottom_left || [],
            bottom_center: layoutData.bottom_center || [],
            bottom_right: layoutData.bottom_right || [],
            available: layoutData.available || [],
          };

          // Update header settings with the new layout
          setHeaderSettings((prev) => ({
            ...prev,
            layout: {
              ...prev.layout,
              currentPreset: presetId,
              containers: containers,
            },
          }));

          console.log("Header layout updated in iframe:", containers);
        } catch (error) {
          console.error("Error updating header layout in iframe:", error);
        }
      }
    };

    window.addEventListener("message", handleHeaderLayoutMessage);
    return () =>
      window.removeEventListener("message", handleHeaderLayoutMessage);
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
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="group/add-btn relative">
                      {/* Line that appears when hovering over the plus button - grows from center */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-[3px] bg-blue-500 w-0 group-hover/add-btn:w-screen transition-all duration-300 -z-10 origin-center"></div>

                      {/* Plus button visible on section hover */}
                      <button
                        onClick={() => setActiveInsertIndex(index)}
                        className="flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 group-hover/add-btn:opacity-0 transition-opacity"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 1.5V10.5M1.5 6H10.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Text button only shown when hovering over the plus button */}
                      <button
                        onClick={() => setActiveInsertIndex(index)}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/add-btn:opacity-100 whitespace-nowrap transition-opacity bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 px-3 rounded-md shadow-sm font-medium"
                      >
                        Add Section
                      </button>
                    </div>

                    {/* Modal that opens when clicking either button */}
                    {activeInsertIndex === index && (
                      <AddSectionModal
                        open={true}
                        onOpenChange={(open: boolean) =>
                          setActiveInsertIndex(open ? index : null)
                        }
                        onAddSection={(type) => handleAddSection(type, index)}
                        buttonVariant="outline"
                        buttonSize="icon"
                        buttonClassName="hidden" // Hide the default button
                      />
                    )}
                  </div>
                )}

                <div
                  ref={getSectionRef(section.id)}
                  onClick={() => handleSectionClick(section.id)}
                  className="cursor-pointer"
                >
                  {hoveredSection === section.id && (
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
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
                    <div className="group/add-btn relative">
                      {/* Line that appears when hovering over the plus button - grows from center */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-[3px] bg-blue-500 w-0 group-hover/add-btn:w-screen transition-all duration-300 -z-10 origin-center"></div>

                      {/* Plus button visible on section hover */}
                      <button
                        onClick={() => setActiveInsertIndex(index + 1)}
                        className="flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 group-hover/add-btn:opacity-0 transition-opacity"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 1.5V10.5M1.5 6H10.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>

                      {/* Text button only shown when hovering over the plus button */}
                      <button
                        onClick={() => setActiveInsertIndex(index + 1)}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/add-btn:opacity-100 whitespace-nowrap transition-opacity bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 px-3 rounded-md shadow-sm font-medium"
                      >
                        Add Section
                      </button>
                    </div>

                    {/* Modal that opens when clicking either button */}
                    {activeInsertIndex === index + 1 && (
                      <AddSectionModal
                        open={true}
                        onOpenChange={(open: boolean) =>
                          setActiveInsertIndex(open ? index + 1 : null)
                        }
                        onAddSection={(type) =>
                          handleAddSection(type, index + 1)
                        }
                        buttonVariant="outline"
                        buttonSize="icon"
                        buttonClassName="hidden" // Hide the default button
                      />
                    )}
                  </div>
                )}
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

          <div className="fixed bottom-4 right-4 z-50">
            <AddSectionModal
              onAddSection={(type) => handleAddSection(type)}
              buttonVariant="outline"
              buttonSize="icon"
            />
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

function localSectionsReducer(
  state: SectionState,
  action: SectionAction
): SectionState {
  if (action.type === "TOGGLE_SECTION_VISIBILITY") {
    const updatedSections = state.sections.map((section) =>
      section.id === action.sectionId
        ? { ...section, isVisible: action.isVisible }
        : section
    );
    return { ...state, sections: updatedSections };
  }

  if (action.type === "MOVE_SECTION") {
    const { sectionId, direction } = action;
    const currentIndex = state.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return state;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= state.sections.length) return state;

    const updatedSections = [...state.sections];
    const [removed] = updatedSections.splice(currentIndex, 1);
    updatedSections.splice(newIndex, 0, removed);

    return { ...state, sections: updatedSections };
  }

  return importedSectionsReducer(state, action);
}
