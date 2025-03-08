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
  search: `<div class="search-box">
    <input type="text" placeholder="Search..." class="px-3 py-2 border rounded" />
    <button class="search-icon ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
    </button>
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
  followIcons: `<div class="social-icons flex gap-3">
    <a href="#" class="hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
               </svg>
    </a>
    <a href="#" class="hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    </a>
    <a href="#" class="hover:text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
      </svg>
             </a>
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
  contact: `<div class="contact-info flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    <span>+1 234 567 890</span>
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
  const [headerSettings, setHeaderSettings] =
    useState<HeaderSettings>(initHeaderSettings);

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

      // Default layout with common items
      const defaultLayout = {
        top_left: [] as string[],
        top_center: [] as string[],
        top_right: [] as string[],
        middle_left: ["mainMenu"] as string[],
        middle_center: ["logo"] as string[],
        middle_right: ["account", "cart"] as string[],
        bottom_left: ["search"] as string[],
        bottom_center: [] as string[],
        bottom_right: [] as string[],
        available: [
          "html_block_1",
          "html_block_2",
          "html_block_3",
          "html_block_4",
          "html_block_5",
        ] as string[],
      };

      setLayoutItems(defaultLayout);
    }
  }, [headerSettings.layout]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      switch (event.data.type) {
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

        // Use a wrapper div with position: relative for the gear icon
        return (
          <div
            key={key}
            className="header-item-wrapper relative group"
            data-item-id={renderId}
            data-original-id={itemId}
            style={textStyle}
            onClick={() => {
              if (isEditing) {
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

            {/* Gear icon only shown when editing */}
            {isEditing && (
              <div
                className="absolute opacity-0 group-hover:opacity-100 top-1 right-1 p-1.5 bg-black bg-opacity-80 rounded-sm cursor-pointer transition-opacity z-10 hover:bg-opacity-100"
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

                  // Get the submenu for this item and log the determination process
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
            }

            // Handle nested account settings
            if (updatedSettings.account !== undefined) {
              const currentAccount = prev.account || {};
              const accountField = Object.keys(updatedSettings.account)[0];
              const accountValue = updatedSettings.account[accountField];

              updatedState.account = {
                ...currentAccount,
                [accountField]: accountValue,
              };
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

    // Map common item prefixes/keywords to their appropriate submenu
    const submenuMappings: Record<string, string> = {
      // HTML blocks
      html_block_: "HTML",

      // Navigation elements
      mainMenu: "Header Navigation Setting",
      nav_: "Header Navigation Setting",
      topBarMenu: "Header Navigation Setting",

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
      followIcons: "Social",
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
    const { account, showAccount } = settings;

    // If account widget is disabled, return empty string
    if (showAccount === false) return "";

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
    const accountSettings = { ...defaultAccount, ...account };

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

    // Add icon if enabled
    if (accountSettings.showIcon) {
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

  return (
    <header
      className={`relative shadow ${isEditing ? "editing" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => {
        if (isEditing && onSelect) {
          onSelect();
        }
        sendMessageToParent({ type: "HEADER_SETTING_SELECTED" });
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
