"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { getAllHeaderItems } from "../data/headerItems";
import { Facebook, Instagram, Linkedin, Phone, Twitter } from "lucide-react";

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

class HeaderSettings {
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
  topBarColorScheme?: "light" | "dark";
  topBarNavStyle?: "style1" | "style2" | "style3";
  topBarTextTransform?: "uppercase" | "capitalize" | "lowercase";
}

interface HeaderProps {
  settings?: HeaderSettings;
  isEditing?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const HTMLContentMap: Record<string, string> = {
  // Core items
  logo: '<img src="/logo.svg" class="h-8" alt="Logo" />',
  html_block_1: '<div class="html-block-1">HTML Block 1</div>',
  html_block_2: '<div class="html-block-2">HTML Block 2</div>',
  html_block_3: '<div class="html-block-3">HTML Block 3</div>',
  html_block_4: '<div class="html-block-4">HTML Block 4</div>',
  html_block_5: '<div class="html-block-5">HTML Block 5</div>',
  news_letter: '<div class="news-letter">Subscribe to our newsletter</div>',
  account: `<div class="account-widget">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
             </svg>
           </div>`,
  top_bar_menu: `<div class="top-bar-menu">
                  <a href="#" class="mx-2">About</a>
                  <a href="#" class="mx-2">Contact</a>
                  <a href="#" class="mx-2">FAQ</a>
                </div>`,
  cart: `<div class="cart-widget">
           <svg class="cart-icon" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
           </svg>
           <span class="cart-count">0</span>
         </div>`,
  nav_icon: `<button class="nav-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>`,
  main_menu: `<nav class="main-menu">
              <ul class="menu-items">
                <li><a href="/">Home</a></li>
                <li><a href="/shop">Shop</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>`,
  search: `<div class="search-widget">
             <input type="text" placeholder="Search..." />
             <svg class="search-icon" viewBox="0 0 24 24">
               <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
             </svg>
           </div>`,
  contact: `<div class="contact-widget">
             <a href="tel:+1234567890" class="flex items-center">
               <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
               </svg>
               Contact Us
             </a>
           </div>`,
  button_1:
    '<a href="#" class="header-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Button 1</a>',
  button_2:
    '<a href="#" class="header-button bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">Button 2</a>',
  checkout: `<div class="checkout-widget">
            <a href="/checkout" class="checkout-link">Checkout</a>
          </div>`,
  wishlist: `<div class="wishlist-widget">
            <a href="/wishlist" class="wishlist-link">Wishlist</a>
          </div>`,
  social_icon: `<div class="social-icons">
                 <a href="#" class="mx-1"><img src="/facebook.svg" alt="Facebook" class="w-5 h-5"></a>
                 <a href="#" class="mx-1"><img src="/twitter.svg" alt="Twitter" class="w-5 h-5"></a>
                 <a href="#" class="mx-1"><img src="/instagram.svg" alt="Instagram" class="w-5 h-5"></a>
               </div>`,

  // Extended items
  divider_1: '<div class="divider h-full w-px bg-gray-300 mx-2"></div>',
  divider_2: '<div class="divider h-full w-px bg-gray-300 mx-2"></div>',
  divider_3: '<div class="divider h-full w-px bg-gray-300 mx-2"></div>',
  divider_4: '<div class="divider h-full w-px bg-gray-300 mx-2"></div>',

  // Legacy items (keeping for backward compatibility)
  topBar: '<div class="top-bar">Top Bar</div>',
  headerMain: '<div class="header-main"></div>',
  headerBottom: '<div class="header-bottom"></div>',
  stickyHeader: '<div class="sticky-header"></div>',
  followIcons: `<div class="social-icons">
                 <a href="#"><img src="/facebook.svg" alt="Facebook"></a>
                 <a href="#"><img src="/twitter.svg" alt="Twitter"></a>
               </div>`,
  mainMenu: `<nav class="main-menu">
              <ul class="menu-items">
                <li><a href="/">Home</a></li>
                <li><a href="/shop">Shop</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>`,
  buttons: '<button class="btn-primary">Button</button>',
  dropdown: `<div class="dropdown">
              <button class="dropdown-toggle">Menu ▾</button>
              <div class="dropdown-content hidden"></div>
            </div>`,
  mobileMenu: `<button class="mobile-menu-toggle">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>`,
};

export default function Header({
  settings = {},
  isEditing,
  isSelected,
  onSelect,
}: HeaderProps) {
  const [headerSettings, setHeaderSettings] =
    useState<HeaderSettings>(settings);
  const [layoutItems, setLayoutItems] = useState({
    top_left: [] as string[],
    top_center: [] as string[],
    top_right: [] as string[],
    middle_left: [] as string[],
    middle_center: [] as string[],
    middle_right: [] as string[],
    bottom_left: [] as string[],
    bottom_center: [] as string[],
    bottom_right: [] as string[],
    available: [] as string[],
  });
  const [customHtml, setCustomHtml] = useState<Record<string, string>>({});

  // Apply settings whenever they change
  useEffect(() => {
    console.log("Header settings changed:", settings);
    console.log("HTML blocks in settings:", {
      html_block_1: settings.html_block_1,
      html_block_2: settings.html_block_2,
      html_block_3: settings.html_block_3,
      html_block_4: settings.html_block_4,
      html_block_5: settings.html_block_5,
    });

    if (settings) {
      setHeaderSettings(settings);
      console.log("Header settings updated to:", settings);

      // Apply layout items if they exist in the settings
      if (settings.layout) {
        console.log("Header layout found:", settings.layout);

        // First check for containers format (new format)
        if (settings.layout.containers) {
          console.log("Using containers format:", settings.layout.containers);

          // Log each section to help debug
          Object.entries(settings.layout.containers).forEach(
            ([section, items]) => {
              console.log(`Layout section ${section}:`, items);
              // Check if any HTML blocks are in this section
              const htmlBlocks = items.filter((item) =>
                item.startsWith("html_block_")
              );
              if (htmlBlocks.length > 0) {
                console.log(`HTML blocks in section ${section}:`, htmlBlocks);
              }
            }
          );

          // Deep clone the containers to avoid reference issues
          const newLayoutItems = JSON.parse(
            JSON.stringify(settings.layout.containers)
          );

          // Ensure HTML blocks have consistent IDs
          Object.entries(newLayoutItems).forEach(([section, items]) => {
            if (Array.isArray(items)) {
              // @ts-ignore - we know items is an array
              newLayoutItems[section] = items.map((item) => {
                if (
                  typeof item === "string" &&
                  item.match(/^html_block_(\d+)$/)
                ) {
                  const blockNumber = item.match(/^html_block_(\d+)$/)[1];
                  const exactBlockId = `html_block_${blockNumber}`;
                  console.log(
                    `Normalized HTML block ID in ${section}: ${item} -> ${exactBlockId}`
                  );
                  return exactBlockId;
                }
                return item;
              });
            }
          });

          console.log("Setting layout items to:", newLayoutItems);
          setLayoutItems(newLayoutItems);

          // If we have a currentPreset in the settings, make sure it's applied
          if (settings.layout.currentPreset) {
            console.log("Current preset found:", settings.layout.currentPreset);
            // Notify the parent window about the current preset
            window.parent.postMessage(
              {
                type: "HEADER_PRESET_LOADED",
                presetId: settings.layout.currentPreset,
              },
              "*"
            );
          }
        }
        // Fallback to old format if needed
        else {
          console.log("Using old layout format");
          const layout = settings.layout as any;
          if (
            layout.topLeft ||
            layout.topCenter ||
            layout.topRight ||
            layout.middleLeft ||
            layout.middleCenter ||
            layout.middleRight ||
            layout.bottomLeft ||
            layout.bottomCenter ||
            layout.bottomRight
          ) {
            // Create a new layout object with normalized section names
            const newLayoutItems = {
              top_left: layout.topLeft || [],
              top_center: layout.topCenter || [],
              top_right: layout.topRight || [],
              middle_left: layout.middleLeft || [],
              middle_center: layout.middleCenter || [],
              middle_right: layout.middleRight || [],
              bottom_left: layout.bottomLeft || [],
              bottom_center: layout.bottomCenter || [],
              bottom_right: layout.bottomRight || [],
            };

            // Ensure HTML blocks have consistent IDs in the old format too
            Object.entries(newLayoutItems).forEach(([section, items]) => {
              if (Array.isArray(items)) {
                // @ts-ignore - we know items is an array
                newLayoutItems[section as keyof typeof newLayoutItems] =
                  items.map((item) => {
                    if (
                      typeof item === "string" &&
                      item.match(/^html_block_(\d+)$/)
                    ) {
                      const blockNumber = item.match(/^html_block_(\d+)$/)[1];
                      const exactBlockId = `html_block_${blockNumber}`;
                      console.log(
                        `Normalized HTML block ID in ${section} (old format): ${item} -> ${exactBlockId}`
                      );
                      return exactBlockId;
                    }
                    return item;
                  });
              }
            });

            console.log(
              "Setting layout items to (old format):",
              newLayoutItems
            );
            setLayoutItems(newLayoutItems);

            // If we have a currentPreset in the settings, make sure it's applied
            if (layout.currentPreset) {
              console.log(
                "Current preset found (old format):",
                layout.currentPreset
              );
              // Notify the parent window about the current preset
              window.parent.postMessage(
                {
                  type: "HEADER_PRESET_LOADED",
                  presetId: layout.currentPreset,
                },
                "*"
              );
            }
          } else {
            console.log("No layout items found in old format");
          }
        }
      } else {
        console.log("No layout found in settings");
      }
    } else {
      console.log("No settings provided to Header component");
    }
  }, [settings]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Header received message:", event.data);

      switch (event.data.type) {
        case "UPDATE_HEADER_LAYOUT":
          // Update layout from the message
          if (event.data.presetId) {
            console.log(
              "Updating header layout from message with preset:",
              event.data.presetId
            );

            // Extract the containers from the message
            const containers = {
              top_left: event.data.top_left || [],
              top_center: event.data.top_center || [],
              top_right: event.data.top_right || [],
              middle_left: event.data.middle_left || [],
              middle_center: event.data.middle_center || [],
              middle_right: event.data.middle_right || [],
              bottom_left: event.data.bottom_left || [],
              bottom_center: event.data.bottom_center || [],
              bottom_right: event.data.bottom_right || [],
              available: event.data.available || [],
            };

            // Normalize HTML block IDs in the containers
            Object.entries(containers).forEach(([section, items]) => {
              if (Array.isArray(items)) {
                // @ts-ignore - we know items is an array
                containers[section as keyof typeof containers] = items.map(
                  (item) => {
                    if (
                      typeof item === "string" &&
                      item.match(/^html_block_(\d+)$/)
                    ) {
                      const blockNumber = item.match(/^html_block_(\d+)$/)[1];
                      const exactBlockId = `html_block_${blockNumber}`;
                      console.log(
                        `Normalized HTML block ID in preset layout for ${section}: ${item} -> ${exactBlockId}`
                      );
                      return exactBlockId;
                    }
                    return item;
                  }
                );
              }
            });

            console.log(
              "Setting layout items from preset with normalized HTML block IDs:",
              containers
            );
            // Update the layout items
            setLayoutItems(containers);

            // Update the header settings
            setHeaderSettings((prev) => ({
              ...prev,
              layout: {
                ...prev.layout,
                currentPreset: event.data.presetId,
                containers: containers,
              },
            }));
          }
          break;

        case "UPDATE_HEADER_SETTINGS":
          // Update settings immediately
          setHeaderSettings((prev) => ({ ...prev, ...event.data.settings }));

          // Extract HTML block updates
          const htmlUpdates: Record<string, string> = {};
          let hasHtmlUpdates = false;

          for (const key in event.data.settings) {
            if (key.startsWith("html_block_")) {
              // Normalize HTML block IDs to ensure consistency
              const htmlBlockMatch = key.match(/^html_block_(\d+)$/);
              if (htmlBlockMatch) {
                const blockNumber = htmlBlockMatch[1];
                const exactBlockId = `html_block_${blockNumber}`;
                console.log(
                  `Normalizing HTML block ID in settings: ${key} -> ${exactBlockId}`
                );
                htmlUpdates[exactBlockId] = event.data.settings[key];
                hasHtmlUpdates = true;
              } else {
                // Fallback if the regex somehow doesn't match
                htmlUpdates[key] = event.data.settings[key];
                hasHtmlUpdates = true;
              }
            }
          }

          // Update HTML content if we have updates
          if (hasHtmlUpdates) {
            console.log(
              "Updating customHtml with normalized IDs:",
              htmlUpdates
            );
            setCustomHtml((prev) => ({ ...prev, ...htmlUpdates }));
          }
          break;
        case "UPDATE_HEADER_LAYOUT":
          // Update layout items
          const newLayout = {
            top_left: event.data.top_left || [],
            top_center: event.data.top_center || [],
            top_right: event.data.top_right || [],
            middle_left: event.data.middle_left || [],
            middle_center: event.data.middle_center || [],
            middle_right: event.data.middle_right || [],
            bottom_left: event.data.bottom_left || [],
            bottom_center: event.data.bottom_center || [],
            bottom_right: event.data.bottom_right || [],
          };

          // Normalize HTML block IDs in the layout
          Object.entries(newLayout).forEach(([section, items]) => {
            if (Array.isArray(items)) {
              // @ts-ignore - we know items is an array
              newLayout[section as keyof typeof newLayout] = items.map(
                (item) => {
                  if (
                    typeof item === "string" &&
                    item.match(/^html_block_(\d+)$/)
                  ) {
                    const blockNumber = item.match(/^html_block_(\d+)$/)[1];
                    const exactBlockId = `html_block_${blockNumber}`;
                    console.log(
                      `Normalized HTML block ID in layout update for ${section}: ${item} -> ${exactBlockId}`
                    );
                    return exactBlockId;
                  }
                  return item;
                }
              );
            }
          });

          console.log(
            "Setting layout items with normalized HTML block IDs:",
            newLayout
          );
          setLayoutItems(newLayout);

          // Also update the headerSettings with the new layout
          setHeaderSettings((prev) => ({
            ...prev,
            layout: {
              ...prev.layout,
              containers: newLayout,
              currentPreset: event.data.presetId,
            },
          }));
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const getHtmlContent = (itemId: string) => {
    console.log(`Getting HTML content for item: ${itemId}`);

    // Special case for logo - always return the default HTML if we have issues
    if (itemId === "logo") {
      return (
        HTMLContentMap.logo || '<img src="/logo.svg" class="h-8" alt="Logo" />'
      );
    }

    // Ensure we're using the exact item ID for HTML blocks
    // This prevents html_block_2 from becoming html_block_3 in the preview
    const htmlBlockMatch = itemId.match(/^html_block_(\d+)$/);
    if (htmlBlockMatch) {
      const blockNumber = htmlBlockMatch[1];
      const exactBlockId = `html_block_${blockNumber}`;
      console.log(`Matched HTML block: ${exactBlockId}`);

      // Check for content in priority order
      // 1. customHtml (from real-time updates)
      if (
        customHtml[exactBlockId] &&
        typeof customHtml[exactBlockId] === "string"
      ) {
        console.log(`Using customHtml for ${exactBlockId}`);
        return customHtml[exactBlockId];
      }

      // 2. headerSettings (from saved settings)
      if (
        headerSettings[exactBlockId as keyof HeaderSettings] &&
        typeof headerSettings[exactBlockId as keyof HeaderSettings] === "string"
      ) {
        console.log(`Using headerSettings for ${exactBlockId}`);
        return headerSettings[exactBlockId as keyof HeaderSettings] as string;
      }

      // 3. default HTMLContentMap
      if (HTMLContentMap[exactBlockId]) {
        console.log(`Using HTMLContentMap for ${exactBlockId}`);
        return HTMLContentMap[exactBlockId];
      }

      console.warn(`No content found for HTML block: ${exactBlockId}`);
      return `<div class="${exactBlockId}">HTML Block ${blockNumber}</div>`;
    }

    const item = getAllHeaderItems().find((item) => item.id === itemId);
    if (!item) {
      console.warn(`No header item found with ID: ${itemId}`);
      return "";
    }

    // Return divider content for divider items
    if (item.type === "divider") return HTMLContentMap.divider_1;

    // Simple priority order for HTML content
    // 1. customHtml (from real-time updates)
    // 2. headerSettings (from saved settings)
    // 3. default HTMLContentMap

    // Get content with fallbacks
    let content = null;
    let contentSource = "none";

    // First try customHtml
    if (customHtml[itemId] && typeof customHtml[itemId] === "string") {
      content = customHtml[itemId];
      contentSource = "customHtml";
      console.log(`Found content for ${itemId} in customHtml:`, content);
    }
    // Then try headerSettings
    else if (headerSettings[itemId as keyof HeaderSettings]) {
      const settingContent = headerSettings[itemId as keyof HeaderSettings];
      if (typeof settingContent === "string") {
        content = settingContent;
        contentSource = "headerSettings";
        console.log(`Found content for ${itemId} in headerSettings:`, content);
      } else {
        console.warn(
          `Content for ${itemId} in headerSettings is not a string:`,
          settingContent
        );
      }
    }
    // Finally try HTMLContentMap
    else if (HTMLContentMap[itemId]) {
      content = HTMLContentMap[itemId];
      contentSource = "HTMLContentMap";
      console.log(
        `Found content for ${itemId} in HTMLContentMap:`,
        content.substring(0, 50) + "..."
      );
    } else {
      console.warn(`No content found for ${itemId} in any source`);
    }

    // If content is still null or is an object, use a fallback
    if (content === null || typeof content === "object") {
      console.warn(`Content for ${itemId} is not a valid string:`, content);

      // Try to get a default from HTMLContentMap
      if (HTMLContentMap[itemId]) {
        console.log(`Using default HTMLContentMap for ${itemId}`);
        return HTMLContentMap[itemId];
      }

      // Last resort - return empty string
      console.warn(`No fallback found for ${itemId}, returning empty string`);
      return "";
    }

    console.log(`Returning content for ${itemId} from ${contentSource}`);
    return content;
  };

  const renderSection = (items: string[], sectionName: string = "") => {
    console.log(`Rendering section ${sectionName} with items:`, items);

    // Ensure items is an array
    if (!Array.isArray(items)) {
      console.warn(`Items for section ${sectionName} is not an array:`, items);
      return null;
    }

    return items.map((itemId, index) => {
      console.log(
        `Rendering item ${index} in section ${sectionName}: ${itemId}`
      );

      // Skip if itemId is not a string
      if (typeof itemId !== "string") {
        console.warn(`Invalid item ID in section ${sectionName}:`, itemId);
        return null;
      }

      // For HTML blocks, ensure we're using the exact ID to prevent mismatches
      let renderId = itemId;
      const htmlBlockMatch = itemId.match(/^html_block_(\d+)$/);
      if (htmlBlockMatch) {
        const blockNumber = htmlBlockMatch[1];
        renderId = `html_block_${blockNumber}`;
        console.log(`Using exact HTML block ID: ${renderId}`);
      }

      const htmlContent = getHtmlContent(renderId);
      if (!htmlContent) {
        console.warn(
          `No HTML content found for item ${renderId} in section ${sectionName}`
        );
        return null;
      }

      console.log(
        `Successfully rendered item ${renderId} in section ${sectionName}`
      );
      return (
        <div
          key={`${sectionName}_${renderId}_${index}_${Math.random()}`}
          className="header-item"
          data-item-id={renderId} // Add data attribute for debugging
          data-original-id={itemId} // Store the original ID for reference
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          onClick={() => {
            if (isEditing) {
              console.log(
                `Clicked on item ${renderId} in section ${sectionName}`
              );
              window.parent.postMessage(
                { type: "SELECT_HEADER_SETTING", settingId: renderId },
                "*"
              );
            }
          }}
        />
      );
    });
  };

  const getTopBarClasses = () => {
    const classes = [
      "w-full",
      "transition-all",
      "grid grid-cols-[auto_1fr_auto] justify-between items-center px-8 gap-4",
      headerSettings.topBarColorScheme === "light"
        ? "bg-gray-100 text-gray-600"
        : "bg-gray-800 text-gray-200",
    ];

    switch (headerSettings.topBarNavStyle) {
      case "style1":
        classes.push("border-b border-gray-200");
        break;
      case "style2":
        classes.push("shadow-sm");
        break;
      case "style3":
        classes.push("border-b-2 border-primary");
        break;
    }

    if (headerSettings.topBarTextTransform) {
      classes.push(headerSettings.topBarTextTransform);
    }

    return clsx(classes);
  };

  return (
    <header
      className={`relative bg-white shadow ${isEditing ? "editing" : ""} ${
        isSelected ? "selected" : ""
      }`}
      onClick={() => {
        if (isEditing && onSelect) {
          onSelect();
        }
        window.postMessage({ type: "HEADER_SETTING_SELECTED" }, "*");
      }}
    >
      {headerSettings.topBarVisible !== false && (
        <div className="header-preview">
          {/* Top Section */}
          <div className={clsx(getTopBarClasses(), "top-section p-2")}>
            <div className="flex items-center gap-4 flex-shrink-0">
              {renderSection(layoutItems.top_left, "top_left")}
            </div>
            <div className="flex gap-6 justify-self-center">
              {renderSection(layoutItems.top_center, "top_center")}
            </div>
            <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
              {renderSection(layoutItems.top_right, "top_right")}
              {headerSettings.showTopBarButton && (
                <button className="px-4 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors">
                  Shop Now
                </button>
              )}
            </div>
          </div>

          {/* Middle Section */}
          <div className="middle-section grid grid-cols-[auto_1fr_auto] items-center px-8 gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              {renderSection(layoutItems.middle_left, "middle_left")}
            </div>
            <div className="flex gap-6 justify-self-center">
              {renderSection(layoutItems.middle_center, "middle_center")}
            </div>
            <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
              {renderSection(layoutItems.middle_right, "middle_right")}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="bottom-section grid grid-cols-[auto_1fr_auto] items-center px-8 gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              {renderSection(layoutItems.bottom_left, "bottom_left")}
            </div>
            <div className="flex gap-6 justify-self-center">
              {renderSection(layoutItems.bottom_center, "bottom_center")}
            </div>
            <div className="flex items-center gap-4 justify-self-end flex-shrink-0">
              {renderSection(layoutItems.bottom_right, "bottom_right")}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
