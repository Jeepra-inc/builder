"use client";

import React, {
  useRef,
  useEffect,
  useCallback,
  useReducer,
  useState,
  Dispatch,
} from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBuilder } from "../contexts/BuilderContext";
import { GlobalSettings } from "../utils/settingsStorage";
import { useIframeEffects, loadGoogleFont } from "./hooks/useIframeEffects";
import { useMessageHandler } from "./hooks/useMessageHandler";

// Layout Components
import Header from "@/app/builder/components/BuilderLayout/header/Header";
import Footer from "../components/BuilderLayout/footer/Footer";
import { SectionControls } from "../components/IframeContent/SectionControls";
import { AddSectionModal } from "@/app/builder/components/common/AddSectionModal";

// Types and Utils
import { SectionType } from "@/app/builder/types";
import {
  HeaderSettings,
  FooterSettings,
  Section,
  GlobalStyles,
  IframeSettings,
} from "./types";
import { allComponents } from "@/app/builder/elements/sections";
import {
  sectionsReducer as importedSectionsReducer,
  initialSectionState,
  SectionState,
} from "../components/IframeContent/sectionReducer";

// Import the utilities from the utils directory
import {
  MessageHandler,
  SectionAction,
  IframeSection,
  createMessageListener,
  createBackgroundColorHandler,
  createToggleSectionVisibilityHandler,
  createLoadSettingsHandler,
  handleMoveSectionAction,
  handleToggleSectionVisibilityAction,
  generateUniqueId,
  getLogoSizeFromWidth,
  extractFontFamily,
  createDrawerOverlay,
  attachDrawerCloseHandlers,
} from "./utils";

export default function IframeContent() {
  // ----------------- State + Reducer -----------------
  const { backgroundColor } = useBuilder();
  const [state, dispatch] = useReducer(
    importedSectionsReducer,
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
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    logo: {
      text: "Builder",
      showText: true,
      image: "", // Will be populated from settings
      size: "medium", // Default size
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

  // Add header selection state
  const [isHeaderSelected, setIsHeaderSelected] = useState(false);
  const [isFooterSelected, setIsFooterSelected] = useState(false);

  // Add a flag to track if we're processing settings from parent
  const processingParentSettings = useRef(false);

  // Add function to initialize typography from settings
  const initializeTypographyFromSettings = () => {
    // Try to fetch settings.json directly (for initial load)
    fetch("/settings.json")
      .then((response) => response.json())
      .then((settings) => {
        console.log("Initializing typography from settings.json");
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

          console.log("Typography initialized from settings.json", {
            headingFont,
            bodyFont,
          });
        }
      })
      .catch((error) => {
        console.error(
          "Error loading settings.json for typography initialization:",
          error
        );
      });
  };

  // Add function to initialize all settings from settings.json
  const initializeAllSettingsFromJson = () => {
    // Try to fetch settings.json directly (for initial load)
    fetch("/settings.json")
      .then((response) => response.json())
      .then((settings) => {
        console.log("Initializing all settings from settings.json:", settings);

        // Set flag to prevent sending updates while processing settings
        processingParentSettings.current = true;

        try {
          // Process sections if available
          if (settings.sections) {
            console.log(
              "Setting sections from settings.json:",
              settings.sections
            );
            setLocalSections(settings.sections);
            dispatch({ type: "SET_SECTIONS", payload: settings.sections });
          }

          // Process header settings
          if (settings.headerSettings) {
            console.log(
              "Setting header settings from settings.json:",
              settings.headerSettings
            );

            // Log the layout and containers specifically
            if (settings.headerSettings.layout) {
              console.log(
                "Header layout from settings:",
                settings.headerSettings.layout
              );
              if (settings.headerSettings.layout.containers) {
                console.log(
                  "Header containers from settings:",
                  settings.headerSettings.layout.containers
                );
              } else {
                console.log("No containers found in header layout settings");
              }
            } else {
              console.log("No layout found in header settings");
            }

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
                  console.log("Using logo from branding:", logoFromBranding);

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

            console.log(
              "Final header settings to apply:",
              updatedHeaderSettings
            );

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
            console.log(
              "Setting footer settings from settings.json:",
              settings.footerSettings
            );
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
  };

  // Use our custom hook for effects
  const { sendHeaderSettingsToParent } = useIframeEffects({
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

  // Use our message handler hook
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

      // Extract headers if present and log them
      const headers = event.data.headers || {};
      const messageType = event.data.type;

      // Skip logging for common messages to reduce console noise
      const skipLoggingTypes = [
        "UPDATE_TYPOGRAPHY",
        "LOAD_GOOGLE_FONT",
        "LOAD_SETTINGS",
        "UPDATE_HEADER_SETTINGS",
        "UPDATE_CSS_VARIABLE",
      ];

      if (!skipLoggingTypes.includes(messageType)) {
        // Log all incoming messages with proper debug information
        console.log(
          `IFRAME: Received message of type "${messageType}" from parent`,
          {
            origin: event.origin,
            headers,
            data: event.data,
          }
        );
      }

      // Process the message based on type
      const { type } = event.data;

      switch (type) {
        case "UPDATE_BACKGROUND_COLOR": {
          const { color } = event.data;
          document.body.style.backgroundColor = color;
          break;
        }

        // Skip handlers that are now in useMessageHandler
        case "LOAD_SETTINGS":
        case "UPDATE_HEADER_SETTINGS":
        case "UPDATE_TYPOGRAPHY":
        case "LOAD_GOOGLE_FONT":
        case "UPDATE_FOOTER_SETTINGS":
          // These are now handled by useMessageHandler
          break;

        case "UPDATE_CSS_VARIABLE": {
          // Handle CSS variable updates for live preview silently
          if (event.data.variable && event.data.value) {
            // Silently update the CSS variable without logging
            document.documentElement.style.setProperty(
              event.data.variable,
              event.data.value
            );
          }
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

        // ... keep other handlers that aren't in useMessageHandler ...

        case "TEST_IFRAME_COMMUNICATION": {
          console.log("TEST: Received test communication message from parent", {
            timestamp: event.data.timestamp,
            headers: headers,
          });

          // Send acknowledgment back to parent
          if (window.parent) {
            try {
              sendMessageToParent({
                type: "TEST_COMMUNICATION_RECEIVED",
                success: true,
                timestamp: Date.now(),
                originalTimestamp: event.data.timestamp,
                headers: {
                  "Content-Type": "application/json",
                  "X-Builder-Target": headers["X-Builder-Source"] || "Unknown",
                },
              });

              console.log("TEST: Sent acknowledgment back to parent");
            } catch (error) {
              console.error("TEST: Failed to send acknowledgment:", error);
            }
          }
          break;
        }

        // ... keep other handlers ...

        case "SECTION_SELECTED": {
          setIsHeaderSelected(false);
          setIsFooterSelected(false);
          break;
        }
        case "SELECT_HEADER_SETTING": {
          const { settingId } = event.data;
          if (window.parent) {
            sendMessageToParent({
              type: "HEADER_SETTING_SELECTED",
              settingId,
            });
          }
          break;
        }

        // ... keep other handlers ...

        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [sendMessageToParent]);

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

  // Add these handlers for nav icon functionality in the iframe
  useEffect(() => {
    // Variable to store the handler so it can be accessed in cleanup
    let currentNavIconHandler: ((event: Event) => void) | null = null;
    let removeMessageListener: (() => void) | null = null;

    // Import drawer utilities
    import("./utils/drawerUtils").then((drawerUtils) => {
      // Create the nav icon click handler
      const navIconClickHandler = drawerUtils.createNavIconClickHandler();

      // Store for cleanup
      currentNavIconHandler = navIconClickHandler;

      // Initial setup of listeners
      drawerUtils.attachNavIconListeners(navIconClickHandler);

      // Setup event listener for when header settings are updated (to re-attach listeners)
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === "UPDATE_HEADER_SETTINGS") {
          // Wait a moment for DOM to update before re-attaching listeners
          setTimeout(
            () => drawerUtils.attachNavIconListeners(navIconClickHandler),
            100
          );
        }
      };

      // Add the message listener
      window.addEventListener("message", messageHandler);

      // Store cleanup function
      removeMessageListener = () => {
        window.removeEventListener("message", messageHandler);
      };
    });

    // Return cleanup function
    return () => {
      // Remove message listener if it was set
      if (removeMessageListener) {
        removeMessageListener();
      }

      // Remove click listeners
      if (currentNavIconHandler) {
        const navIcons = document.querySelectorAll('[data-item-id="nav_icon"]');
        navIcons.forEach((navIcon) => {
          navIcon.removeEventListener("click", currentNavIconHandler!);
        });
      }
    };
  }, []);

  // Track loading fonts
  const loadingFonts = new Set<string>();

  const loadGoogleFont = (fontFamily: string, weight: string = "400") => {
    // Skip system fonts
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

    // Create a unique ID for the font link
    const fontId = `google-font-${fontFamily
      .replace(/\s+/g, "-")
      .toLowerCase()}-${weight}`;

    // If already loading this font, don't try again
    if (loadingFonts.has(fontId)) {
      return;
    }

    // Mark as loading
    loadingFonts.add(fontId);

    // Check if this font is already loaded
    if (!document.getElementById(fontId)) {
      try {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
          fontFamily.replace(/\s+/g, "+")
        )}:wght@${weight}&display=swap`;

        // Set up load callbacks
        link.onload = () => {
          console.log(
            `Successfully loaded Google Font: ${fontFamily} (weight: ${weight})`
          );
          loadingFonts.delete(fontId);

          // Force a repaint to ensure the font is applied
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

        // Add the link to the document head
        document.head.appendChild(link);
        console.log(`Loading Google Font: ${fontFamily} (weight: ${weight})`);
      } catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
        loadingFonts.delete(fontId);
      }
    }
  };

  // Add effect to load initial fonts from CSS variables
  useEffect(() => {
    // There might be CSS variables already set in the document
    // from the initial CSS load, so let's check for them
    const computedStyle = getComputedStyle(document.documentElement);
    const headingFontFamily = computedStyle.getPropertyValue("--heading-font");
    const bodyFontFamily = computedStyle.getPropertyValue("--body-font");

    // Extract font family from the CSS value format "'Font Name', sans-serif"
    const extractFontFamily = (fontValue: string) => {
      const match = fontValue.match(/'([^']+)'/);
      return match ? match[1] : null;
    };

    const headingFont = extractFontFamily(headingFontFamily);
    const bodyFont = extractFontFamily(bodyFontFamily);

    // Load the fonts if they exist
    if (headingFont) {
      loadGoogleFont(headingFont);
      console.log(`Loaded initial heading font: ${headingFont}`);
    }

    if (bodyFont) {
      loadGoogleFont(bodyFont);
      console.log(`Loaded initial body font: ${bodyFont}`);
    }
  }, []);

  // Initialize CSS variables on mount
  useEffect(() => {
    initializeTypographyFromSettings();
    initializeAllSettingsFromJson();
  }, []);

  // Add a useEffect to log the headerSettings after they're updated
  useEffect(() => {
    console.log("Current headerSettings state:", headerSettings);
    // Check if layout and containers are properly set
    if (headerSettings.layout) {
      console.log("Current header layout:", headerSettings.layout);
      if (headerSettings.layout.containers) {
        console.log(
          "Current header containers:",
          headerSettings.layout.containers
        );
      } else {
        console.log("No containers in current header layout");
      }
    } else {
      console.log("No layout in current headerSettings");
    }
  }, [headerSettings]);

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
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]">
                    <div className="group/add-btn relative">
                      {/* Line that appears when hovering over the plus button or when active - grows from center */}
                      <div
                        className={`absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-[3px] bg-blue-500 
                        ${
                          activeInsertIndex === index
                            ? "w-screen"
                            : "w-0 group-hover/add-btn:w-screen"
                        } 
                        transition-all duration-300 -z-10 origin-center`}
                      ></div>

                      {/* Plus button visible on section hover - stays visible when active */}
                      <button
                        onClick={() => {
                          setActiveInsertIndex(index);
                          // Disable scrolling
                          document.body.style.overflow = "hidden";
                        }}
                        className={`flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 
                          ${
                            activeInsertIndex === index
                              ? "opacity-0"
                              : "group-hover/add-btn:opacity-0"
                          } 
                          transition-opacity`}
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

                      {/* Text button - visible on hover or when active */}
                      <button
                        onClick={() => {
                          setActiveInsertIndex(index);
                          // Disable scrolling
                          document.body.style.overflow = "hidden";
                        }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 
                          ${
                            activeInsertIndex === index
                              ? "opacity-100"
                              : "opacity-0 group-hover/add-btn:opacity-100"
                          } 
                          whitespace-nowrap transition-opacity bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 px-3 rounded-md shadow-sm font-medium z-[10000]`}
                      >
                        Add Section
                      </button>
                    </div>

                    {/* Modal that opens when clicking either button */}
                    {activeInsertIndex === index && (
                      <AddSectionModal
                        open={true}
                        onOpenChange={(open: boolean) => {
                          setActiveInsertIndex(open ? index : null);
                          // Re-enable scrolling when closed
                          if (!open) {
                            document.body.style.overflow = "auto";
                          }
                        }}
                        onAddSection={(type) => {
                          handleAddSection(type, index);
                          // Re-enable scrolling after selection
                          document.body.style.overflow = "auto";
                          setActiveInsertIndex(null);
                        }}
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
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-[10000]">
                    <div className="group/add-btn relative">
                      {/* Line that appears when hovering over the plus button or when active - grows from center */}
                      <div
                        className={`absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 h-[3px] bg-blue-500 
                        ${
                          activeInsertIndex === index + 1
                            ? "w-screen"
                            : "w-0 group-hover/add-btn:w-screen"
                        } 
                        transition-all duration-300 -z-10 origin-center`}
                      ></div>

                      {/* Plus button visible on section hover - stays visible when active */}
                      <button
                        onClick={() => {
                          setActiveInsertIndex(index + 1);
                          // Disable scrolling
                          document.body.style.overflow = "hidden";
                        }}
                        className={`flex items-center justify-center bg-blue-500 text-white rounded-full w-6 h-6 
                          ${
                            activeInsertIndex === index + 1
                              ? "opacity-0"
                              : "group-hover/add-btn:opacity-0"
                          } 
                          transition-opacity`}
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

                      {/* Text button - visible on hover or when active */}
                      <button
                        onClick={() => {
                          setActiveInsertIndex(index + 1);
                          // Disable scrolling
                          document.body.style.overflow = "hidden";
                        }}
                        className={`absolute top-0 left-1/2 transform -translate-x-1/2 
                          ${
                            activeInsertIndex === index + 1
                              ? "opacity-100"
                              : "opacity-0 group-hover/add-btn:opacity-100"
                          } 
                          whitespace-nowrap transition-opacity bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 px-3 rounded-md shadow-sm font-medium z-[10000]`}
                      >
                        Add Section
                      </button>
                    </div>

                    {/* Modal that opens when clicking either button */}
                    {activeInsertIndex === index + 1 && (
                      <AddSectionModal
                        open={true}
                        onOpenChange={(open: boolean) => {
                          setActiveInsertIndex(open ? index + 1 : null);
                          // Re-enable scrolling when closed
                          if (!open) {
                            document.body.style.overflow = "auto";
                          }
                        }}
                        onAddSection={(type) => {
                          handleAddSection(type, index + 1);
                          // Re-enable scrolling after selection
                          document.body.style.overflow = "auto";
                          setActiveInsertIndex(null);
                        }}
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
