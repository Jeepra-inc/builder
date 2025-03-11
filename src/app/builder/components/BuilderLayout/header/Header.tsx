"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Settings } from "lucide-react";
import DOMPurify from "dompurify";
import menuItemsData from "@/app/builder/data/menu-items.json";
import {
  HeaderLayout,
  LayoutSettings,
  HeaderSettings,
  HeaderProps,
} from "./types";
import { HTMLContentMap } from "./htmlContent";
import { defaultHeaderSettings } from "./defaultSettings";
import { generateSearchHTML } from "./searchSettings";
import { generateMenuHTML } from "./menuUtils";
import { headerItemStyles } from "./cssUtils";
import { getSectionStyle } from "./styleUtils";
import {
  useCssVariables,
  useMessageHandling,
  useLayoutInitialization,
  useColorSchemeEffects,
} from "./hooks";
import {
  generateAccountHTML,
  generateNavIconHTML,
  generateContactHTML,
} from "./generators";
import { sendMessageToParent, createSchemeNotifier } from "./notifications";

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

// Map header items to submenu sections
const SUBMENU_MAPPINGS = {
  html_block_: "HTML",
  logo: "Header Main Setting",
  headerMain: "Header Main Setting",
  search: "Header Search Setting",
  account: "Account Setting",
  button_: "Buttons",
  btn_: "Buttons",
  social: "Social",
  topBar: "Top Bar Setting",
  bottomBar: "Header Bottom Setting",
  cart: "Header Main Setting",
};

// Helper function to determine submenu for header items
const getSubmenuForHeaderItem = (itemId: string): string => {
  // Menu items should not redirect to settings
  if (["mainMenu", "topBarMenu", "bottomMenu"].includes(itemId)) {
    return "";
  }

  // Check each mapping to see if the itemId matches or contains the key
  for (const [key, submenu] of Object.entries(SUBMENU_MAPPINGS)) {
    if (itemId === key || itemId.startsWith(key) || itemId.includes(key)) {
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
      return "Top Bar Setting";
    } else if (itemId.includes("middle")) {
      return "Header Main Setting";
    } else if (itemId.includes("bottom")) {
      return "Header Bottom Setting";
    }
  }

  // Default to main settings
  return "Header Main Setting";
};

export default function Header({
  settings = {},
  isEditing,
  isSelected,
  onSelect,
}: HeaderProps) {
  // Use the custom hooks
  useCssVariables(settings);

  const initHeaderSettings = useMemo(() => {
    return { ...defaultHeaderSettings, ...settings };
  }, [settings]);

  // State to store the header settings
  const [headerSettings, setHeaderSettings] = useState<HeaderSettings>({
    topBarVisible: true,
    topBarHeight: 40,
    showTopBarButton: false,
    topBarColorScheme: "light",
    mainBarColorScheme: "light",
    bottomBarColorScheme: "light",
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

  // Use the createSchemeNotifier function from the notifications module
  const notifySchemeChanges = useMemo(
    () =>
      createSchemeNotifier(
        headerSettings,
        lastNotifiedSchemesRef,
        notificationTimeoutRef
      ),
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

  // Add debounced state setters to reduce re-rendering
  const debouncedSetLayoutItems = useMemo(
    () => debounce((newItems: HeaderLayout) => setLayoutItems(newItems), 100),
    []
  );

  // Update settings when props change but DON'T automatically send notifications
  useEffect(() => {
    if (JSON.stringify(headerSettings) !== JSON.stringify(settings)) {
      setHeaderSettings((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  // Use custom hooks
  useLayoutInitialization(headerSettings, setLayoutItems);
  useMessageHandling(
    layoutItems,
    setLayoutItems,
    headerSettings,
    setHeaderSettings,
    setCustomHtml,
    debouncedSetLayoutItems,
    notifySchemeChanges,
    lastNotifiedSchemesRef
  );
  useColorSchemeEffects(headerSettings, setHeaderSettings);

  // Get text color for a section based on its color scheme
  const getSectionTextColor = useCallback(
    (section: "top" | "main" | "bottom", schemeId?: string): string => {
      const style = getSectionStyle(section, schemeId);
      return style.color as string;
    },
    []
  );

  // Helper function to handle settings gear icon click
  const handleSettingsIconClick = useCallback(
    (e: React.MouseEvent, renderId: string) => {
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
        return;
      }

      // Update the last click time
      target.setAttribute("data-last-click", now.toString());

      // Get the submenu for this item
      const targetSubmenu = getSubmenuForHeaderItem(renderId);

      // Check if this setting is already open
      sendMessageToParent({
        type: "CHECK_ACTIVE_SETTING",
        settingId: renderId,
        submenu: targetSubmenu,
      });

      // Set up a one-time listener for the response
      const checkSettingListener = (response: MessageEvent) => {
        if (response.data && response.data.type === "SETTING_STATE_RESPONSE") {
          // If the response says the setting is already active, do nothing
          if (response.data.isActive) {
            window.removeEventListener("message", checkSettingListener);
            return;
          }

          // Send the message to open settings
          sendMessageToParent({
            type: "HEADER_SETTING_SELECTED",
            settingId: renderId,
            submenu: targetSubmenu,
            itemType: renderId,
            source: "gear-icon",
            timestamp: Date.now(),
            directNav: true,
          });

          // Create and dispatch a switchTab event
          try {
            const switchTabEvent = new CustomEvent("switchTab", {
              detail: {
                targetTab: "Header",
                targetSubmenu: targetSubmenu,
                settingId: renderId,
                timestamp: Date.now(),
                directNav: true,
              },
              bubbles: true,
            });

            window.dispatchEvent(switchTabEvent);
          } catch (e) {
            console.error("Error dispatching events:", e);
          }

          // Remove the listener after processing
          window.removeEventListener("message", checkSettingListener);
        }
      };

      // Add the listener
      window.addEventListener("message", checkSettingListener);

      // Set a timeout to remove the listener if no response comes back
      setTimeout(() => {
        window.removeEventListener("message", checkSettingListener);
      }, 500);
    },
    []
  );

  // Get HTML content for a layout item
  const getHtmlContent = useCallback(
    (itemId: string) => {
      // Handle menu types
      if (["mainMenu", "topBarMenu", "bottomMenu"].includes(itemId)) {
        // Check if we have navigation data for this menu type
        if (
          headerSettings.navigation?.menuType === itemId &&
          headerSettings.navigation?.items?.length > 0
        ) {
          return DOMPurify.sanitize(
            generateMenuHTML(itemId, headerSettings.navigation?.items || [])
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
        if (headerSettings.logo) {
          const logoSettings = headerSettings.logo as {
            text?: string;
            showText?: boolean;
            image?: string;
            size?: string;
          };

          const logoText = logoSettings.text || "Your Brand";
          const showText = logoSettings.showText !== false;
          let logoImage = logoSettings.image || "/logo.svg";

          const logoHtml = `
            <div class="logo-container flex items-center">
              <img src="${logoImage}" style="width: var(--logo-width);" alt="Logo" />
              ${
                showText
                  ? `<span class="ml-2 font-bold text-lg">${logoText}</span>`
                  : ""
              }
            </div>
          `;

          return DOMPurify.sanitize(logoHtml);
        }

        return DOMPurify.sanitize(
          `<img src="/logo.svg" class="h-8" alt="Logo" />`
        );
      }

      // Special handling for other item types
      const specialItemHandlers: Record<string, () => string> = {
        account: () => generateAccountHTML(headerSettings),
        search: () => generateSearchHTML(headerSettings),
        nav_icon: () => generateNavIconHTML(headerSettings),
        contact: () => generateContactHTML(headerSettings),
      };

      if (specialItemHandlers[itemId]) {
        return DOMPurify.sanitize(specialItemHandlers[itemId]());
      }

      // Check customHtml for exact match
      if (customHtml[itemId]) {
        return DOMPurify.sanitize(customHtml[itemId]);
      }

      // Check for HTML blocks in headerSettings
      if (itemId.startsWith("html_block_")) {
        const blockMatch = itemId.match(/^html_block_(\d+)$/);
        if (blockMatch && blockMatch[1]) {
          const blockNumber = blockMatch[1];
          const settingKey = `html_block_${blockNumber}`;

          // Check sources in priority order
          if (customHtml[settingKey]) {
            return DOMPurify.sanitize(customHtml[settingKey]);
          }
          if (headerSettings[settingKey as keyof HeaderSettings]) {
            return DOMPurify.sanitize(
              headerSettings[settingKey as keyof HeaderSettings] as string
            );
          }
          if (HTMLContentMap[settingKey]) {
            return DOMPurify.sanitize(HTMLContentMap[settingKey]);
          }
        }
      }

      // Check if the item is a direct property of headerSettings
      if (headerSettings[itemId as keyof HeaderSettings]) {
        const settingContent = headerSettings[itemId as keyof HeaderSettings];
        if (typeof settingContent === "string") {
          return DOMPurify.sanitize(settingContent);
        }
      }

      // Finally try HTMLContentMap
      if (HTMLContentMap[itemId]) {
        return DOMPurify.sanitize(HTMLContentMap[itemId]);
      }

      // Default fallback
      return DOMPurify.sanitize(`<div>${itemId}</div>`);
    },
    [headerSettings, customHtml]
  );

  // Memoize the renderSection function to prevent unnecessary rerenders
  const renderSection = useCallback(
    (
      items: string[],
      sectionName: string = "",
      textStyle?: React.CSSProperties
    ) => {
      // Ensure items is an array
      if (!Array.isArray(items)) {
        return null;
      }

      return items.map((itemId, index) => {
        // Skip if itemId is not a string
        if (typeof itemId !== "string") {
          return null;
        }

        // For HTML blocks, ensure we're using the exact ID to prevent mismatches
        let renderId = itemId;
        const htmlBlockMatch = itemId.match(/^html_block_(\d+)$/);
        if (htmlBlockMatch && htmlBlockMatch[1]) {
          renderId = `html_block_${htmlBlockMatch[1]}`;
        }

        const htmlContent = getHtmlContent(renderId);
        const key = `${sectionName}_${renderId}_${index}`;
        const isMenuType = ["mainMenu", "topBarMenu", "bottomMenu"].includes(
          renderId
        );

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
                onClick={(e) => handleSettingsIconClick(e, renderId)}
              >
                <Settings className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
        );
      });
    },
    [getHtmlContent, isEditing, handleSettingsIconClick]
  );

  // Also add a handler specifically for settings changes coming from the parent
  useEffect(() => {
    const handleSettingsUpdate = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "UPDATE_HEADER_SETTINGS" && event.data.settings) {
        const updatedSettings = event.data.settings;

        // Handle color scheme and visibility settings
        if (
          updatedSettings.topBarColorScheme !== undefined ||
          updatedSettings.mainBarColorScheme !== undefined ||
          updatedSettings.bottomBarColorScheme !== undefined ||
          updatedSettings.topBarVisible !== undefined ||
          updatedSettings.bottomEnabled !== undefined
        ) {
          setHeaderSettings((prev) => {
            const updatedState = { ...prev };

            // Update color scheme settings
            [
              "topBarColorScheme",
              "mainBarColorScheme",
              "bottomBarColorScheme",
            ].forEach((scheme) => {
              if (updatedSettings[scheme] !== undefined) {
                updatedState[scheme as keyof HeaderSettings] =
                  updatedSettings[scheme];
              }
            });

            // Handle topBarVisible separately
            if (updatedSettings.topBarVisible !== undefined) {
              updatedState.topBarVisible =
                typeof updatedSettings.topBarVisible === "string"
                  ? updatedSettings.topBarVisible === "true"
                  : !!updatedSettings.topBarVisible;
            }

            // Handle bottomEnabled
            if (updatedSettings.bottomEnabled !== undefined) {
              updatedState.bottomEnabled = updatedSettings.bottomEnabled;
            }

            return updatedState;
          });
        }

        // Handle account settings
        if (
          updatedSettings.showAccount !== undefined ||
          updatedSettings.account !== undefined
        ) {
          setHeaderSettings((prev) => {
            const updatedState = { ...prev };
            const currentAccount = prev.account || {};

            // Handle showAccount toggle
            if (updatedSettings.showAccount !== undefined) {
              updatedState.showAccount = updatedSettings.showAccount;
            }

            // Handle nested account settings
            if (
              updatedSettings.account !== undefined &&
              typeof updatedSettings.account === "object"
            ) {
              const accountField = Object.keys(updatedSettings.account)[0];
              if (accountField) {
                updatedState.account = {
                  ...currentAccount,
                  [accountField]: updatedSettings.account[accountField],
                };
              } else {
                updatedState.account = currentAccount;
              }
            } else if (updatedSettings.account !== undefined) {
              updatedState.account = updatedSettings.account;
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

  // Add CSS styles on component mount
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = headerItemStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Apply settings to CSS variables on component mount
  useEffect(() => {
    if (settings && window.parent) {
      // Apply CSS variables for live preview
      const layout = (settings?.layout as LayoutSettings) || {};

      // Apply header layout settings
      if (layout && layout.maxWidth) {
        document.documentElement.style.setProperty(
          "--header-max-width",
          layout.maxWidth
        );
      }

      if (layout && typeof layout.sticky === "boolean") {
        document.documentElement.style.setProperty(
          "--header-sticky",
          layout.sticky ? "true" : "false"
        );
      }

      // Apply color schemes and visibility
      const cssVariablesToSet = [
        ["--top-bar-color-scheme", settings.topBarColorScheme],
        ["--main-bar-color-scheme", settings.mainBarColorScheme],
        ["--bottom-bar-color-scheme", settings.bottomBarColorScheme],
        ["--top-bar-visible", settings.topBarVisible ? "flex" : "none"],
        ["--bottom-bar-visible", settings.bottomEnabled ? "flex" : "none"],
      ];

      cssVariablesToSet.forEach(([variable, value]) => {
        if (value !== undefined) {
          document.documentElement.style.setProperty(
            variable as string,
            value.toString()
          );
        }
      });

      // Apply height settings
      if (settings.topBarHeight) {
        document.documentElement.style.setProperty(
          "--top-bar-height",
          `${settings.topBarHeight}px`
        );
      }

      try {
        window.parent.postMessage(
          {
            type: "HEADER_SETTINGS_UPDATED",
            settings,
          },
          "*"
        );
      } catch (error) {
        console.error("Failed to send header settings to parent:", error);
      }
    }
  }, [settings]);

  // Reusable section component
  const Section = useCallback(
    ({
      position,
      scheme,
      className = "",
    }: {
      position: string;
      scheme: string;
      className?: string;
    }) => {
      const [left, center, right] = [
        `${position}_left`,
        `${position}_center`,
        `${position}_right`,
      ];

      return (
        <div
          className={`${className} container transition-all grid grid-cols-[auto_1fr_auto] items-center px-8 gap-4 py-3`}
        >
          <div className="flex items-center gap-4 flex-shrink-0">
            {renderSection(
              layoutItems[left as keyof HeaderLayout] as string[],
              left,
              {
                color: getSectionTextColor(
                  position as "top" | "main" | "bottom",
                  scheme
                ),
              }
            )}
          </div>
          <div className="flex gap-6 justify-self-center">
            {renderSection(
              layoutItems[center as keyof HeaderLayout] as string[],
              center,
              {
                color: getSectionTextColor(
                  position as "top" | "main" | "bottom",
                  scheme
                ),
              }
            )}
          </div>
          <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
            {renderSection(
              layoutItems[right as keyof HeaderLayout] as string[],
              right,
              {
                color: getSectionTextColor(
                  position as "top" | "main" | "bottom",
                  scheme
                ),
              }
            )}
            {position === "top" && headerSettings.showTopBarButton && (
              <button className="px-4 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors">
                Shop Now
              </button>
            )}
          </div>
        </div>
      );
    },
    [
      layoutItems,
      getSectionTextColor,
      renderSection,
      headerSettings.showTopBarButton,
    ]
  );

  // Handle header click
  const handleHeaderClick = useCallback(() => {
    if (isEditing && onSelect) {
      onSelect();
    }
    sendMessageToParent({
      type: "HEADER_SETTING_SELECTED",
      settingId: "header",
      submenu: "General",
      itemType: "header",
      source: "header-click",
      timestamp: Date.now(),
    });
  }, [isEditing, onSelect]);

  return (
    <header
      className={`relative shadow ${isEditing ? "editing" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={handleHeaderClick}
      data-top-scheme={headerSettings.topBarColorScheme || "light"}
      data-main-scheme={headerSettings.mainBarColorScheme || "light"}
      data-bottom-scheme={headerSettings.bottomBarColorScheme || "light"}
    >
      {/* Top Bar - Only render if topBarVisible is true */}
      {headerSettings.topBarVisible !== false && (
        <div
          className="w-full"
          style={getSectionStyle("top", headerSettings.topBarColorScheme)}
        >
          <Section
            position="top"
            scheme={headerSettings.topBarColorScheme || "light"}
            className="py-2"
          />
        </div>
      )}

      {/* Main Section */}
      <div
        className="w-full"
        style={getSectionStyle("main", headerSettings.mainBarColorScheme)}
      >
        <Section
          position="middle"
          scheme={headerSettings.mainBarColorScheme || "light"}
          className="middle-section py-4"
        />
      </div>

      {/* Bottom Section - Only render if bottomEnabled is true */}
      {headerSettings.bottomEnabled !== false && (
        <div
          className="w-full"
          style={getSectionStyle("bottom", headerSettings.bottomBarColorScheme)}
        >
          <Section
            position="bottom"
            scheme={headerSettings.bottomBarColorScheme || "light"}
            className="bottom-section"
          />
        </div>
      )}
    </header>
  );
}
