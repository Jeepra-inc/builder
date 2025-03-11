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

// First, let's fix the HeaderSettings type definition
interface HeaderSettings {
  logo?: {
    text: string;
    showText: boolean;
    image?: string;
    size?: string;
  };
  navigation?: {
    menuType: string;
    items: any[];
  };
  layout?: {
    sticky: boolean;
    maxWidth: string;
    currentPreset: string;
    containers: {
      top_left: any[];
      top_center: any[];
      top_right: any[];
      middle_left: any[];
      middle_center: any[];
      middle_right: any[];
      bottom_left: any[];
      bottom_center: any[];
      bottom_right: any[];
      available: any[];
    };
  };
  search?: {
    show: boolean; // Required fields
    type: string;
    showText: boolean;
    behavior: string;
    design: string;
    placeholder?: string;
    rounded?: number;
    style?: string;
    shape?: string;
    showIcon?: boolean;
    iconPosition?: string;
    iconColor?: string;
    iconSize?: string;
    fontSize?: string;
    textColor?: string;
    width?: string;
    showButton?: boolean;
    buttonText?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    [key: string]: any; // Allow for additional search properties
  };
  account?: {
    showText: boolean;
    text: string;
    showIcon: boolean;
    style?: string;
    iconStyle?: string;
    iconSize?: string;
    dropdownEnabled?: boolean;
    loginEnabled?: boolean;
    registerEnabled?: boolean;
    [key: string]: any;
  };
  contact?: {
    show: boolean;
    email?: string;
    emailLabel?: string;
    phone?: string;
    location?: string;
    locationLabel?: string;
    openHours?: string;
    hoursDetails?: string;
  };
  [key: string]: any; // Allow for additional properties
}

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

      // Extract headers if present and log them
      const headers = event.data.headers || {};
      const messageType = event.data.type;

      // Log all incoming messages with proper debug information
      console.log(
        `IFRAME: Received message of type "${messageType}" from parent`,
        {
          origin: event.origin,
          headers,
          data: event.data,
        }
      );

      // Process the message based on type
      const { type } = event.data;

      switch (type) {
        case "UPDATE_BACKGROUND_COLOR": {
          const { color } = event.data;
          document.body.style.backgroundColor = color;
          break;
        }

        // Add a handler for LOAD_SETTINGS
        case "LOAD_SETTINGS": {
          const { settings } = event.data;
          console.log("Received LOAD_SETTINGS message:", settings);

          // Update our local state
          if (settings.sections) {
            dispatch({ type: "SET_SECTIONS", payload: settings.sections });
          }

          if (settings.headerSettings) {
            setHeaderSettings((prev) => ({
              ...prev,
              ...settings.headerSettings,
            }));
          }

          if (settings.footerSettings) {
            setFooterSettings((prev) => ({
              ...prev,
              ...settings.footerSettings,
            }));
          }

          // Directly handle typography settings to ensure fonts load
          if (settings.globalStyles?.typography) {
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

            console.log("Typography initialized from LOAD_SETTINGS", {
              headingFont,
              bodyFont,
            });
          }

          break;
        }
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
        case "UPDATE_HEADER_SETTINGS": {
          const { settings } = event.data;

          // Add debug for logo updates
          if (settings.logo) {
            console.log("IFRAME: Received logo settings:", settings.logo);
          }

          // If the settings include navIcon, handle it specially
          if (settings.navIcon) {
            console.log("IFRAME: Received navIcon settings:", settings.navIcon);

            // Update navIcon elements in the DOM
            const navIcons = document.querySelectorAll(
              '[data-item-id="nav_icon"]'
            );
            navIcons.forEach((navIcon) => {
              // Update navIcon with the new settings
              const container = navIcon.closest(".nav-icon-container");
              if (container) {
                // Update drawer settings
                container.setAttribute(
                  "data-drawer-effect",
                  settings.navIcon.drawerEffect || "slide"
                );
                container.setAttribute(
                  "data-drawer-direction",
                  settings.navIcon.drawerDirection || "left"
                );

                // Update icon
                const iconType = settings.navIcon.type || "hamburger";
                const iconSize = settings.navIcon.iconSize || "24px";
                const iconColor = settings.navIcon.iconColor || "#333333";

                // Generate SVG based on icon type
                let iconSvg = "";
                switch (iconType) {
                  case "chevron":
                    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>`;
                    break;
                  case "dots":
                    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>`;
                    break;
                  case "justify":
                    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
                    break;
                  default: // hamburger
                    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>`;
                }

                // Find the nav-icon-button or create it
                let navIconButton = container.querySelector(".nav-icon-button");
                if (!navIconButton) {
                  navIconButton = document.createElement("div");
                  (navIconButton as HTMLElement).className = "nav-icon-button";
                  (navIconButton as HTMLElement).style.display = "flex";
                  (navIconButton as HTMLElement).style.alignItems = "center";
                  (navIconButton as HTMLElement).style.gap = "8px";
                  container.appendChild(navIconButton);
                } else {
                  // Clear existing content
                  navIconButton.innerHTML = "";
                }

                // Create content based on position
                const position = settings.navIcon.position || "right";
                const showText = settings.navIcon.showText !== false;
                const text = settings.navIcon.text || "Menu";
                const textColor = settings.navIcon.textColor || "#333333";

                // Create icon element
                const iconElement = document.createElement("div");
                iconElement.innerHTML = iconSvg;

                // Create text element if enabled
                let textElement;
                if (showText) {
                  textElement = document.createElement("span");
                  textElement.className = "nav-icon-text";
                  (textElement as HTMLElement).style.color = textColor;
                  textElement.textContent = text;
                }

                // Add elements in the right order based on position
                if (position === "left") {
                  navIconButton.appendChild(iconElement);
                  if (textElement) {
                    navIconButton.appendChild(textElement);
                  }
                } else {
                  if (textElement) {
                    navIconButton.appendChild(textElement);
                  }
                  navIconButton.appendChild(iconElement);
                }
              }
            });

            // Send confirmation back to parent
            if (window.parent) {
              try {
                window.parent.postMessage(
                  {
                    type: "NAV_ICON_SETTINGS_UPDATED",
                    success: true,
                    timestamp: Date.now(),
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target":
                        headers["X-Builder-Source"] || "Unknown",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error(
                  "IFRAME: Failed to send nav icon settings confirmation:",
                  error
                );
              }
            }
          }

          // If the settings include contact, handle it
          if (settings.contact) {
            console.log("IFRAME: Received contact settings:", settings.contact);

            // Update contact elements in the DOM
            const contactContainers = document.querySelectorAll(
              '[data-item-id="contact"]'
            );

            contactContainers.forEach((container) => {
              // Show/hide based on the show setting
              if (container instanceof HTMLElement) {
                if (settings.contact.show === false) {
                  container.style.display = "none";
                } else {
                  container.style.display = "flex";
                  container.style.flexDirection = "column";
                  container.style.gap = "5px";
                }
              }

              // For creating SVG elements
              const createSvgElement = (svgPath: string) => {
                const div = document.createElement("div");
                div.innerHTML = svgPath;
                return div.firstChild as SVGElement;
              };

              // Update or create email if provided
              if (settings.contact.email) {
                let emailItem = container.querySelector(".contact-item.email");

                // Create email item if it doesn't exist
                if (!emailItem) {
                  emailItem = document.createElement("div");
                  emailItem.className = "contact-item email";
                  (emailItem as HTMLElement).style.display = "flex";
                  (emailItem as HTMLElement).style.alignItems = "center";
                  (emailItem as HTMLElement).style.gap = "8px";

                  // Create email icon
                  const emailSvg =
                    createSvgElement(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>`);

                  // Create label
                  const label = document.createElement("span");
                  label.className = "contact-label";

                  // Create value
                  const value = document.createElement("a");
                  value.className = "contact-value";

                  // Append everything
                  emailItem.appendChild(emailSvg);
                  emailItem.appendChild(label);
                  emailItem.appendChild(value);
                  container.appendChild(emailItem);
                }

                // Update email content
                const label = emailItem.querySelector(".contact-label");
                if (label) {
                  label.textContent = settings.contact.emailLabel
                    ? `${settings.contact.emailLabel}: `
                    : "Email: ";
                }

                const value = emailItem.querySelector(".contact-value");
                if (value) {
                  value.textContent = settings.contact.email;
                  (
                    value as HTMLAnchorElement
                  ).href = `mailto:${settings.contact.email}`;
                }
              }

              // Update or create phone if provided
              if (settings.contact.phone) {
                let phoneItem = container.querySelector(".contact-item.phone");

                // Create phone item if it doesn't exist
                if (!phoneItem) {
                  phoneItem = document.createElement("div");
                  phoneItem.className = "contact-item phone";
                  (phoneItem as HTMLElement).style.display = "flex";
                  (phoneItem as HTMLElement).style.alignItems = "center";
                  (phoneItem as HTMLElement).style.gap = "8px";

                  // Create phone icon
                  const phoneSvg =
                    createSvgElement(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>`);

                  // Create value
                  const value = document.createElement("a");
                  value.className = "contact-value";

                  // Append everything
                  phoneItem.appendChild(phoneSvg);
                  phoneItem.appendChild(value);
                  container.appendChild(phoneItem);
                }

                // Update phone content
                const value = phoneItem.querySelector(".contact-value");
                if (value) {
                  value.textContent = settings.contact.phone;
                  (
                    value as HTMLAnchorElement
                  ).href = `tel:${settings.contact.phone}`;
                }
              }

              // Update or create location if provided
              if (settings.contact.location) {
                let locationItem = container.querySelector(
                  ".contact-item.location"
                );

                // Create location item if it doesn't exist
                if (!locationItem) {
                  locationItem = document.createElement("div");
                  locationItem.className = "contact-item location";
                  (locationItem as HTMLElement).style.display = "flex";
                  (locationItem as HTMLElement).style.alignItems = "center";
                  (locationItem as HTMLElement).style.gap = "8px";

                  // Create location icon
                  const locationSvg =
                    createSvgElement(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>`);

                  // Create label
                  const label = document.createElement("span");
                  label.className = "contact-label";

                  // Create value
                  const value = document.createElement("span");
                  value.className = "contact-value";

                  // Append everything
                  locationItem.appendChild(locationSvg);
                  locationItem.appendChild(label);
                  locationItem.appendChild(value);
                  container.appendChild(locationItem);
                }

                // Update location content
                const label = locationItem.querySelector(".contact-label");
                if (label) {
                  label.textContent = settings.contact.locationLabel
                    ? `${settings.contact.locationLabel}: `
                    : "Location: ";
                }

                const value = locationItem.querySelector(".contact-value");
                if (value) {
                  value.textContent = settings.contact.location;
                }
              }

              // Update or create hours if provided
              if (settings.contact.openHours || settings.contact.hoursDetails) {
                let hoursItem = container.querySelector(".contact-item.hours");

                // Create hours item if it doesn't exist
                if (!hoursItem) {
                  hoursItem = document.createElement("div");
                  hoursItem.className = "contact-item hours";
                  (hoursItem as HTMLElement).style.display = "flex";
                  (hoursItem as HTMLElement).style.alignItems = "center";
                  (hoursItem as HTMLElement).style.gap = "8px";
                  (hoursItem as HTMLElement).style.position = "relative";

                  // Create hours icon
                  const hoursSvg =
                    createSvgElement(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>`);

                  // Create label
                  const label = document.createElement("span");
                  label.className = "contact-label";

                  // Create details popup
                  const details = document.createElement("div");
                  details.className = "contact-hours-details";
                  (details as HTMLElement).style.display = "none";
                  (details as HTMLElement).style.position = "absolute";
                  (details as HTMLElement).style.background = "white";
                  (details as HTMLElement).style.padding = "10px";
                  (details as HTMLElement).style.border = "1px solid #eee";
                  (details as HTMLElement).style.borderRadius = "4px";
                  (details as HTMLElement).style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.1)";
                  (details as HTMLElement).style.zIndex = "100";
                  (details as HTMLElement).style.whiteSpace = "pre-line";
                  (details as HTMLElement).style.top = "100%";
                  (details as HTMLElement).style.left = "0";

                  // Append everything
                  hoursItem.appendChild(hoursSvg);
                  hoursItem.appendChild(label);
                  hoursItem.appendChild(details);
                  container.appendChild(hoursItem);
                }

                // Update hours content
                const label = hoursItem.querySelector(".contact-label");
                if (label && settings.contact.openHours) {
                  label.textContent = settings.contact.openHours;
                }

                const details = hoursItem.querySelector(
                  ".contact-hours-details"
                );
                if (details && settings.contact.hoursDetails) {
                  details.innerHTML = settings.contact.hoursDetails.replace(
                    /\n/g,
                    "<br>"
                  );
                }

                // Add hover effect to show hours details
                (hoursItem as HTMLElement).onmouseenter = () => {
                  if (details) {
                    (details as HTMLElement).style.display = "block";
                  }
                };

                (hoursItem as HTMLElement).onmouseleave = () => {
                  if (details) {
                    (details as HTMLElement).style.display = "none";
                  }
                };
              }
            });
          }

          setHeaderSettings((prev) => ({ ...prev, ...settings }));

          // Log updated header settings
          if (settings.logo) {
            setTimeout(() => {
              console.log("IFRAME: Updated headerSettings:", headerSettings);
            }, 100);
          }

          break;
        }

        // Add handlers for the search-specific message types
        case "TEST_IFRAME_COMMUNICATION": {
          console.log("TEST: Received test communication message from parent", {
            timestamp: event.data.timestamp,
            headers: headers,
          });

          // Send acknowledgment back to parent
          if (window.parent) {
            try {
              window.parent.postMessage(
                {
                  type: "TEST_COMMUNICATION_RECEIVED",
                  success: true,
                  timestamp: Date.now(),
                  originalTimestamp: event.data.timestamp,
                  headers: {
                    "Content-Type": "application/json",
                    "X-Builder-Target":
                      headers["X-Builder-Source"] || "Unknown",
                  },
                },
                event.origin || "*"
              );

              console.log("TEST: Sent acknowledgment back to parent");
            } catch (error) {
              console.error("TEST: Failed to send acknowledgment:", error);
            }
          }
          break;
        }

        case "INITIALIZE_SEARCH_SETTINGS": {
          console.log("SEARCH: Received initial search settings from parent", {
            settings: event.data.settings,
            headers: headers,
          });

          // Apply the search settings
          if (event.data.settings) {
            setHeaderSettings((prev) => ({
              ...prev,
              search: {
                ...prev.search,
                ...event.data.settings,
              },
            }));

            // Send confirmation back to parent
            if (window.parent) {
              try {
                window.parent.postMessage(
                  {
                    type: "SEARCH_SETTINGS_RECEIVED",
                    success: true,
                    timestamp: Date.now(),
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target":
                        headers["X-Builder-Source"] || "Unknown",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error(
                  "SEARCH: Failed to send settings confirmation:",
                  error
                );
              }
            }
          }
          break;
        }

        case "DIRECT_SEARCH_SETTING_UPDATE": {
          console.log("SEARCH: Received direct search setting update", {
            key: event.data.key,
            value: event.data.value,
            headers: headers,
          });

          // Apply the specific search setting update
          if (event.data.key) {
            setHeaderSettings((prev) => ({
              ...prev,
              search: {
                ...prev.search,
                [event.data.key]: event.data.value,
              },
            }));

            // Send confirmation back to parent
            if (window.parent) {
              try {
                window.parent.postMessage(
                  {
                    type: "SEARCH_SETTING_UPDATE_RECEIVED",
                    key: event.data.key,
                    value: event.data.value,
                    success: true,
                    timestamp: Date.now(),
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target":
                        headers["X-Builder-Source"] || "Unknown",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error(
                  "SEARCH: Failed to send update confirmation:",
                  error
                );
              }
            }
          }
          break;
        }

        case "FULL_SEARCH_SETTINGS_UPDATE": {
          console.log("SEARCH: Received full search settings update", {
            settings: event.data.settings,
            headers: headers,
          });

          // Apply the full search settings update
          if (event.data.settings) {
            setHeaderSettings((prev) => ({
              ...prev,
              search: {
                ...prev.search,
                ...event.data.settings,
              },
            }));

            // Send confirmation back to parent
            if (window.parent) {
              try {
                window.parent.postMessage(
                  {
                    type: "FULL_SEARCH_SETTINGS_RECEIVED",
                    success: true,
                    timestamp: Date.now(),
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target":
                        headers["X-Builder-Source"] || "Unknown",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error(
                  "SEARCH: Failed to send full update confirmation:",
                  error
                );
              }
            }
          }
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
                ...(prevSettings.layout || {
                  sticky: false,
                  maxWidth: "1200px",
                  currentPreset: "",
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
                }),
                currentPreset:
                  presetId || prevSettings.layout?.currentPreset || "default",
                // Store layout data in the containers property as expected by Header.tsx
                containers: {
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
                },
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

        case "EXECUTE_DIRECT_SCRIPT": {
          console.log("IFRAME: Received script to execute directly");

          if (typeof event.data.script === "string") {
            try {
              // Execute the script in the iframe context
              // Using Function constructor to avoid eval directly
              const scriptFunction = new Function(event.data.script);
              scriptFunction();

              // Send confirmation back to parent
              if (window.parent) {
                try {
                  window.parent.postMessage(
                    {
                      type: "SCRIPT_EXECUTION_COMPLETE",
                      success: true,
                      timestamp: Date.now(),
                      headers: {
                        "Content-Type": "application/json",
                        "X-Builder-Target":
                          headers["X-Builder-Source"] || "Unknown",
                      },
                    },
                    event.origin || "*"
                  );
                } catch (error) {
                  console.error(
                    "IFRAME: Failed to send script execution confirmation:",
                    error
                  );
                }
              }
            } catch (error) {
              console.error("IFRAME: Error executing script:", error);

              // Send error back to parent
              if (window.parent) {
                try {
                  window.parent.postMessage(
                    {
                      type: "SCRIPT_EXECUTION_ERROR",
                      error: String(error),
                      timestamp: Date.now(),
                      headers: {
                        "Content-Type": "application/json",
                        "X-Builder-Target":
                          headers["X-Builder-Source"] || "Unknown",
                      },
                    },
                    event.origin || "*"
                  );
                } catch (sendError) {
                  console.error(
                    "IFRAME: Failed to send error message:",
                    sendError
                  );
                }
              }
            }
          } else {
            console.error(
              "IFRAME: Received invalid script:",
              event.data.script
            );
          }
          break;
        }

        case "UPDATE_LOGO": {
          const { logoUrl, logoWidth } = event.data;
          console.log("Handling UPDATE_LOGO message:", { logoUrl, logoWidth });

          // Update the header settings with the logo information
          setHeaderSettings((prev) => {
            // Create a new logo object, preserving existing properties
            const updatedLogo = {
              ...(prev.logo || { text: "Your Brand", showText: true }),
              image: logoUrl,
              size: getLogoSizeFromWidth(logoWidth),
            };

            console.log("Updating header settings with logo:", updatedLogo);

            return {
              ...prev,
              logo: updatedLogo,
            };
          });

          // Update the CSS variable for logo width
          document.documentElement.style.setProperty(
            "--logo-width",
            `${logoWidth}px`
          );

          // Log the update to help debug
          setTimeout(() => {
            console.log("Header settings after UPDATE_LOGO:", headerSettings);
          }, 100);

          break;
        }

        case "HEADER_SETTINGS_UPDATED": {
          const { settings } = event.data;

          if (settings) {
            const header = document.querySelector("header");
            if (header) {
              if (settings.backgroundColor) {
                header.style.backgroundColor = settings.backgroundColor;
              }
              const logo = header.querySelector("img");
              if (logo && settings.logoUrl) {
                logo.src = settings.logoUrl;
                // Update the CSS variable instead of direct styling
                if (settings.logoWidth) {
                  document.documentElement.style.setProperty(
                    "--logo-width",
                    `${settings.logoWidth}px`
                  );
                }
              }
            }
          }
          break;
        }

        case "UPDATE_TYPOGRAPHY": {
          const { settings } = event.data;
          const root = document.documentElement;

          // Apply typography settings to CSS variables
          if (settings.headingColor) {
            root.style.setProperty("--heading-color", settings.headingColor);
          }

          // Handle font updates
          if (settings.headingFont) {
            const [headingFontFamily, headingFontWeight] =
              settings.headingFont.split(":");
            root.style.setProperty(
              "--heading-font",
              `'${headingFontFamily}', sans-serif`
            );

            // Load the heading font if it's not a system font
            loadGoogleFont(headingFontFamily, headingFontWeight || "400");
          }

          if (settings.bodyFont) {
            const [bodyFontFamily, bodyFontWeight] =
              settings.bodyFont.split(":");
            root.style.setProperty(
              "--body-font",
              `'${bodyFontFamily}', sans-serif`
            );

            // Load the body font if it's not a system font
            loadGoogleFont(bodyFontFamily, bodyFontWeight || "400");
          }

          // Apply font size scales
          if (settings.headingSizeScale) {
            root.style.setProperty(
              "--heading-size-scale",
              `${settings.headingSizeScale / 100}`
            );
          }

          if (settings.bodySizeScale) {
            root.style.setProperty(
              "--body-size-scale",
              `${settings.bodySizeScale / 100}`
            );
          }

          break;
        }

        case "UPDATE_FOOTER_SETTINGS": {
          const { settings } = event.data;
          setFooterSettings((prev) => ({ ...prev, ...settings }));
          break;
        }

        case "LOAD_GOOGLE_FONT": {
          const { fontFamily, fontWeight } = event.data;
          if (fontFamily) {
            loadGoogleFont(fontFamily, fontWeight || "400");
            console.log(
              `Loaded Google Font from parent request: ${fontFamily} (weight: ${
                fontWeight || "400"
              })`
            );
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
            }
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

            // Process header settings
            if (event.data.settings.headerSettings) {
              // Check specifically for logo in header settings
              if (event.data.settings.headerSettings.logo) {
                console.log(
                  "Received logo in header settings:",
                  event.data.settings.headerSettings.logo
                );
              }

              // Create updated header settings with merged logo info
              const updatedHeaderSettings = {
                ...event.data.settings.headerSettings,
              };

              // Check for additional logo info in globalStyles.branding
              if (event.data.settings.globalStyles?.branding) {
                const branding = event.data.settings.globalStyles.branding;

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
                "Setting header settings in iframe with logo:",
                updatedHeaderSettings.logo
              );

              setHeaderSettings(updatedHeaderSettings);

              // After setting, log the current header settings to verify logo was applied
              setTimeout(() => {
                console.log(
                  "Current header settings after update:",
                  headerSettings
                );
              }, 100);
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

  // Add these handlers for nav icon functionality in the iframe
  useEffect(() => {
    // Handler function for navigation icon clicks
    const handleNavIconClick = (event: Event) => {
      event.preventDefault();

      console.log("IFRAME: Navigation icon clicked, sending settings message");

      // Send message to open the navigation icon settings
      window.parent.postMessage(
        {
          type: "HEADER_SETTING_SELECTED",
          settingId: "nav_icon",
          submenu: "Navigation Icon",
          itemType: "nav_icon",
          source: "nav-icon-click",
          timestamp: Date.now(),
          directNav: true,
        },
        "*"
      );

      console.log("IFRAME: Message sent to open Navigation Icon settings");

      // Get the drawer settings from the clicked nav icon
      const container = (event.currentTarget as HTMLElement).closest(
        ".nav-icon-container"
      );
      if (!container) return;

      const drawerEffect =
        container.getAttribute("data-drawer-effect") || "slide";
      const drawerDirection =
        container.getAttribute("data-drawer-direction") || "left";

      // Create or get drawer
      let drawer = document.getElementById("nav-drawer");
      if (!drawer) {
        drawer = document.createElement("div");
        drawer.id = "nav-drawer";
        document.body.appendChild(drawer);
      }

      // Set drawer styles based on effect and direction
      drawer.className = `nav-drawer ${drawerEffect}-${drawerDirection}`;

      // Create drawer content
      drawer.innerHTML = `
        <div class="nav-drawer-overlay"></div>
        <div class="nav-drawer-content">
          <div class="nav-drawer-header">
            <button class="nav-drawer-close">×</button>
          </div>
          <div class="nav-drawer-body">
            <nav>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Products</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </nav>
          </div>
        </div>
      `;

      // Add CSS for drawer
      const style =
        document.getElementById("nav-drawer-style") ||
        document.createElement("style");
      style.id = "nav-drawer-style";
      style.textContent = `
        .nav-drawer {
          position: fixed;
          z-index: 1000;
          top: 0;
          width: 300px;
          height: 100%;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .nav-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: -1;
        }
        
        .nav-drawer-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        
        .nav-drawer-header {
          padding: 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }
        
        .nav-drawer-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        
        .nav-drawer-body {
          padding: 20px;
          flex: 1;
        }
        
        .nav-drawer-body ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-drawer-body li {
          margin-bottom: 15px;
        }
        
        .nav-drawer-body a {
          color: #333;
          text-decoration: none;
          font-size: 18px;
          display: block;
          padding: 5px 0;
        }
        
        /* Slide effect */
        .slide-left {
          left: 0;
          transform: translateX(-100%);
        }
        
        .slide-left.active {
          transform: translateX(0);
        }
        
        .slide-right {
          right: 0;
          transform: translateX(100%);
        }
        
        .slide-right.active {
          transform: translateX(0);
        }
        
        /* Fade effect */
        .fade-left, .fade-right {
          opacity: 0;
          pointer-events: none;
        }
        
        .fade-left {
          left: 0;
        }
        
        .fade-right {
          right: 0;
        }
        
        .fade-left.active, .fade-right.active {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Push effect */
        .push-left {
          left: 0;
          transform: translateX(-100%);
        }
        
        .push-right {
          right: 0;
          transform: translateX(100%);
        }
        
        /* Top drawer */
        .slide-top, .fade-top, .push-top {
          top: 0;
          left: 0;
          width: 100%;
          height: 300px;
          transform: translateY(-100%);
        }
        
        .slide-top.active, .push-top.active {
          transform: translateY(0);
        }
        
        .fade-top {
          opacity: 0;
          pointer-events: none;
        }
        
        .fade-top.active {
          opacity: 1;
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);

      // Show drawer
      setTimeout(() => {
        drawer.classList.add("active");

        // Push page content if using push effect
        if (drawerEffect === "push") {
          const mainContent = document.querySelector("main");
          if (mainContent) {
            if (drawerDirection === "left") {
              (mainContent as HTMLElement).style.transition =
                "transform 0.3s ease";
              (mainContent as HTMLElement).style.transform =
                "translateX(300px)";
            } else if (drawerDirection === "right") {
              (mainContent as HTMLElement).style.transition =
                "transform 0.3s ease";
              (mainContent as HTMLElement).style.transform =
                "translateX(-300px)";
            } else if (drawerDirection === "top") {
              (mainContent as HTMLElement).style.transition =
                "transform 0.3s ease";
              (mainContent as HTMLElement).style.transform =
                "translateY(300px)";
            }
          }
        }
      }, 10);

      // Add close event handler
      setTimeout(() => {
        const closeBtn = drawer.querySelector(".nav-drawer-close");
        const overlay = drawer.querySelector(".nav-drawer-overlay");

        const closeDrawer = () => {
          drawer.classList.remove("active");

          // Reset content transform if using push effect
          if (drawerEffect === "push") {
            const mainContent = document.querySelector("main");
            if (mainContent) {
              (mainContent as HTMLElement).style.transform = "";
            }
          }

          // Remove drawer after animation completes
          setTimeout(() => {
            if (drawer.parentNode) {
              drawer.parentNode.removeChild(drawer);
            }
          }, 300);
        };

        if (closeBtn) {
          closeBtn.addEventListener("click", closeDrawer);
        }

        if (overlay) {
          overlay.addEventListener("click", closeDrawer);
        }
      }, 50);
    };

    // Function to add click listeners to all nav icons
    const attachNavIconListeners = () => {
      // Find all navigation icons
      const navIcons = document.querySelectorAll('[data-item-id="nav_icon"]');

      // Add click event listeners
      navIcons.forEach((navIcon) => {
        // First remove any existing click listeners (safer approach than node replacement)
        navIcon.removeEventListener("click", handleNavIconClick);

        // Then add the click event listener
        navIcon.addEventListener("click", handleNavIconClick);
      });
    };

    // Initial setup of listeners
    attachNavIconListeners();

    // Setup event listener for when header settings are updated (to re-attach listeners)
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === "UPDATE_HEADER_SETTINGS") {
        // Wait a moment for DOM to update before re-attaching listeners
        setTimeout(attachNavIconListeners, 100);
      }
    };

    window.addEventListener("message", messageHandler);

    // Cleanup
    return () => {
      window.removeEventListener("message", messageHandler);

      // Remove click listeners
      const navIcons = document.querySelectorAll('[data-item-id="nav_icon"]');
      navIcons.forEach((navIcon) => {
        navIcon.removeEventListener("click", handleNavIconClick);
      });
    };
  }, []);

  // Add this helper function somewhere appropriate (outside the handler)
  const getLogoSizeFromWidth = (width: number): string => {
    if (width <= 40) return "small";
    if (width >= 60) return "large";
    return "medium";
  };

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

  // Add function to initialize CSS variables from settings
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

  // Initialize CSS variables on mount
  useEffect(() => {
    initializeTypographyFromSettings();
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
