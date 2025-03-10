"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import clsx from "clsx";
import { getAllHeaderItems } from "../data/headerItems";
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Twitter,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Plus, X } from "lucide-react";
import {
  fetchColorSchemes,
  getColorSchemeStyles,
} from "@/app/builder/utils/colorSchemeUtils";
import DOMPurify from "dompurify";
import menuItemsData from "@/app/builder/data/menu-items.json";

// Add CSS for header item hover effects
const headerItemStyles = `
  .header-item-wrapper {
    position: relative;
  }
  
  .header-item-wrapper:hover {
    outline: 1px dashed #3b82f6;
    outline-offset: 2px;
  }
  
  .header-item {
    height: 100%;
    width: 100%;
  }
`;

// Helper function to check if a custom color scheme is being used
const isCustomColorScheme = (schemeId?: string) => {
  return schemeId && schemeId !== "light" && schemeId !== "dark";
};

interface HeaderLayout {
  top_left: string[];
  top_center: string[];
  top_right: string[];
  middle_left: string[];
  middle_center: string[];
  middle_right: string[];
  bottom_left: string[];
  bottom_center: string[];
  bottom_right: string[];
  available?: string[];
}

class LayoutSettings {
  sticky: boolean = false; // initializing with a default value
  maxWidth: string = "";
  currentPreset?: string;
  containers?: HeaderLayout;
}

interface HeaderSettings {
  theme?: string;
  layout?: LayoutSettings;
  html_block_1?: string;
  html_block_2?: string;
  html_block_3?: string;
  html_block_4?: string;
  html_block_5?: string;
  topBarVisible?: boolean;
  topBarHeight?: number;
  showTopBarButton?: boolean;
  topBarColorScheme?: string;
  mainBarColorScheme?: string; // Added for main section
  bottomBarColorScheme?: string; // Added for bottom section
  topBarNavStyle?: "style1" | "style2" | "style3";
  topBarTextTransform?: "uppercase" | "capitalize" | "lowercase";
  logo?: { text?: string; showText?: boolean };
  lastSelectedSetting?: string | null; // Track the last selected setting
  lastSelectedSubmenu?: string | null; // Track the last selected submenu
  showAccount?: boolean; // Whether to show the account widget
  account?: {
    showText?: boolean;
    text?: string;
    showIcon?: boolean;
    style?: string;
    dropdownEnabled?: boolean;
    loginEnabled?: boolean;
    registerEnabled?: boolean;
    loginUrl?: string;
    registerUrl?: string;
    iconSize?: string;
    iconStyle?: string; // New property for icon style variants
  };
  contact?: {
    show?: boolean;
    email?: string;
    emailLabel?: string;
    phone?: string;
    location?: string;
    locationLabel?: string;
    openHours?: string;
    hoursDetails?: string;
  };
  navigation?: {
    menuType: string;
    items: any[];
  };
  search?: {
    show: boolean;
    type: string;
    placeholder?: string;
    rounded?: number;
    showText: boolean;
    behavior: string;
    design: string;
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
  };
  navIcon?: {
    show: boolean;
    type: string; // hamburger, dots, chevron, etc.
    showText: boolean;
    text: string;
    position: string; // left, right
    drawerEffect: string; // slide, fade, push
    drawerDirection: string; // left, right, top
    iconSize: string;
    iconColor?: string;
    textColor?: string;
  };
}

interface HeaderProps {
  settings?: HeaderSettings;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Default HTML content for various header items
const HTMLContentMap: Record<string, string> = {
  logo: '<img src="/logo.svg" class="h-8" alt="Logo" />',
  account: `<div class="account-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
             </svg>
           </div>`,
  cart: `<div class="cart-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"></circle>
      <circle cx="19" cy="21" r="1"></circle>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
           </svg>
         </div>`,
  contact: `<div class="contact-info-container" data-item-id="contact" style="display: flex; flex-direction: column; gap: 5px;">
    <div class="contact-item email" style="display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
      <span class="contact-label">Email: </span>
      <a href="mailto:contact@example.com" class="contact-value">contact@example.com</a>
    </div>
    <div class="contact-item phone" style="display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
      <a href="tel:+1234567890" class="contact-value">(123) 456-7890</a>
    </div>
  </div>`,
  mainMenu: `<nav class="main-menu">
    <ul class="flex gap-6">
      <li class="hover:text-primary cursor-pointer">Home</li>
      <li class="hover:text-primary cursor-pointer">Shop</li>
      <li class="hover:text-primary cursor-pointer">About</li>
      <li class="hover:text-primary cursor-pointer">Contact</li>
              </ul>
            </nav>`,
  topBarMenu: `<div class="top-bar-menu">
    <ul class="flex gap-3 text-sm">
      <li class="hover:underline cursor-pointer">Support</li>
      <li class="hover:underline cursor-pointer">Contact</li>
      <li class="hover:underline cursor-pointer">Store Locator</li>
    </ul>
  </div>`,
  bottomMenu: `<div class="bottom-bar-menu">
    <ul class="flex gap-4 text-sm">
      <li class="hover:underline cursor-pointer">Terms</li>
      <li class="hover:underline cursor-pointer">Privacy</li>
      <li class="hover:underline cursor-pointer">Returns</li>
    </ul>
  </div>`,
  nav_icon: `<button class="flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
    <span class="ml-2">Menu</span>
  </button>`,
  wishlist: `<div class="wishlist-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
          </div>`,
  social_icon: `<div class="social-icon-group flex gap-2">
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  </a>
    <a href="#" class="social-icon hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
    </a>
                </div>`,
  button_1: `<button class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Button 1</button>`,
  button_2: `<button class="px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white">Button 2</button>`,
  divider_1: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_2: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_3: `<div class="h-6 w-px bg-gray-300"></div>`,
  divider_4: `<div class="h-6 w-px bg-gray-300"></div>`,
};

const defaultHeaderSettings: HeaderSettings = {
  topBarVisible: true,
  topBarColorScheme: "light",
  mainBarColorScheme: "light", // Default for main section
  bottomBarColorScheme: "light", // Default for bottom section
  showTopBarButton: false,
  navigation: {
    menuType: "mainMenu",
    items: menuItemsData.mainMenu.items,
  },
};

function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<F>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Add a helper function at the top level to ensure messages are properly sent to parent
const sendMessageToParent = (message: any) => {
  // Log the message being sent for debugging
  console.log("Sending message to parent:", message);

  // Send the message to the parent window
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, "*");
    return true;
  } else {
    console.warn("No parent window found, sending to current window");
    window.postMessage(message, "*");
    return false;
  }
};

export default function Header({
  settings = {},
  isEditing,
  isSelected,
  onSelect,
}: HeaderProps) {
  const initHeaderSettings = useMemo(() => {
    return { ...defaultHeaderSettings, ...settings };
  }, [settings]);

  // State to store the header settings
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    topBarVisible: true,
    topBarHeight: 40,
    showTopBarButton: false,
    topBarColorScheme: "light",
    mainBarColorScheme: "light", // Default for main section
    bottomBarColorScheme: "light", // Default for bottom section
    search: {
      show: true,
      type: "form",
      placeholder: "Search...",
      rounded: 4,
      showText: true,
      behavior: "inline",
      design: "standard",
    },
    navigation: {
      menuType: "mainMenu",
      items: menuItemsData.mainMenu.items,
    },
  });

  // Add state for color scheme styles for all three sections
  const [topBarStyles, setTopBarStyles] = useState<{
    background: React.CSSProperties;
    text: React.CSSProperties;
  }>({
    background: {},
    text: {},
  });

  const [mainBarStyles, setMainBarStyles] = useState<{
    background: React.CSSProperties;
    text: React.CSSProperties;
  }>({
    background: {},
    text: {},
  });

  const [bottomBarStyles, setBottomBarStyles] = useState<{
    background: React.CSSProperties;
    text: React.CSSProperties;
  }>({
    background: {},
    text: {},
  });

  // Track the last received settings to prevent reprocessing identical settings
  const lastReceivedSettingsRef = useRef<string>("");

  // Add ref to track the last notified schemes to prevent notification loops
  const lastNotifiedSchemesRef = useRef({
    topBarColorScheme: headerSettings.topBarColorScheme || "light",
    mainBarColorScheme: headerSettings.mainBarColorScheme || "light",
    bottomBarColorScheme: headerSettings.bottomBarColorScheme || "light",
  });

  // Add notification throttling
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Function to safely notify parent about scheme changes
  const notifySchemeChanges = useCallback(
    (schemes: {
      topBarColorScheme?: string;
      mainBarColorScheme?: string;
      bottomBarColorScheme?: string;
    }) => {
      // Create scheme object with defaults
      const notifySchemes = {
        topBarColorScheme:
          schemes.topBarColorScheme ||
          headerSettings.topBarColorScheme ||
          "light",
        mainBarColorScheme:
          schemes.mainBarColorScheme ||
          headerSettings.mainBarColorScheme ||
          "light",
        bottomBarColorScheme:
          schemes.bottomBarColorScheme ||
          headerSettings.bottomBarColorScheme ||
          "light",
      };

      // Create string representation for comparison
      const schemesString = JSON.stringify(notifySchemes);

      // Only notify if schemes have changed from last notification
      if (JSON.stringify(lastNotifiedSchemesRef.current) !== schemesString) {
        // Clear any pending notification
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }

        // Use a ref to track that we're about to send this notification
        lastNotifiedSchemesRef.current = notifySchemes;

        // Debounce the notification
        notificationTimeoutRef.current = setTimeout(() => {
          console.log("Sending debounced scheme notification:", notifySchemes);
          sendMessageToParent({
            type: "HEADER_SCHEMES_UPDATED",
            schemes: notifySchemes,
          });
          notificationTimeoutRef.current = null;
        }, 200);
      }
    },
    [headerSettings]
  );

  const [layoutItems, setLayoutItems] = useState<HeaderLayout>({
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
  });

  const [customHtml, setCustomHtml] = useState<Record<string, string>>({});

  // Add debouncing to prevent rapid state updates
  const settingsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inside the Header component, after state declarations
  // Add debounced state setters to reduce re-rendering
  const debouncedSetLayoutItems = React.useMemo(
    () => debounce((newItems: HeaderLayout) => setLayoutItems(newItems), 100),
    []
  );

  // Update settings when props change but DON'T automatically send notifications
  useEffect(() => {
    if (JSON.stringify(headerSettings) !== JSON.stringify(settings)) {
      console.log("Settings changed from props, updating state only");
      setHeaderSettings((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  // Initialize layout items using containers from settings
  useEffect(() => {
    console.log("useEffect: initializing layout items from headerSettings");
    console.log("Current headerSettings:", headerSettings);

    // Check if we have containers defined in the layout settings
    if (headerSettings.layout && headerSettings.layout.containers) {
      const containers = headerSettings.layout.containers;
      console.log("Containers found in settings:", containers);

      // Create new layout items based on containers or use default
      const newLayoutItems = {
        top_left: containers.top_left || [],
        top_center: containers.top_center || [],
        top_right: containers.top_right || [],
        middle_left: containers.middle_left || [],
        middle_center: containers.middle_center || [],
        middle_right: containers.middle_right || [],
        bottom_left: containers.bottom_left || [],
        bottom_center: containers.bottom_center || [],
        bottom_right: containers.bottom_right || [],
        available: containers.available || [],
      };

      // Make sure contact is included in the top_right section if it's not already included elsewhere
      const allSections = [
        ...newLayoutItems.top_left,
        ...newLayoutItems.top_center,
        ...newLayoutItems.top_right,
        ...newLayoutItems.middle_left,
        ...newLayoutItems.middle_center,
        ...newLayoutItems.middle_right,
        ...newLayoutItems.bottom_left,
        ...newLayoutItems.bottom_center,
        ...newLayoutItems.bottom_right,
      ];

      // Add contact to top_right if it's not included elsewhere
      if (!allSections.includes("contact")) {
        console.log("Adding contact to top_right section");
        newLayoutItems.top_right.push("contact");
      }

      // Update layout items
      console.log("Setting layout items to:", newLayoutItems);
      setLayoutItems(newLayoutItems);

      // If we have a currentPreset in the settings, notify the parent
      if (headerSettings.layout.currentPreset) {
        console.log(
          "Current preset found:",
          headerSettings.layout.currentPreset
        );
        sendMessageToParent({
          type: "HEADER_PRESET_LOADED",
          presetId: headerSettings.layout.currentPreset,
        });
      }
    } else {
      // Set default layout items if no containers in settings
      console.log("No layout containers found in settings, using defaults");

      // Apply the default layout if no valid preset is found
      const defaultLayout: HeaderLayout = {
        top_left: [],
        top_center: [],
        top_right: ["contact"],
        middle_left: ["logo"],
        middle_center: ["mainMenu"],
        middle_right: ["account", "cart"],
        bottom_left: [],
        bottom_center: [],
        bottom_right: [],
        available: [],
      };

      setLayoutItems(defaultLayout);
    }
  }, [headerSettings.layout]);

  // Enhance the search settings handler to completely regenerate the search component
  const handleSearchSettingsMessage = (data: any) => {
    if (data && data.settings) {
      console.log(
        "SEARCH DEBUG: Received search settings update:",
        JSON.stringify(data.settings)
      );

      // Ensure the type property is correctly extracted
      const updatedType = data.settings.type;
      console.log("SEARCH DEBUG: Extracted type from update:", updatedType);

      // Preserve _timestamp if sent
      const timestamp = data.settings._timestamp || Date.now();

      // Update the settings in state
      setHeaderSettings((prev) => {
        // Create comprehensive updated settings object
        const updatedSettings = {
          ...prev,
          search: {
            ...prev.search,
            ...data.settings,
            // Ensure type is explicitly set if provided
            ...(updatedType ? { type: updatedType } : {}),
          },
        };

        console.log(
          "SEARCH DEBUG: New header settings search object:",
          JSON.stringify(updatedSettings.search)
        );

        // IMPORTANT: Force immediate DOM regeneration of search components
        setTimeout(() => {
          try {
            const searchContainers = document.querySelectorAll(
              '[data-item-id="search"]'
            );

            if (searchContainers.length > 0) {
              console.log(
                "SEARCH DEBUG: Found search containers to update:",
                searchContainers.length
              );

              // Regenerate search HTML for each container
              searchContainers.forEach((container) => {
                if (container instanceof HTMLElement) {
                  // Generate fresh HTML with updated settings
                  const freshHtml = DOMPurify.sanitize(
                    generateSearchHTML(updatedSettings)
                  );

                  console.log(
                    `SEARCH DEBUG: New HTML type attribute check: ${
                      freshHtml.includes('data-search-type="icon"')
                        ? "ICON"
                        : freshHtml.includes('data-search-type="expandable"')
                        ? "EXPANDABLE"
                        : "FORM"
                    }`
                  );

                  // First add animation class
                  container.classList.add("search-updated");

                  // Then replace the HTML content
                  container.innerHTML = freshHtml;

                  // Force a reflow
                  void container.offsetHeight;

                  // Remove animation class after animation completes
                  setTimeout(() => {
                    container.classList.remove("search-updated");
                  }, 500);

                  console.log(
                    "SEARCH DEBUG: Regenerated search component with new settings"
                  );
                }
              });
            } else {
              console.warn(
                "SEARCH DEBUG: No search containers found in the DOM"
              );
            }
          } catch (error) {
            console.error(
              "SEARCH DEBUG: Error refreshing search components:",
              error
            );
          }
        }, 10);

        return updatedSettings;
      });
    }
  };

  // Find the useEffect where message handling occurs and update it
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type, data } = event.data;

      switch (type) {
        case "UPDATE_LAYOUT_ITEMS":
          try {
            console.log("Received UPDATE_LAYOUT_ITEMS:", event.data);
            const { source, destination, itemId } = event.data;

            // Clone the current layout items to avoid direct state mutation
            const newLayoutItems = { ...layoutItems };

            // Remove the item from its source container
            if (
              source &&
              source.containerId &&
              Array.isArray(
                newLayoutItems[source.containerId as keyof HeaderLayout]
              )
            ) {
              const sourceArray = newLayoutItems[
                source.containerId as keyof HeaderLayout
              ] as string[];
              const sourceIndex =
                source.index !== undefined
                  ? source.index
                  : sourceArray.indexOf(itemId);

              if (sourceIndex !== -1) {
                sourceArray.splice(sourceIndex, 1);
              }
            }

            // Add the item to its destination container
            if (
              destination &&
              destination.containerId &&
              Array.isArray(
                newLayoutItems[destination.containerId as keyof HeaderLayout]
              )
            ) {
              const destArray = newLayoutItems[
                destination.containerId as keyof HeaderLayout
              ] as string[];
              const destIndex =
                destination.index !== undefined
                  ? destination.index
                  : destArray.length;

              // Splice the item into the destination at the specified index
              destArray.splice(destIndex, 0, itemId);
            }

            // Update the layout items
            debouncedSetLayoutItems(newLayoutItems);

            // Notify parent of the updated layout
            sendMessageToParent({
              type: "LAYOUT_ITEMS_UPDATED",
              layoutItems: newLayoutItems,
            });
          } catch (error) {
            console.error("Error in UPDATE_LAYOUT_ITEMS:", error);
          }
          break;

        case "UPDATE_HEADER_SETTINGS":
          // Update settings immediately without triggering notifications
          setHeaderSettings((prev) => ({ ...prev, ...event.data.settings }));

          // If color schemes were part of the update, notify explicitly
          if (
            event.data.settings.topBarColorScheme !== undefined ||
            event.data.settings.mainBarColorScheme !== undefined ||
            event.data.settings.bottomBarColorScheme !== undefined
          ) {
            // Wait for the state update to complete before notifying
            setTimeout(() => {
              notifySchemeChanges({
                topBarColorScheme: event.data.settings.topBarColorScheme,
                mainBarColorScheme: event.data.settings.mainBarColorScheme,
                bottomBarColorScheme: event.data.settings.bottomBarColorScheme,
              });
            }, 50);
          }

          // Extract HTML block updates
          const htmlUpdates: Record<string, string> = {};
          let hasHtmlUpdates = false;

          for (const key in event.data.settings) {
            if (
              key &&
              typeof key === "string" &&
              key.startsWith("html_block_")
            ) {
              // Sanitize HTML content again when receiving it
              const rawHtml = event.data.settings[key];
              if (typeof rawHtml === "string") {
                htmlUpdates[key] = DOMPurify.sanitize(rawHtml);
                hasHtmlUpdates = true;
              }
            }
          }

          if (hasHtmlUpdates) {
            console.log("Updating HTML blocks:", htmlUpdates);
            setCustomHtml((prev) => ({
              ...prev,
              ...htmlUpdates,
            }));
          }

          // Handle search settings specifically if present
          if (event.data.settings && event.data.settings.search) {
            handleSearchSettingsMessage({
              settings: event.data.settings.search,
            });
          }

          // Update other header settings
          if (event.data.settings) {
            setHeaderSettings((prev) => ({ ...prev, ...event.data.settings }));
          }
          break;

        case "HEADER_GET_STATE":
          console.log("Received HEADER_GET_STATE request");
          sendMessageToParent({
            type: "HEADER_STATE",
            settings: headerSettings,
            layoutItems,
            schemes: {
              topBarColorScheme: headerSettings.topBarColorScheme || "light",
              mainBarColorScheme: headerSettings.mainBarColorScheme || "light",
              bottomBarColorScheme:
                headerSettings.bottomBarColorScheme || "light",
            },
          });

          // Update the last notified schemes ref to match what we just sent
          lastNotifiedSchemesRef.current = {
            topBarColorScheme: headerSettings.topBarColorScheme || "light",
            mainBarColorScheme: headerSettings.mainBarColorScheme || "light",
            bottomBarColorScheme:
              headerSettings.bottomBarColorScheme || "light",
          };
          break;

        case "HEADER_UPDATE_ALL":
          // Only update if the settings are different
          if (
            event.data.settings &&
            JSON.stringify(event.data.settings) !==
              JSON.stringify(headerSettings)
          ) {
            console.log("Received HEADER_UPDATE_ALL, updating settings");
            setHeaderSettings(event.data.settings);
          } else {
            console.log(
              "Received HEADER_UPDATE_ALL, but settings are the same"
            );
          }

          // Define a helper to detect if settings need to be updated
          // When a property is nested more than 2 levels deep, the changes might
          // not be detected correctly
          const hasSignificantChanges = (
            oldSettings: HeaderLayout,
            newSettings: any
          ) => {
            if (!newSettings) return false;

            // Check top-level properties
            for (const key in newSettings) {
              const typedKey = key as keyof HeaderLayout;

              // Skip if property doesn't exist in oldSettings
              if (!(typedKey in oldSettings)) continue;

              const oldValue = oldSettings[typedKey];
              const newValue = newSettings[typedKey];

              // Check if values are different
              if (
                typeof oldValue !== typeof newValue ||
                JSON.stringify(oldValue) !== JSON.stringify(newValue)
              ) {
                return true;
              }
            }

            return false;
          };

          // Only update layout if the containers are different
          if (
            event.data.layoutItems &&
            hasSignificantChanges(layoutItems, event.data.layoutItems)
          ) {
            console.log("Updating layout items from HEADER_UPDATE_ALL");
            setLayoutItems(event.data.layoutItems);
          }
          break;

        case "UPDATE_NAVIGATION":
          const { menuType, items } = event.data;

          setHeaderSettings((prevSettings) => {
            return {
              ...prevSettings,
              navigation: {
                ...prevSettings.navigation,
                menuType,
                items,
              },
            };
          });
          break;

        case "UPDATE_SEARCH_SETTINGS":
          handleSearchSettingsMessage(event.data);
          break;

        case "FORCE_SEARCH_UPDATE":
          // Force complete regeneration of all search elements
          console.log(
            "SEARCH DEBUG: Received FORCE_SEARCH_UPDATE command, timestamp:",
            event.data.timestamp
          );

          // Log the current search settings
          console.log(
            "SEARCH DEBUG: Current headerSettings.search:",
            JSON.stringify(headerSettings.search)
          );

          try {
            // Get all containers with search components
            const searchContainers = document.querySelectorAll(
              '[data-item-id="search"]'
            );

            if (searchContainers.length > 0) {
              console.log(
                "SEARCH DEBUG: Forcing update of",
                searchContainers.length,
                "search containers"
              );

              // Regenerate each search container with current settings
              searchContainers.forEach((container) => {
                if (container instanceof HTMLElement) {
                  // Add animation class first
                  container.classList.add("search-updated");

                  // Regenerate the search HTML with current settings
                  const freshHtml = DOMPurify.sanitize(
                    generateSearchHTML(headerSettings)
                  );

                  // Debug type in generated HTML
                  console.log(
                    `SEARCH DEBUG: Force update generated HTML type: ${
                      freshHtml.includes('data-search-type="icon"')
                        ? "ICON"
                        : freshHtml.includes('data-search-type="expandable"')
                        ? "EXPANDABLE"
                        : "FORM"
                    }`
                  );

                  // Replace content completely
                  container.innerHTML = freshHtml;

                  // Force browser repaint by manipulating display
                  const currentDisplay =
                    window.getComputedStyle(container).display;
                  container.style.display = "none";
                  void container.offsetHeight; // Force reflow
                  container.style.display = currentDisplay;

                  // Add extra visual indication of update
                  container.style.outline = "2px solid rgba(59, 130, 246, 0.5)";

                  // Remove animation class and outline after delay
                  setTimeout(() => {
                    container.classList.remove("search-updated");
                    container.style.outline = "";
                  }, 800);
                }
              });

              console.log("SEARCH DEBUG: All search containers regenerated");
            } else {
              console.warn(
                "SEARCH DEBUG: No search containers found to force-update"
              );
            }
          } catch (error) {
            console.error(
              "SEARCH DEBUG: Error during forced search update:",
              error
            );
          }
          break;

        case "TEST_IFRAME_COMMUNICATION":
          console.log(
            "TEST: Successfully received test message in iframe!",
            event.data.timestamp
          );

          // Send back acknowledgment to parent window
          if (window.parent && event.source) {
            try {
              // Acknowledge receipt of the test message
              window.parent.postMessage(
                {
                  type: "TEST_COMMUNICATION_RECEIVED",
                  timestamp: Date.now(),
                  originalTimestamp: event.data.timestamp,
                  success: true,
                  headers: event.data.headers || {
                    "Content-Type": "application/json",
                    "X-Builder-Target": "HeaderSearchSettings",
                  },
                },
                event.origin || "*"
              );

              console.log("TEST: Sent acknowledgment back to parent window");
            } catch (error) {
              console.error("TEST: Failed to send acknowledgment:", error);
            }
          }
          break;

        case "INITIALIZE_SEARCH_SETTINGS":
          console.log(
            "TEST: Received initial search settings:",
            event.data.settings
          );

          // Extract headers if present
          const requestHeaders = event.data.headers || {};
          console.log("REQUEST HEADERS:", requestHeaders);

          if (event.data.settings) {
            // Set search settings directly with proper type handling
            setHeaderSettings((prev) => {
              // Create a complete search settings object with all required fields
              const completeSearchSettings = {
                show: event.data.settings.show ?? true,
                type: event.data.settings.type || "form",
                placeholder: event.data.settings.placeholder || "Search...",
                rounded: event.data.settings.rounded ?? 4,
                showText: event.data.settings.showText ?? true,
                behavior: event.data.settings.behavior || "inline",
                design: event.data.settings.design || "standard",
                ...event.data.settings,
              };

              return {
                ...prev,
                search: completeSearchSettings,
              };
            });

            // Send acknowledgment back to parent
            if (window.parent && event.source) {
              try {
                window.parent.postMessage(
                  {
                    type: "SEARCH_SETTINGS_RECEIVED",
                    timestamp: Date.now(),
                    success: true,
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target": "HeaderSearchSettings",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error("Failed to send settings acknowledgment:", error);
              }
            }

            // Force search components to update
            setTimeout(() => {
              document
                .querySelectorAll('[data-item-id="search"]')
                .forEach((el) => {
                  if (el instanceof HTMLElement) {
                    console.log(
                      "TEST: Refreshing search component with initial settings"
                    );
                    const newSettings = { ...headerSettings };
                    if (newSettings.search) {
                      newSettings.search = {
                        ...newSettings.search,
                        ...event.data.settings,
                        // Ensure required fields
                        show: event.data.settings.show ?? true,
                        type: event.data.settings.type || "form",
                        showText: event.data.settings.showText ?? true,
                        behavior: event.data.settings.behavior || "inline",
                        design: event.data.settings.design || "standard",
                      };
                    }
                    el.innerHTML = DOMPurify.sanitize(
                      generateSearchHTML(newSettings)
                    );
                  }
                });
            }, 100);
          }
          break;

        case "DIRECT_SEARCH_SETTING_UPDATE":
          console.log(
            "ACTION: Received direct search setting update:",
            event.data.key,
            "=",
            event.data.value,
            "with headers:",
            event.data.headers
          );

          if (event.data.key) {
            // Update the specific property in headerSettings.search
            setHeaderSettings((prev) => {
              // Make sure search object exists with required properties
              const currentSearch = prev.search || {
                show: true,
                type: "form",
                showText: true,
                behavior: "inline",
                design: "standard",
              };

              // Create a new search settings object with the updated property
              const updatedSearch = {
                ...currentSearch,
                [event.data.key]: event.data.value,
              };

              console.log(
                "ACTION: Updated search settings with new value:",
                updatedSearch
              );

              // Return updated headerSettings
              return {
                ...prev,
                search: updatedSearch,
              };
            });

            // Send acknowledgment back to parent
            if (window.parent && event.source) {
              try {
                window.parent.postMessage(
                  {
                    type: "SEARCH_SETTING_UPDATE_RECEIVED",
                    key: event.data.key,
                    value: event.data.value,
                    timestamp: Date.now(),
                    success: true,
                    headers: {
                      "Content-Type": "application/json",
                      "X-Builder-Target": "HeaderSearchSettings",
                    },
                  },
                  event.origin || "*"
                );
              } catch (error) {
                console.error("Failed to send update acknowledgment:", error);
              }
            }

            // Force an immediate DOM update after a short delay
            setTimeout(() => {
              try {
                // Get all search components
                const searchComponents = document.querySelectorAll(
                  '[data-item-id="search"]'
                );

                if (searchComponents.length > 0) {
                  console.log(
                    "ACTION: Updating",
                    searchComponents.length,
                    "search components"
                  );

                  // Update each component
                  searchComponents.forEach((comp) => {
                    if (comp instanceof HTMLElement) {
                      // Add visual feedback
                      comp.style.outline = "2px solid blue";

                      // Force reflow
                      void comp.offsetHeight;

                      // Remove outline after a short delay
                      setTimeout(() => {
                        comp.style.outline = "";
                      }, 500);
                    }
                  });
                } else {
                  console.error(
                    "ACTION: No search components found to update!"
                  );
                }
              } catch (err) {
                console.error(
                  "ERROR: Failed to update search components:",
                  err
                );
              }
            }, 50);
          }
          break;

        case "FULL_SEARCH_SETTINGS_UPDATE":
          console.log("ACTION: Received full search settings update");

          if (event.data.settings) {
            // Update the entire search settings object
            setHeaderSettings((prev) => {
              // Ensure all required properties are present
              const completeSettings = {
                show: event.data.settings.show ?? true,
                type: event.data.settings.type || "form",
                showText: event.data.settings.showText ?? true,
                behavior: event.data.settings.behavior || "inline",
                design: event.data.settings.design || "standard",
                ...event.data.settings,
              };

              return {
                ...prev,
                search: completeSettings,
              };
            });

            // Force all search components to update
            setTimeout(() => {
              try {
                const allComponents = document.querySelectorAll(
                  '[data-item-id="search"]'
                );
                console.log(
                  "ACTION: Regenerating",
                  allComponents.length,
                  "search components"
                );

                allComponents.forEach((el) => {
                  if (el instanceof HTMLElement) {
                    // Get current search settings with update
                    const currentSettings = {
                      ...headerSettings,
                      search: {
                        // Ensure required fields
                        show: event.data.settings.show ?? true,
                        type: event.data.settings.type || "form",
                        showText: event.data.settings.showText ?? true,
                        behavior: event.data.settings.behavior || "inline",
                        design: event.data.settings.design || "standard",
                        ...event.data.settings,
                      },
                    };

                    // Generate new HTML
                    const newHtml = generateSearchHTML(currentSettings);

                    // Replace content
                    el.innerHTML = DOMPurify.sanitize(newHtml);

                    // Visual feedback
                    el.style.outline = "2px solid green";
                    setTimeout(() => {
                      el.style.outline = "";
                    }, 800);
                  }
                });
              } catch (err) {
                console.error(
                  "ERROR: Failed to regenerate search components:",
                  err
                );
              }
            }, 100);
          }
          break;

        case "EXECUTE_DIRECT_SCRIPT":
          console.log("SCRIPT: Received script execution request");

          if (event.data.script) {
            try {
              console.log("SCRIPT: Attempting to execute script");

              // Create a new function from the script string and execute it
              const scriptFunction = new Function(event.data.script);
              scriptFunction();

              console.log("SCRIPT: Script executed successfully");

              // Also trigger a search update after script execution
              setTimeout(() => {
                try {
                  // Get all search components
                  const searchComponents = document.querySelectorAll(
                    '[data-item-id="search"]'
                  );

                  if (searchComponents.length > 0) {
                    // Get component type information for logging
                    const types = Array.from(searchComponents).map((el) =>
                      el instanceof HTMLElement
                        ? el.getAttribute("data-search-type")
                        : "unknown"
                    );

                    console.log(
                      "SCRIPT: Search components after script execution:",
                      types
                    );

                    // Force a redraw
                    searchComponents.forEach((comp) => {
                      if (comp instanceof HTMLElement) {
                        comp.classList.add("search-updated");
                        setTimeout(() => {
                          comp.classList.remove("search-updated");
                        }, 500);
                      }
                    });
                  }
                } catch (err) {
                  console.error(
                    "SCRIPT: Error checking components after script:",
                    err
                  );
                }
              }, 500);
            } catch (err) {
              console.error("SCRIPT: Failed to execute script:", err);
            }
          }
          break;

        default:
          // Ignore other message types
          break;
      }
    };

    // Add the event listener (only once)
    console.log("Adding message event listener");
    window.addEventListener("message", handleMessage);

    // Return a cleanup function
    return () => {
      console.log("Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, [
    layoutItems,
    headerSettings,
    debouncedSetLayoutItems,
    notifySchemeChanges,
  ]);

  // Add console logs to debug current color scheme settings
  useEffect(() => {
    console.log("Current header color scheme settings:", {
      topBarColorScheme: headerSettings.topBarColorScheme,
      mainBarColorScheme: headerSettings.mainBarColorScheme,
      bottomBarColorScheme: headerSettings.bottomBarColorScheme,
    });

    // Also log the current style objects
    console.log("Current style objects:", {
      topBarStyles,
      mainBarStyles,
      bottomBarStyles,
    });
  }, [
    headerSettings.topBarColorScheme,
    headerSettings.mainBarColorScheme,
    headerSettings.bottomBarColorScheme,
    topBarStyles,
    mainBarStyles,
    bottomBarStyles,
  ]);

  // Get HTML content for a layout item (MOVE THIS FUNCTION BEFORE renderSection)
  const getHtmlContent = React.useCallback(
    (itemId: string): string => {
      // Special handling for search with a unique key to force re-rendering
      if (itemId === "search") {
        // Generate search HTML with the current settings
        const html = generateSearchHTML(headerSettings);
        return DOMPurify.sanitize(`<div data-item-id="search">${html}</div>`);
      }

      // Special handling for navigation icon - handle both IDs (nav_icon and navIcon)
      if (itemId === "navIcon" || itemId === "nav_icon") {
        // Generate navigation icon HTML with current settings
        const html = generateNavIconHTML(headerSettings);
        return DOMPurify.sanitize(`<div data-item-id="nav_icon">${html}</div>`);
      }

      // Special handling for contact information
      if (itemId === "contact") {
        // Generate HTML based on contact settings
        console.log(
          "Generating contact HTML with settings:",
          headerSettings.contact
        );
        const contactHTML = generateContactHTML(headerSettings);
        console.log("Generated contact HTML:", contactHTML);
        // Note: We don't wrap in another div because the generateContactHTML function already includes a div with data-item-id="contact"
        return DOMPurify.sanitize(contactHTML);
      }

      // Special handling for menu items
      if (
        itemId === "mainMenu" ||
        itemId === "topBarMenu" ||
        itemId === "bottomMenu"
      ) {
        // Check if we have navigation data for this menu type
        if (
          headerSettings.navigation &&
          headerSettings.navigation.menuType === itemId &&
          headerSettings.navigation.items &&
          headerSettings.navigation.items.length > 0
        ) {
          // Generate HTML from the navigation items
          return DOMPurify.sanitize(
            generateMenuHTML(itemId, headerSettings.navigation.items)
          );
        } else {
          // Use menu data from menuItems.json as fallback
          const menuType = itemId as keyof typeof menuItemsData;
          if (menuItemsData[menuType] && menuItemsData[menuType].items) {
            return DOMPurify.sanitize(
              generateMenuHTML(itemId, menuItemsData[menuType].items)
            );
          }
        }
      }

      // Special handling for logo
      if (itemId === "logo") {
        // Check if we have a logo setting
        if (headerSettings.logo) {
          const logoSettings = headerSettings.logo as {
            text?: string;
            showText?: boolean;
          };
          const logoText = logoSettings.text || "Your Brand";
          const showText = logoSettings.showText !== false;

          // Create logo HTML based on settings and sanitize it
          if (showText) {
            return DOMPurify.sanitize(`<div class="logo-container">
            <img src="/logo.svg" class="h-8" alt="Logo" />
            <span class="ml-2 font-bold text-lg">${logoText}</span>
          </div>`);
          } else {
            return DOMPurify.sanitize(
              `<img src="/logo.svg" class="h-8" alt="Logo" />`
            );
          }
        }

        // Fallback to default logo HTML
        return DOMPurify.sanitize(
          HTMLContentMap.logo ||
            '<img src="/logo.svg" class="h-8" alt="Logo" />'
        );
      }

      // Special handling for account
      if (itemId === "account") {
        // Generate HTML based on account settings
        const accountHTML = generateAccountHTML(headerSettings);
        return DOMPurify.sanitize(accountHTML);
      }

      // First check customHtml for exact match
      if (customHtml[itemId]) {
        return DOMPurify.sanitize(customHtml[itemId]);
      }
      // Then check for HTML blocks in headerSettings
      else if (itemId.startsWith("html_block_")) {
        // Extract the block number
        const blockMatch = itemId.match(/^html_block_(\d+)$/);
        if (blockMatch && blockMatch[1]) {
          const blockNumber = blockMatch[1];
          const settingKey = `html_block_${blockNumber}`;

          // First check customHtml
          if (customHtml[settingKey]) {
            return DOMPurify.sanitize(customHtml[settingKey]);
          }
          // Then check headerSettings
          else if (headerSettings[settingKey as keyof HeaderSettings]) {
            return DOMPurify.sanitize(
              headerSettings[settingKey as keyof HeaderSettings] as string
            );
          }
          // Finally use HTMLContentMap
          else if (HTMLContentMap[settingKey]) {
            return DOMPurify.sanitize(HTMLContentMap[settingKey]);
          }
        }
      }
      // Check if the item is a direct property of headerSettings
      else if (headerSettings[itemId as keyof HeaderSettings]) {
        const settingContent = headerSettings[itemId as keyof HeaderSettings];
        if (typeof settingContent === "string") {
          return DOMPurify.sanitize(settingContent);
        }
      }
      // Finally try HTMLContentMap
      else if (HTMLContentMap[itemId]) {
        return DOMPurify.sanitize(HTMLContentMap[itemId]);
      }

      return DOMPurify.sanitize(`<div>${itemId}</div>`);
    },
    [headerSettings, customHtml]
  );

  // Memoize the renderSection function to prevent unnecessary rerenders (THIS USES getHtmlContent)
  const renderSection = React.useCallback(
    (
      items: string[],
      sectionName: string = "",
      textStyle?: React.CSSProperties
    ) => {
      // Ensure items is an array
      if (!Array.isArray(items)) {
        console.warn(
          `Items for section ${sectionName} is not an array:`,
          items
        );
        return null;
      }

      // Return memoized array of items to prevent unnecessary rerenders
      return items.map((itemId, index) => {
        // Skip if itemId is not a string
        if (typeof itemId !== "string") {
          console.warn(`Invalid item ID in section ${sectionName}:`, itemId);
          return null;
        }

        // For HTML blocks, ensure we're using the exact ID to prevent mismatches
        let renderId = itemId;
        const htmlBlockMatch = itemId.match(/^html_block_(\d+)$/);
        if (htmlBlockMatch && htmlBlockMatch[1]) {
          const blockNumber = htmlBlockMatch[1];
          renderId = `html_block_${blockNumber}`;
        }

        const htmlContent = getHtmlContent(renderId);

        const key = `${sectionName}_${renderId}_${index}`;

        // Check if this is a menu item (for which we don't want to show the settings icon)
        const isMenuType =
          renderId === "mainMenu" ||
          renderId === "topBarMenu" ||
          renderId === "bottomMenu";

        // Use a wrapper div with position: relative for the gear icon
        return (
          <div
            key={key}
            className={`header-item-wrapper relative group ${
              isMenuType ? "menu-item-no-settings" : ""
            }`}
            data-item-id={renderId}
            data-original-id={itemId}
            data-is-menu-item={isMenuType ? "true" : "false"}
            style={textStyle}
            onClick={() => {
              if (isEditing && !isMenuType) {
                sendMessageToParent({
                  type: "SELECT_HEADER_SETTING",
                  settingId: renderId,
                });
              }
            }}
          >
            {/* Inner div for HTML content */}
            <div
              className="header-item"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Gear icon only shown when editing and NOT a menu item */}
            {isEditing && !isMenuType && (
              <div
                className="absolute opacity-0 group-hover:opacity-100 top-1 right-1 p-1.5 bg-black bg-opacity-80 rounded-sm cursor-pointer transition-opacity z-10 hover:bg-opacity-100 settings-icon"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent click

                  // Set a data attribute for tracking last click time
                  const target = e.currentTarget;
                  const now = Date.now();
                  const lastClick = parseInt(
                    target.getAttribute("data-last-click") || "0",
                    10
                  );

                  // Prevent multiple clicks within 500ms
                  if (now - lastClick < 500) {
                    console.log("Prevented rapid re-click on gear icon");
                    return;
                  }

                  // Update the last click time
                  target.setAttribute("data-last-click", now.toString());

                  // Get the submenu for this item
                  const targetSubmenu = getSubmenuForHeaderItem(renderId);

                  // First, check if this setting is already open
                  // We'll send a special message to check the current state
                  sendMessageToParent({
                    type: "CHECK_ACTIVE_SETTING",
                    settingId: renderId,
                    submenu: targetSubmenu,
                  });

                  // Set up a one-time listener for the response
                  const checkSettingListener = (response: MessageEvent) => {
                    if (
                      response.data &&
                      response.data.type === "SETTING_STATE_RESPONSE"
                    ) {
                      // If the response says the setting is already active, do nothing
                      if (response.data.isActive) {
                        console.log(
                          `Setting ${renderId} is already active, ignoring click`
                        );
                        window.removeEventListener(
                          "message",
                          checkSettingListener
                        );
                        return;
                      }

                      // Otherwise, proceed with opening the setting
                      console.log(
                        `Opening settings for: ${renderId} via gear icon (submenu: ${targetSubmenu})`
                      );

                      // Send the message to open settings directly targeting the specific submenu
                      // and including the setting ID to allow direct navigation
                      sendMessageToParent({
                        type: "HEADER_SETTING_SELECTED",
                        settingId: renderId,
                        submenu: targetSubmenu,
                        itemType: renderId,
                        source: "gear-icon",
                        timestamp: Date.now(),
                        directNav: true, // Flag to indicate we want direct navigation
                      });

                      // Create and dispatch a switchTab event with all necessary information
                      // for direct navigation without intermediate steps
                      try {
                        const switchTabEvent = new CustomEvent("switchTab", {
                          detail: {
                            targetTab: "Header",
                            targetSubmenu: targetSubmenu,
                            settingId: renderId,
                            timestamp: Date.now(),
                            directNav: true, // Flag to indicate we want direct navigation
                          },
                          bubbles: true,
                        });

                        window.dispatchEvent(switchTabEvent);
                      } catch (e) {
                        console.error("Error dispatching events:", e);
                      }

                      // Remove the listener after processing
                      window.removeEventListener(
                        "message",
                        checkSettingListener
                      );
                    }
                  };

                  // Add the listener
                  window.addEventListener("message", checkSettingListener);

                  // Set a timeout to remove the listener if no response comes back
                  setTimeout(() => {
                    window.removeEventListener("message", checkSettingListener);
                  }, 500);
                }}
              >
                <Settings className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        );
      });
    },
    [getHtmlContent, isEditing]
  );

  // Define our built-in color schemes
  const BUILT_IN_SCHEMES = {
    light: {
      top: {
        background: "#f7fafc",
        text: "#4a5568",
      },
      main: {
        background: "#ffffff",
        text: "#1a202c",
      },
      bottom: {
        background: "#f9fafb",
        text: "#4a5568",
        border: "#e2e8f0",
      },
    },
    dark: {
      top: {
        background: "#2d3748",
        text: "#e2e8f0",
      },
      main: {
        background: "#1a202c",
        text: "#f7fafc",
      },
      bottom: {
        background: "#2d3748",
        text: "#e2e8f0",
        border: "#4a5568",
      },
    },
  };

  // Get appropriate styles for a section based on its color scheme
  const getSectionStyle = useCallback(
    (
      section: "top" | "main" | "bottom",
      schemeId?: string
    ): React.CSSProperties => {
      // Handle undefined, light and dark schemes
      if (!schemeId || schemeId === "light" || schemeId === "dark") {
        const theme =
          BUILT_IN_SCHEMES[schemeId as "light" | "dark"] ||
          BUILT_IN_SCHEMES.light;

        if (section === "top") {
          return {
            backgroundColor: theme.top.background,
            color: theme.top.text,
          };
        } else if (section === "main") {
          return {
            backgroundColor: theme.main.background,
            color: theme.main.text,
          };
        } else {
          return {
            backgroundColor: theme.bottom.background,
            color: theme.bottom.text,
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: theme.bottom.border,
          };
        }
      }

      // For custom schemes, we'd need to fetch them from our color scheme utility
      // For now, just use default light theme
      return section === "top"
        ? { backgroundColor: "#f7fafc", color: "#4a5568" }
        : section === "main"
        ? { backgroundColor: "#ffffff", color: "#1a202c" }
        : {
            backgroundColor: "#f9fafb",
            color: "#4a5568",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "#e2e8f0",
          };
    },
    []
  );

  // Get text color for a section based on its color scheme
  const getSectionTextColor = useCallback(
    (section: "top" | "main" | "bottom", schemeId?: string): string => {
      if (!schemeId || schemeId === "light") {
        return section === "top"
          ? "#4a5568"
          : section === "main"
          ? "#1a202c"
          : "#4a5568";
      } else if (schemeId === "dark") {
        return section === "top"
          ? "#e2e8f0"
          : section === "main"
          ? "#f7fafc"
          : "#e2e8f0";
      }

      // For custom schemes, fetch from utility
      // For now, default text colors
      return section === "top"
        ? "#4a5568"
        : section === "main"
        ? "#1a202c"
        : "#4a5568";
    },
    []
  );

  // Log color scheme changes for debugging
  useEffect(() => {
    console.log("Current color schemes:", {
      top: headerSettings.topBarColorScheme,
      main: headerSettings.mainBarColorScheme,
      bottom: headerSettings.bottomBarColorScheme,
    });
  }, [
    headerSettings.topBarColorScheme,
    headerSettings.mainBarColorScheme,
    headerSettings.bottomBarColorScheme,
  ]);

  // Special handler to ensure color scheme changes are reflected
  useEffect(() => {
    // Force iframe to repaint when color schemes change
    const forceRepaint = () => {
      try {
        // Try to notify parent about current color schemes
        sendMessageToParent({
          type: "HEADER_COLOR_SCHEMES_UPDATE",
          schemes: {
            top: headerSettings.topBarColorScheme || "light",
            main: headerSettings.mainBarColorScheme || "light",
            bottom: headerSettings.bottomBarColorScheme || "light",
          },
        });

        console.log("Forced color scheme update notification");

        // Force a repaint in the iframe if possible
        try {
          // Add a dummy class and remove it to force a repaint
          document.body.classList.add("force-repaint");
          setTimeout(() => {
            document.body.classList.remove("force-repaint");
          }, 10);
        } catch (e) {
          console.warn("Could not force repaint:", e);
        }
      } catch (e) {
        console.error("Error notifying parent about color schemes:", e);
      }
    };

    // Call immediately
    forceRepaint();

    // Also listen for direct color scheme selection messages
    const handleColorSchemeSelection = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "COLOR_SCHEME_SELECTED") {
        const { section, schemeId } = event.data;

        // Update the appropriate section's color scheme
        if (section === "top" || section === "topBar") {
          setHeaderSettings((prev) => ({
            ...prev,
            topBarColorScheme: schemeId,
          }));
        } else if (section === "main" || section === "mainBar") {
          setHeaderSettings((prev) => ({
            ...prev,
            mainBarColorScheme: schemeId,
          }));
        } else if (section === "bottom" || section === "bottomBar") {
          setHeaderSettings((prev) => ({
            ...prev,
            bottomBarColorScheme: schemeId,
          }));
        }

        // Ensure the update is reflected
        setTimeout(forceRepaint, 50);
      }
    };

    window.addEventListener("message", handleColorSchemeSelection);

    return () => {
      window.removeEventListener("message", handleColorSchemeSelection);
    };
  }, [
    headerSettings.topBarColorScheme,
    headerSettings.mainBarColorScheme,
    headerSettings.bottomBarColorScheme,
  ]);

  // Also add a handler specifically for settings changes coming from the parent
  useEffect(() => {
    const handleSettingsUpdate = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_HEADER_SETTINGS" && event.data.settings) {
        // Check if any color scheme settings are included
        const updatedSettings = event.data.settings;

        if (
          updatedSettings.topBarColorScheme !== undefined ||
          updatedSettings.mainBarColorScheme !== undefined ||
          updatedSettings.bottomBarColorScheme !== undefined
        ) {
          console.log("Color scheme settings update received:", {
            top: updatedSettings.topBarColorScheme,
            main: updatedSettings.mainBarColorScheme,
            bottom: updatedSettings.bottomBarColorScheme,
          });

          // Apply the settings
          setHeaderSettings((prev) => ({
            ...prev,
            topBarColorScheme:
              updatedSettings.topBarColorScheme !== undefined
                ? updatedSettings.topBarColorScheme
                : prev.topBarColorScheme,
            mainBarColorScheme:
              updatedSettings.mainBarColorScheme !== undefined
                ? updatedSettings.mainBarColorScheme
                : prev.mainBarColorScheme,
            bottomBarColorScheme:
              updatedSettings.bottomBarColorScheme !== undefined
                ? updatedSettings.bottomBarColorScheme
                : prev.bottomBarColorScheme,
          }));
        }

        // Handle account settings
        if (
          updatedSettings.showAccount !== undefined ||
          updatedSettings.account !== undefined
        ) {
          console.log("Account settings update received:", {
            showAccount: updatedSettings.showAccount,
            account: updatedSettings.account,
          });

          // Apply account settings
          setHeaderSettings((prev) => {
            const updatedState = { ...prev };

            // Handle showAccount toggle
            if (updatedSettings.showAccount !== undefined) {
              updatedState.showAccount = updatedSettings.showAccount;
              console.log(
                "Updated showAccount to:",
                updatedSettings.showAccount
              );
            }

            // Handle nested account settings
            if (updatedSettings.account !== undefined) {
              // Get current account settings or initialize empty object
              const currentAccount = prev.account || {};

              // Check if we're updating a specific field or the entire account object
              if (typeof updatedSettings.account === "object") {
                // For nested property updates like "account.showIcon"
                const accountField = Object.keys(updatedSettings.account)[0];
                if (accountField) {
                  const accountValue = updatedSettings.account[accountField];

                  // Create or update the account property
                  updatedState.account = {
                    ...currentAccount,
                    [accountField]: accountValue,
                  };

                  console.log(
                    `Updated account.${accountField} to:`,
                    accountValue
                  );
                } else {
                  // If we received an empty object, do nothing
                  updatedState.account = currentAccount;
                }
              } else {
                // If we received a direct value (unlikely), replace the entire account object
                updatedState.account = updatedSettings.account;
                console.log(
                  "Replaced entire account settings with:",
                  updatedSettings.account
                );
              }
            }

            return updatedState;
          });
        }
      }
    };

    window.addEventListener("message", handleSettingsUpdate);

    return () => {
      window.removeEventListener("message", handleSettingsUpdate);
    };
  }, []);

  // Add this style element
  useEffect(() => {
    // Add the CSS to the document head
    const styleElement = document.createElement("style");
    styleElement.innerHTML = headerItemStyles;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Enhance the getSubmenuForHeaderItem function to better handle all types of header items
  const getSubmenuForHeaderItem = (itemId: string): string => {
    console.log(`Finding submenu for item: ${itemId}`);

    // Menu items should not redirect to settings
    if (
      itemId === "mainMenu" ||
      itemId === "topBarMenu" ||
      itemId === "bottomMenu"
    ) {
      return ""; // Return empty string to indicate no submenu mapping
    }

    // Map common item prefixes/keywords to their appropriate submenu
    const submenuMappings: Record<string, string> = {
      // HTML blocks
      html_block_: "HTML",

      // Logo and main header elements
      logo: "Header Main Setting",
      headerMain: "Header Main Setting",

      // Search functionality
      search: "Header Search Setting",

      // Account functionality
      account: "Account Setting",

      // Button elements
      button_: "Buttons",
      btn_: "Buttons",

      // Social media elements
      social: "Social",

      // Top bar elements (for the top information bar)
      topBar: "Top Bar Setting",

      // Bottom bar elements
      bottomBar: "Header Bottom Setting",

      // Cart functionality
      cart: "Header Main Setting",
    };

    // Check each mapping to see if the itemId matches or contains the key
    for (const [key, submenu] of Object.entries(submenuMappings)) {
      if (
        itemId === key || // Exact match
        itemId.startsWith(key) || // Prefix match
        itemId.includes(key) // Contains match
      ) {
        console.log(
          `✅ Matched item ${itemId} to submenu ${submenu} via key ${key}`
        );
        return submenu;
      }
    }

    // Special cases for container-based items
    if (
      itemId.includes("left") ||
      itemId.includes("right") ||
      itemId.includes("center")
    ) {
      if (itemId.includes("top")) {
        console.log(`✅ Container match: ${itemId} -> Top Bar Setting`);
        return "Top Bar Setting";
      } else if (itemId.includes("middle")) {
        console.log(`✅ Container match: ${itemId} -> Header Main Setting`);
        return "Header Main Setting";
      } else if (itemId.includes("bottom")) {
        console.log(`✅ Container match: ${itemId} -> Header Bottom Setting`);
        return "Header Bottom Setting";
      }
    }

    // If no match is found, default to main settings
    console.log(
      `⚠️ No submenu match for ${itemId}, defaulting to Header Main Setting`
    );
    return "Header Main Setting";
  };

  // Function to generate account HTML based on settings
  const generateAccountHTML = (settings: HeaderSettings) => {
    const { account } = settings;

    // Default account settings
    const defaultAccount = {
      showText: true,
      text: "Account",
      showIcon: true,
      style: "default",
      iconSize: "medium",
      iconStyle: "default",
      dropdownEnabled: true,
      loginEnabled: true,
      registerEnabled: true,
      loginUrl: "/login",
      registerUrl: "/register",
    };

    // Merge default settings with user settings
    const accountSettings = { ...defaultAccount, ...(account || {}) };

    // Determine icon size
    let iconSize = "24";
    if (accountSettings.iconSize === "small") iconSize = "18";
    if (accountSettings.iconSize === "medium") iconSize = "24";
    if (accountSettings.iconSize === "large") iconSize = "30";
    if (accountSettings.iconSize === "xlarge") iconSize = "36";

    // Determine class based on style
    let containerClass = "account-icon flex items-center gap-2";
    if (accountSettings.style === "button") {
      containerClass +=
        " px-4 py-2 bg-primary text-primary-foreground rounded-md";
    } else if (accountSettings.style === "text") {
      containerClass += " text-only";
    }

    // Build the HTML
    let html = `<div class="${containerClass}">`;

    // Add icon if enabled AND not using text-only style
    if (accountSettings.showIcon && accountSettings.style !== "text") {
      // Base SVG path for the user icon
      const userIconPath = `
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      `;

      // Different icon styles
      switch (accountSettings.iconStyle) {
        case "plain":
          // Just the icon
          html += `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>`;
          break;
        case "circle":
          // Icon in blue circle
          html += `<div class="rounded-full bg-blue-400 p-1 flex items-center justify-center" style="width:${
            Number(iconSize) + 8
          }px;height:${Number(iconSize) + 8}px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                  </div>`;
          break;
        case "square":
          // Icon in blue square
          html += `<div class="rounded-md bg-blue-400 p-1 flex items-center justify-center" style="width:${
            Number(iconSize) + 8
          }px;height:${Number(iconSize) + 8}px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                  </div>`;
          break;
        case "outline-circle":
          // Icon with circular outline
          html += `<div class="rounded-full border-2 border-blue-400 p-1 flex items-center justify-center" style="width:${
            Number(iconSize) + 10
          }px;height:${Number(iconSize) + 10}px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                  </div>`;
          break;
        case "outline-square":
          // Icon with square outline
          html += `<div class="rounded-md border-2 border-blue-400 p-1 flex items-center justify-center" style="width:${
            Number(iconSize) + 10
          }px;height:${Number(iconSize) + 10}px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                  </div>`;
          break;
        case "solid-bg":
          // Icon with solid blue background (rectangle)
          html += `<div class="rounded-md bg-blue-400 p-2 flex items-center justify-center" style="width:${
            Number(iconSize) + 16
          }px;height:${Number(iconSize) + 12}px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                  </div>`;
          break;
        default:
          // Default plain icon
          html += `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>`;
      }
    }

    // Add text if enabled
    if (accountSettings.showText) {
      html += `<span>${accountSettings.text}</span>`;
    }

    html += "</div>";

    // Add dropdown if enabled
    if (accountSettings.dropdownEnabled) {
      html +=
        '<div class="account-dropdown absolute z-10 mt-2 w-48 py-1 bg-white rounded-md shadow-lg hidden group-hover:block">';

      if (accountSettings.loginEnabled) {
        html += `<a href="${accountSettings.loginUrl}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</a>`;
      }

      if (accountSettings.registerEnabled) {
        html += `<a href="${accountSettings.registerUrl}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</a>`;
      }

      html += "</div>";
    }

    return html;
  };

  // Add function to generate HTML for different menu types
  const generateMenuHTML = (menuType: string, items: any[]) => {
    if (!items || items.length === 0) return "";

    switch (menuType) {
      case "mainMenu":
        return `<nav class="main-menu">
          <ul class="flex gap-6">
            ${items
              .map(
                (item) => `
              <li class="${
                item.isButton
                  ? "bg-primary text-white px-4 py-2 rounded-md"
                  : "hover:text-primary"
              } cursor-pointer">
                ${item.text}
                ${
                  item.children && item.children.length > 0
                    ? `
                  <ul class="absolute hidden group-hover:block bg-white shadow-md mt-2 p-2 rounded-md z-10">
                    ${item.children
                      .map(
                        (child: any) => `
                      <li class="hover:text-primary py-1 cursor-pointer">${child.text}</li>
                    `
                      )
                      .join("")}
                  </ul>
                `
                    : ""
                }
              </li>
            `
              )
              .join("")}
          </ul>
        </nav>`;

      case "topBarMenu":
        return `<div class="top-bar-menu">
          <ul class="flex gap-3 text-sm">
            ${items
              .map(
                (item) => `
              <li class="hover:underline cursor-pointer">${item.text}</li>
            `
              )
              .join("")}
          </ul>
        </div>`;

      case "bottomMenu":
        return `<div class="bottom-bar-menu">
          <ul class="flex gap-4 text-sm">
            ${items
              .map(
                (item) => `
              <li class="hover:underline cursor-pointer">${item.text}</li>
            `
              )
              .join("")}
          </ul>
        </div>`;

      default:
        return "";
    }
  };

  // Add a function to generate search HTML based on settings
  const generateSearchHTML = (settings: HeaderSettings): string => {
    // Add detailed debugging information
    console.log("SEARCH HTML GEN: Settings received:", {
      type: settings.search?.type,
      show: settings.search?.show,
      style: settings.search?.style,
      design: settings.search?.design,
    });

    // DIRECTLY force updates to DOM if search components exist
    const existingComponents = document.querySelectorAll(
      '[data-item-id="search"]'
    );
    if (existingComponents.length > 0) {
      console.log(
        `SEARCH HTML GEN: Found ${existingComponents.length} existing components to update`
      );
    }

    // Get search settings with defaults - ensure type is preserved
    const searchSettings = settings.search || {
      show: true,
      type: "form",
      placeholder: "Search...",
      rounded: 4,
      showText: true,
      behavior: "inline",
      design: "standard",
      style: "minimal",
      shape: "rounded",
      showIcon: true,
      iconPosition: "left",
      iconColor: "#666666",
      iconSize: "16px",
      fontSize: "14px",
      textColor: "#333333",
      width: "250px",
      showButton: false,
      buttonText: "Search",
      buttonColor: "#4a90e2",
      buttonTextColor: "#ffffff",
    };

    // Create a unique key to force re-render when settings change
    const timestamp = Date.now();

    // Return empty if search is disabled
    if (searchSettings.show === false) {
      console.log("SEARCH HTML GEN: Search is disabled, returning empty");
      return "";
    }

    // Important: Log the actual search type and settings being used
    console.log("SEARCH HTML GEN: *** USING TYPE:", searchSettings.type, "***");

    // Force type to be lowercase string for safety
    let searchType = String(searchSettings.type || "form").toLowerCase();
    console.log(`SEARCH HTML GEN: Normalized type = "${searchType}"`);

    // Get style classes based on settings
    const styleClass =
      searchSettings.style || searchSettings.design || "minimal";
    const shapeClass = searchSettings.shape || "rounded";

    // Determine container classes based on the actual type, style, shape, and behavior
    const containerClasses = [
      searchType === "form" ? "search-box" : "search-container",
      `search-${styleClass}`,
      `search-${shapeClass}`,
      `search-type-${searchType}`,
      searchSettings.behavior === "popout" ? "search-popout" : "search-inline",
    ]
      .filter(Boolean)
      .join(" ");

    console.log("SEARCH HTML GEN: Container classes:", containerClasses);

    // Create border radius styles based on shape and rounded settings
    const borderRadiusStyle =
      shapeClass === "rounded"
        ? "border-radius: 9999px;"
        : searchSettings.rounded
        ? `border-radius: ${searchSettings.rounded}px;`
        : "";

    // Get placeholder text based on showText setting
    const placeholder =
      searchSettings.showText !== false
        ? searchSettings.placeholder || "Search..."
        : "";

    // Generate search icon HTML based on settings
    let searchIconHTML = "";
    if (searchSettings.showIcon !== false) {
      // Use provided colors and sizes or defaults
      const iconColor = searchSettings.iconColor || "#666666";
      const iconSize = searchSettings.iconSize || "16px";

      searchIconHTML = `
        <div class="search-icon-button" style="padding: 0 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      `;
    }

    // Generate button HTML if enabled
    let buttonHTML = "";
    if (searchSettings.showButton === true) {
      const buttonText = searchSettings.buttonText || "Search";
      const buttonColor = searchSettings.buttonColor || "#4a90e2";
      const buttonTextColor = searchSettings.buttonTextColor || "#ffffff";

      buttonHTML = `
        <button class="search-button" style="background-color: ${buttonColor}; color: ${buttonTextColor}; border: none; padding: 6px 12px; margin-left: 8px; border-radius: 4px; cursor: pointer;">
          ${buttonText}
        </button>
      `;
    }

    // Determine search box position for icon
    const iconPosition = searchSettings.iconPosition || "left";

    // Generate HTML based on search type using specific type checking
    let searchHTML = "";

    if (searchType === "icon") {
      console.log("SEARCH HTML GEN: Generating ICON type search");
      // Icon-only search
      searchHTML = `
        <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="icon">
          <button class="search-icon-button p-2 hover:bg-gray-200 transition-colors" style="${borderRadiusStyle}">
            <svg xmlns="http://www.w3.org/2000/svg" width="${
              searchSettings.iconSize || "18px"
            }" height="${
        searchSettings.iconSize || "18px"
      }" viewBox="0 0 24 24" fill="none" stroke="${
        searchSettings.iconColor || "currentColor"
      }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      `;
    } else if (searchType === "expandable") {
      console.log("SEARCH HTML GEN: Generating EXPANDABLE type search");
      // Expandable search
      searchHTML = `
        <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="expandable">
          <button class="search-icon-button p-2 hover:bg-gray-200 transition-colors" style="${borderRadiusStyle}">
            <svg xmlns="http://www.w3.org/2000/svg" width="${
              searchSettings.iconSize || "18px"
            }" height="${
        searchSettings.iconSize || "18px"
      }" viewBox="0 0 24 24" fill="none" stroke="${
        searchSettings.iconColor || "currentColor"
      }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <div class="search-form hidden">
            <div class="flex items-center" style="${borderRadiusStyle}">
              <input type="text" placeholder="${placeholder}" class="px-3 py-2 bg-transparent focus:outline-none w-full" style="font-size: ${
        searchSettings.fontSize || "14px"
      }; color: ${searchSettings.textColor || "#333333"};" />
            </div>
          </div>
        </div>
      `;
    } else {
      console.log("SEARCH HTML GEN: Generating FORM type search (default)");
      // Default form type
      searchHTML = `
        <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="form">
          <form class="search-type-form" style="display: flex; align-items: center;">
            <div class="flex items-center" style="padding: 6px; ${borderRadiusStyle} ${
        searchSettings.width ? `width: ${searchSettings.width};` : ""
      }">
              ${iconPosition === "left" ? searchIconHTML : ""}
              <input type="text" placeholder="${placeholder}" style="width: 100%; font-size: ${
        searchSettings.fontSize || "14px"
      }; color: ${searchSettings.textColor || "#333333"};" />
              ${iconPosition === "right" ? searchIconHTML : ""}
            </div>
            ${buttonHTML}
          </form>
        </div>
      `;
    }

    return searchHTML;
  };

  // Define the headerDefaults at the appropriate place in the component
  const headerDefaults = {
    logo: `<div class="logo-container">
      <img src="/logo.svg" class="h-8" alt="Logo" />
      <span class="ml-2 font-bold text-lg">Your Brand</span>
    </div>`,
    searchIcon: `<div class="search-icon flex items-center justify-center">
      <button class="text-current hover:text-primary flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>`,
    navIcon: `<div class="nav-icon-container" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;">
      <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
        <span class="nav-icon-text">Menu</span>
      </div>
    </div>`,
    contact: `<div class="contact-info-container" data-item-id="contact" style="display: flex; flex-direction: column; gap: 5px;">
      <div class="contact-item email" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        <span class="contact-label">Email: </span>
        <a href="mailto:contact@example.com" class="contact-value">contact@example.com</a>
      </div>
      <div class="contact-item phone" style="display: flex; align-items: center; gap: 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        <a href="tel:+1234567890" class="contact-value">(123) 456-7890</a>
      </div>
    </div>`,
    mainMenu: generateMenuHTML(
      "mainMenu",
      headerSettings.navigation?.menuType === "mainMenu"
        ? headerSettings.navigation?.items
        : []
    ),
    topBarMenu: generateMenuHTML(
      "topBarMenu",
      headerSettings.navigation?.menuType === "topBarMenu"
        ? headerSettings.navigation?.items
        : menuItemsData.topBarMenu.items
    ),
    bottomMenu: generateMenuHTML(
      "bottomMenu",
      headerSettings.navigation?.menuType === "bottomMenu"
        ? headerSettings.navigation?.items
        : menuItemsData.bottomMenu.items
    ),
    followIcons: `<div class="social-icons flex gap-3">
      <a href="#" class="hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
      </a>
      <a href="#" class="hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
      </a>
    </div>`,
    // ... other elements ...
  };

  // Add the navigation icon HTML generation function
  const generateNavIconHTML = (settings: HeaderSettings): string => {
    // Get nav icon settings with defaults
    const navIconSettings = settings.navIcon || {
      show: true,
      type: "hamburger",
      showText: true,
      text: "Menu",
      position: "right",
      drawerEffect: "slide",
      drawerDirection: "left",
      iconSize: "24px",
      iconColor: "#333333",
      textColor: "#333333",
    };

    // Return empty if nav icon is disabled
    if (navIconSettings.show === false) {
      return "";
    }

    // Generate different icon SVGs based on type
    let iconSvg = "";
    switch (navIconSettings.type) {
      case "chevron":
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6"></path>
        </svg>`;
        break;
      case "dots":
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>`;
        break;
      case "justify":
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>`;
        break;
      default: // hamburger
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>`;
    }

    // Create timestamp to force re-renders
    const timestamp = Date.now();

    // Generate text HTML if enabled
    const textHtml = navIconSettings.showText
      ? `<span style="color: ${
          navIconSettings.textColor || "#333333"
        };" class="nav-icon-text">${navIconSettings.text}</span>`
      : "";

    // Generate HTML for nav icon button with appropriate positioning
    let navIconHtml = "";
    if (navIconSettings.position === "left") {
      navIconHtml = `
        <div class="nav-icon-container" data-timestamp="${timestamp}" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;" data-drawer-effect="${navIconSettings.drawerEffect}" data-drawer-direction="${navIconSettings.drawerDirection}">
          <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
            ${iconSvg}
            ${textHtml}
          </div>
        </div>
      `;
    } else {
      navIconHtml = `
        <div class="nav-icon-container" data-timestamp="${timestamp}" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;" data-drawer-effect="${navIconSettings.drawerEffect}" data-drawer-direction="${navIconSettings.drawerDirection}">
          <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
            ${textHtml}
            ${iconSvg}
          </div>
        </div>
      `;
    }

    return navIconHtml;
  };

  // Add the contact info HTML generation function
  const generateContactHTML = (settings: HeaderSettings): string => {
    // Get contact settings with defaults
    const contactSettings = settings.contact || {
      show: true,
      email: "",
      emailLabel: "Email",
      phone: "",
      location: "",
      locationLabel: "Location",
      openHours: "Open Hours",
      hoursDetails: "Mon-Fri: 9am - 5pm\nSat: 10am - 2pm\nSun: Closed",
    };

    // Return empty if contact is disabled
    if (contactSettings.show === false) {
      return "";
    }

    // Generate HTML for contact info
    let contactHTML = `
      <div class="contact-info-container" data-item-id="contact" style="display: flex; flex-direction: column; gap: 5px;">
    `;

    // Add email if provided
    if (contactSettings.email) {
      contactHTML += `
        <div class="contact-item email" style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span class="contact-label">${contactSettings.emailLabel}: </span>
          <a href="mailto:${contactSettings.email}" class="contact-value">${contactSettings.email}</a>
        </div>
      `;
    }

    // Add phone if provided
    if (contactSettings.phone) {
      contactHTML += `
        <div class="contact-item phone" style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <a href="tel:${contactSettings.phone}" class="contact-value">${contactSettings.phone}</a>
        </div>
      `;
    }

    // Add location if provided
    if (contactSettings.location) {
      contactHTML += `
        <div class="contact-item location" style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span class="contact-label">${contactSettings.locationLabel}: </span>
          <span class="contact-value">${contactSettings.location}</span>
        </div>
      `;
    }

    // Add hours if provided
    if (contactSettings.openHours && contactSettings.hoursDetails) {
      contactHTML += `
        <div class="contact-item hours" style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="contact-label">${contactSettings.openHours}</span>
          <div class="contact-hours-details" style="display: none; position: absolute; background: white; padding: 10px; border: 1px solid #eee; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100; white-space: pre-line;">
            ${contactSettings.hoursDetails.replace(/\n/g, "<br>")}
          </div>
        </div>
      `;
    }

    contactHTML += `</div>`;
    return contactHTML;
  };

  return (
    <header
      className={`relative shadow ${isEditing ? "editing" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => {
        if (isEditing && onSelect) {
          onSelect();
        }
        sendMessageToParent({
          type: "HEADER_SETTING_SELECTED",
          settingId: "header", // For the entire header
          submenu: "General",
          itemType: "header",
          source: "header-click",
          timestamp: Date.now(),
        });
      }}
      data-top-scheme={headerSettings.topBarColorScheme || "light"}
      data-main-scheme={headerSettings.mainBarColorScheme || "light"}
      data-bottom-scheme={headerSettings.bottomBarColorScheme || "light"}
    >
      {/* Top Bar */}
      <div
        className="w-full transition-all grid grid-cols-[auto_1fr_auto] justify-between items-center px-8 gap-4 py-2"
        style={getSectionStyle("top", headerSettings.topBarColorScheme)}
      >
        <div className="flex items-center gap-4 justify-self-start flex-shrink-0">
          {renderSection(layoutItems.top_left, "top_left", {
            color: getSectionTextColor("top", headerSettings.topBarColorScheme),
          })}
        </div>
        <div className="flex gap-6 justify-self-center">
          {renderSection(layoutItems.top_center, "top_center", {
            color: getSectionTextColor("top", headerSettings.topBarColorScheme),
          })}
        </div>
        <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
          {renderSection(layoutItems.top_right, "top_right", {
            color: getSectionTextColor("top", headerSettings.topBarColorScheme),
          })}
          {headerSettings.showTopBarButton && (
            <button className="px-4 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors">
              Shop Now
            </button>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div
        className="middle-section w-full transition-all grid grid-cols-[auto_1fr_auto] items-center px-8 gap-4 py-4"
        style={getSectionStyle("main", headerSettings.mainBarColorScheme)}
      >
        <div className="flex items-center gap-4 flex-shrink-0">
          {renderSection(layoutItems.middle_left, "middle_left", {
            color: getSectionTextColor(
              "main",
              headerSettings.mainBarColorScheme
            ),
          })}
        </div>
        <div className="flex gap-6 justify-self-center">
          {renderSection(layoutItems.middle_center, "middle_center", {
            color: getSectionTextColor(
              "main",
              headerSettings.mainBarColorScheme
            ),
          })}
        </div>
        <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
          {renderSection(layoutItems.middle_right, "middle_right", {
            color: getSectionTextColor(
              "main",
              headerSettings.mainBarColorScheme
            ),
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="bottom-section w-full transition-all grid grid-cols-[auto_1fr_auto] items-center px-8 gap-4 py-3"
        style={getSectionStyle("bottom", headerSettings.bottomBarColorScheme)}
      >
        <div className="flex items-center gap-4 flex-shrink-0">
          {renderSection(layoutItems.bottom_left, "bottom_left", {
            color: getSectionTextColor(
              "bottom",
              headerSettings.bottomBarColorScheme
            ),
          })}
        </div>
        <div className="flex gap-6 justify-self-center">
          {renderSection(layoutItems.bottom_center, "bottom_center", {
            color: getSectionTextColor(
              "bottom",
              headerSettings.bottomBarColorScheme
            ),
          })}
        </div>
        <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
          {renderSection(layoutItems.bottom_right, "bottom_right", {
            color: getSectionTextColor(
              "bottom",
              headerSettings.bottomBarColorScheme
            ),
          })}
        </div>
      </div>
    </header>
  );
}
