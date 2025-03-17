"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Slider } from "@/components/ui/slider";
import { CaseLower, CaseSensitive, CaseUpper } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ColorSchemeSelector } from "@/app/builder/components/ColorSchemeSelector";
import { ColSection } from "../../GlobalSettings/settings/colSection";
import {
  applyColorSchemeToIframe,
  sendColorSchemeUpdateToIframe,
} from "./LivePreviewUtils";

interface TopBarSettings {
  topBarVisible?: boolean;
  topBarHeight?: number;
  topBarNavStyle?: string;
  topBarTextTransform?: string;
  topBarColorScheme?: string;
  topBarFontSizeScale?: number;
}

interface TopBarSettingsPanelProps {
  settings?: TopBarSettings;
  onUpdateSettings?: (settings: TopBarSettings) => void;
}

// Get iframe element
const getIframe = () =>
  document.querySelector("iframe") as HTMLIFrameElement | null;

// Update CSS variable in iframe
const updateIframeCss = (
  variable: string,
  value: string,
  important: boolean = true
) => {
  const iframe = getIframe();
  if (!iframe?.contentWindow) return;

  try {
    // Try direct document access first
    if (iframe.contentDocument) {
      iframe.contentDocument.documentElement.style.setProperty(
        variable,
        value,
        important ? "important" : ""
      );

      // Special case for top bar visibility
      if (variable === "--top-bar-visible") {
        const topBars = iframe.contentDocument.querySelectorAll(
          '[data-section="top"]'
        );
        topBars.forEach((topBar) => {
          (topBar as HTMLElement).style.display =
            value === "flex" ? "flex" : "none";
        });
      }
    } else {
      // Fallback to postMessage
      iframe.contentWindow.postMessage(
        {
          type: "DIRECT_CSS_UPDATE",
          cssVariable: variable,
          value,
          important,
          timestamp: Date.now(),
        },
        "*"
      );

      if (variable === "--top-bar-visible") {
        iframe.contentWindow.postMessage(
          {
            type: "DIRECT_ELEMENT_STYLE",
            selector: '[data-section="top"]',
            style: { display: value === "flex" ? "flex" : "none" },
            timestamp: Date.now(),
          },
          "*"
        );
      }

      iframe.contentWindow.postMessage(
        { type: "UPDATE_CSS_VARIABLE", variable, value, important },
        "*"
      );
    }
  } catch (e) {
    console.error("Error updating CSS in iframe:", e);
  }
};

// Send settings to iframe
const syncSettingsToIframe = (settings: TopBarSettings) => {
  const iframe = getIframe();
  if (!iframe || !iframe.contentDocument) return;

  // Ensure value is a proper boolean
  const topBarVisible =
    settings.topBarVisible !== undefined
      ? Boolean(settings.topBarVisible)
      : undefined;

  // Apply each setting to the iframe's CSS variables
  if (settings.topBarColorScheme) {
    console.log(
      `Syncing topBarColorScheme to iframe: ${settings.topBarColorScheme}`
    );
    applyColorSchemeToIframe(iframe, "topBar", settings.topBarColorScheme);
    updateIframeCss(
      "--top-bar-color-scheme",
      settings.topBarColorScheme,
      false
    );
  }

  if (settings.topBarNavStyle) {
    updateIframeCss("--top-bar-nav-style", settings.topBarNavStyle);
  }

  if (settings.topBarTextTransform) {
    updateIframeCss("--top-bar-text-transform", settings.topBarTextTransform);
  }

  if (settings.topBarFontSizeScale !== undefined) {
    const scale = Number(settings.topBarFontSizeScale);
    console.log(`Syncing topBarFontSizeScale to iframe: ${scale}`);

    // Set the CSS variable
    updateIframeCss("--top-bar-font-size-scale", scale.toString());

    // Add a style element for consistent application of the font size scale
    const styleId = "top-bar-font-size-style";
    let styleEl = iframe.contentDocument.getElementById(
      styleId
    ) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement("style");
      styleEl.id = styleId;
      iframe.contentDocument.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      [data-section="top"] {
        font-size: calc(1em * var(--top-bar-font-size-scale, 1)) !important;
      }
      .top-bar {
        font-size: calc(1em * var(--top-bar-font-size-scale, 1)) !important;
      }
      .top-bar * {
        font-size: inherit;
      }
    `;

    // Also try to send a direct message to the iframe for immediate update
    iframe.contentWindow?.postMessage(
      {
        type: "UPDATE_TOP_BAR_FONT_SIZE_SCALE",
        scale,
        timestamp: Date.now(),
      },
      "*"
    );
  }

  if (topBarVisible !== undefined) {
    // Use 'flex' and 'none' for display values
    updateIframeCss("--top-bar-visible", topBarVisible ? "flex" : "none");

    // Update all elements with data-section="top"
    const topSections = iframe.contentDocument.querySelectorAll(
      '[data-section="top"]'
    );
    topSections.forEach((element) => {
      (element as HTMLElement).style.display = topBarVisible ? "flex" : "none";
    });

    // Also force update the .top-bar element directly for immediate effect
    const topBar = iframe.contentDocument.querySelector(
      ".top-bar"
    ) as HTMLElement;
    if (topBar) {
      topBar.style.display = topBarVisible ? "flex" : "none";
    }
  }

  if (settings.topBarHeight !== undefined) {
    const height = Number(settings.topBarHeight);
    console.log(`Syncing topBarHeight to iframe: ${height}px`);

    // Set the CSS variable
    updateIframeCss("--top-bar-height", `${height}px`);

    // Add a style element for consistent application of the height
    const styleId = "top-bar-height-style";
    let styleEl = iframe.contentDocument.getElementById(
      styleId
    ) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement("style");
      styleEl.id = styleId;
      iframe.contentDocument.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      [data-section="top"] {
        height: var(--top-bar-height) !important;
        min-height: var(--top-bar-height) !important;
      }
      .top-bar {
        height: var(--top-bar-height) !important;
        min-height: var(--top-bar-height) !important;
      }
    `;

    // Force a repaint
    iframe.contentDocument.body.classList.add("force-repaint");
    setTimeout(() => {
      if (iframe.contentDocument) {
        iframe.contentDocument.body.classList.remove("force-repaint");
      }
    }, 10);

    // Also try to send a direct message to the iframe for immediate update
    iframe.contentWindow?.postMessage(
      {
        type: "UPDATE_TOP_BAR_HEIGHT",
        height,
        timestamp: Date.now(),
      },
      "*"
    );
  }
};

// Add a global variable to store the latest topBarVisible setting
// This helps prevent race conditions with other components
if (typeof window !== "undefined") {
  (window as any).__latestTopBarVisible = undefined;
  (window as any).__latestTopBarHeight = undefined;
  (window as any).__latestTopBarNavStyle = undefined;
  (window as any).__latestTopBarTextTransform = undefined;
  (window as any).__latestTopBarFontSizeScale = undefined;
}

export function TopBarSettingsPanel({
  settings = {},
  onUpdateSettings,
}: TopBarSettingsPanelProps) {
  const { isTopBarVisible, setIsTopBarVisible } = useBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Remove localStorage settings on mount
  useEffect(() => {
    try {
      // Clear all localStorage to avoid any legacy data persistence
      localStorage.clear();

      console.log("Successfully cleared all localStorage data");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, []);

  // Consolidated state
  const [topBarSettings, setTopBarSettings] = useState<TopBarSettings>({
    topBarVisible:
      settings.topBarVisible !== undefined
        ? Boolean(settings.topBarVisible)
        : isTopBarVisible,
    topBarNavStyle: settings.topBarNavStyle || "style1",
    topBarTextTransform: settings.topBarTextTransform || "capitalize",
    topBarColorScheme: settings.topBarColorScheme || "light",
    topBarHeight:
      typeof settings.topBarHeight === "number"
        ? settings.topBarHeight
        : settings.topBarHeight
        ? Number(settings.topBarHeight)
        : 40,
    topBarFontSizeScale:
      typeof settings.topBarFontSizeScale === "number"
        ? settings.topBarFontSizeScale
        : settings.topBarFontSizeScale
        ? Number(settings.topBarFontSizeScale)
        : 1,
  });

  // After initializing the state, add a log
  useEffect(() => {
    console.log("TopBarSettingsPanel - Initial state for topBarColorScheme:", {
      colorScheme: topBarSettings.topBarColorScheme,
      type: typeof topBarSettings.topBarColorScheme,
      sourceValue: settings.topBarColorScheme,
      sourceType: typeof settings.topBarColorScheme,
      defaultValue: "light",
    });
  }, []);

  // Load settings from API on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const globalSettings = await getGlobalSettings();
        if (globalSettings?.headerSettings) {
          const headerSettings = globalSettings.headerSettings;

          // Log the loaded settings for debugging
          console.log("TopBarSettingsPanel - Loaded settings from API:", {
            topBarVisible: headerSettings.topBarVisible,
            topBarHeight: headerSettings.topBarHeight,
            topBarHeightType: typeof headerSettings.topBarHeight,
            topBarHeightValue: Number(headerSettings.topBarHeight),
            topBarColorScheme: headerSettings.topBarColorScheme,
            topBarColorSchemeType: typeof headerSettings.topBarColorScheme,
            topBarFontSizeScale: headerSettings.topBarFontSizeScale,
            topBarFontSizeScaleType: typeof headerSettings.topBarFontSizeScale,
            topBarFontSizeScaleValue: Number(
              headerSettings.topBarFontSizeScale
            ),
            initialTopBarHeight: topBarSettings.topBarHeight,
            initialFontSizeScale: topBarSettings.topBarFontSizeScale,
            initialColorScheme: topBarSettings.topBarColorScheme,
          });

          // First update state with the loaded values
          setTopBarSettings((prev) => {
            const updatedSettings = {
              ...prev,
              topBarVisible:
                headerSettings.topBarVisible !== undefined
                  ? Boolean(headerSettings.topBarVisible)
                  : prev.topBarVisible,
              topBarNavStyle:
                headerSettings.topBarNavStyle || prev.topBarNavStyle,
              topBarTextTransform:
                headerSettings.topBarTextTransform || prev.topBarTextTransform,
              topBarColorScheme:
                headerSettings.topBarColorScheme || prev.topBarColorScheme,
              topBarHeight:
                headerSettings.topBarHeight !== undefined
                  ? Number(headerSettings.topBarHeight)
                  : prev.topBarHeight,
              topBarFontSizeScale:
                headerSettings.topBarFontSizeScale !== undefined
                  ? Number(headerSettings.topBarFontSizeScale)
                  : prev.topBarFontSizeScale,
            };

            console.log("TopBarSettingsPanel - Updated settings state:", {
              topBarHeight: updatedSettings.topBarHeight,
              previousTopBarHeight: prev.topBarHeight,
            });

            return updatedSettings;
          });

          // Update visibility in context
          if (headerSettings.topBarVisible !== undefined) {
            setIsTopBarVisible(Boolean(headerSettings.topBarVisible));
          }

          // Sync to iframe immediately after loading
          if (
            headerSettings.topBarHeight !== undefined ||
            headerSettings.topBarVisible !== undefined
          ) {
            setTimeout(() => {
              syncSettingsToIframe({
                topBarVisible:
                  headerSettings.topBarVisible !== undefined
                    ? Boolean(headerSettings.topBarVisible)
                    : undefined,
                topBarHeight:
                  headerSettings.topBarHeight !== undefined
                    ? Number(headerSettings.topBarHeight)
                    : undefined,
              });
            }, 100);
          }
        }
      } catch (error) {
        console.error("Failed to load settings from API:", error);
      }
    };

    loadSettings();
  }, [setIsTopBarVisible]);

  // Sync with parent settings changes
  useEffect(() => {
    if (!settings) return;

    const updatedSettings: Partial<TopBarSettings> = {};
    let hasChanges = false;

    // Check each setting for changes
    if (
      typeof settings.topBarVisible === "boolean" &&
      settings.topBarVisible !== topBarSettings.topBarVisible
    ) {
      updatedSettings.topBarVisible = settings.topBarVisible;
      hasChanges = true;
    }

    if (
      settings.topBarNavStyle &&
      settings.topBarNavStyle !== topBarSettings.topBarNavStyle
    ) {
      updatedSettings.topBarNavStyle = settings.topBarNavStyle;
      hasChanges = true;
    }

    if (
      settings.topBarTextTransform &&
      settings.topBarTextTransform !== topBarSettings.topBarTextTransform
    ) {
      updatedSettings.topBarTextTransform = settings.topBarTextTransform;
      hasChanges = true;
    }

    if (
      settings.topBarColorScheme &&
      settings.topBarColorScheme !== topBarSettings.topBarColorScheme
    ) {
      updatedSettings.topBarColorScheme = settings.topBarColorScheme;
      hasChanges = true;
    }

    if (
      settings.topBarHeight &&
      Number(settings.topBarHeight) !== topBarSettings.topBarHeight
    ) {
      updatedSettings.topBarHeight = Number(settings.topBarHeight);
      hasChanges = true;
    }

    if (
      settings.topBarFontSizeScale &&
      settings.topBarFontSizeScale !== topBarSettings.topBarFontSizeScale
    ) {
      updatedSettings.topBarFontSizeScale = Number(
        settings.topBarFontSizeScale
      );
      hasChanges = true;
    }

    // Update state if changes detected
    if (hasChanges) {
      setTopBarSettings((prev) => {
        const updated = {
          ...prev,
          ...updatedSettings,
        };
        return updated;
      });

      // Update visibility in context if needed
      if (updatedSettings.topBarVisible !== undefined) {
        setIsTopBarVisible(updatedSettings.topBarVisible);

        // Notify the parent window about the visibility change
        window.parent.postMessage(
          {
            type: "updateTopBarVisibility",
            isVisible: updatedSettings.topBarVisible,
          },
          "*"
        );
      }

      // Update iframe
      syncSettingsToIframe(updatedSettings);
    }
  }, [settings, topBarSettings]);

  // Get global settings from API instead of localStorage
  const getGlobalSettings = async () => {
    // Default settings
    const defaultSettings = {
      headerSettings: {
        topBarVisible: true,
        topBarHeight: 40,
        topBarColorScheme: "light",
        topBarNavStyle: "style1",
        topBarTextTransform: "capitalize",
      },
    };

    try {
      // Fetch settings from API
      const response = await fetch("/api/settings");

      if (!response.ok) {
        console.error("Error fetching settings from API:", response.statusText);
        return defaultSettings;
      }

      const parsedSettings = await response.json();

      // Ensure headerSettings exists
      if (!parsedSettings.headerSettings) {
        parsedSettings.headerSettings = defaultSettings.headerSettings;
      }

      return parsedSettings;
    } catch (e) {
      console.error("Error fetching settings from API:", e);
      return defaultSettings;
    }
  };

  // Save all settings to API only - removed localStorage
  const saveAllSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Get current global settings
      const globalSettings = await getGlobalSettings();

      // Add a colorScheme variable to make it more prominent
      const colorScheme = topBarSettings.topBarColorScheme || "light";
      console.log(
        `TopBarSettingsPanel - Using color scheme for saving: ${colorScheme}`
      );

      // Ensure topBarVisible is a proper boolean and topBarHeight is a number
      const finalTopBarSettings = {
        ...topBarSettings,
        topBarVisible: Boolean(topBarSettings.topBarVisible),
        topBarHeight: Number(topBarSettings.topBarHeight || 40),
        topBarNavStyle: topBarSettings.topBarNavStyle || "style1",
        topBarTextTransform: topBarSettings.topBarTextTransform || "capitalize",
        topBarColorScheme: colorScheme, // Use the variable defined above
        topBarFontSizeScale: Number(topBarSettings.topBarFontSizeScale || 1),
      };

      // Add extra specific log for the color scheme to make it more visible
      console.log(
        `TopBarSettingsPanel - Final color scheme for saving: ${finalTopBarSettings.topBarColorScheme} (original: ${topBarSettings.topBarColorScheme})`
      );

      // Store the latest values globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarVisible =
          finalTopBarSettings.topBarVisible;
        (window as any).__latestTopBarHeight = finalTopBarSettings.topBarHeight;
        (window as any).__latestTopBarNavStyle =
          finalTopBarSettings.topBarNavStyle;
        (window as any).__latestTopBarTextTransform =
          finalTopBarSettings.topBarTextTransform;
        (window as any).__latestTopBarColorScheme =
          finalTopBarSettings.topBarColorScheme;
        (window as any).__latestTopBarFontSizeScale =
          finalTopBarSettings.topBarFontSizeScale;
      }

      console.log("TopBarSettingsPanel - Saving topBar settings:", {
        topBarVisible: {
          originalValue: topBarSettings.topBarVisible,
          convertedValue: Boolean(topBarSettings.topBarVisible),
          type: typeof Boolean(topBarSettings.topBarVisible),
        },
        topBarHeight: {
          originalValue: topBarSettings.topBarHeight,
          convertedValue: Number(topBarSettings.topBarHeight || 40),
          type: typeof Number(topBarSettings.topBarHeight || 40),
        },
        topBarColorScheme: {
          originalValue: topBarSettings.topBarColorScheme,
          convertedValue: topBarSettings.topBarColorScheme || "light",
          type: typeof (topBarSettings.topBarColorScheme || "light"),
        },
        topBarFontSizeScale: {
          originalValue: topBarSettings.topBarFontSizeScale,
          convertedValue: Number(topBarSettings.topBarFontSizeScale || 1),
          type: typeof Number(topBarSettings.topBarFontSizeScale || 1),
        },
      });

      // Create final settings structure
      const updatedSettings = {
        ...globalSettings,
        headerSettings: {
          ...(globalSettings.headerSettings || {}),
          ...finalTopBarSettings,
        },
      };

      console.log("TopBarSettingsPanel - Saving settings to file:", {
        topBarVisibleInHeader: updatedSettings.headerSettings.topBarVisible,
        topBarVisibleType: typeof updatedSettings.headerSettings.topBarVisible,
        topBarHeightInHeader: updatedSettings.headerSettings.topBarHeight,
        topBarHeightType: typeof updatedSettings.headerSettings.topBarHeight,
      });

      // Save using the API only
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error(
          `API returned ${response.status}: ${await response.text()}`
        );
      }

      const result = await response.json();
      console.log("TopBarSettingsPanel - API response:", result);

      // Update iframe
      syncSettingsToIframe(finalTopBarSettings);

      console.log("TopBarSettingsPanel - All settings saved successfully!");
      setSaveSuccess(true);

      // Notify that we've completed the save operation
      document.dispatchEvent(
        new CustomEvent("saveTopBarSettingsComplete", {
          detail: {
            success: true,
            topBarVisible: finalTopBarSettings.topBarVisible,
          },
        })
      );

      // Reset success feedback after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);

      // Notify of failure
      document.dispatchEvent(
        new CustomEvent("saveTopBarSettingsComplete", {
          detail: { success: false, error },
        })
      );

      alert("Failed to save settings. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [topBarSettings]);

  // Register a global save handler
  useEffect(() => {
    // Define custom event for saving top bar settings
    const handleSaveRequest = () => {
      console.log("Received save request from TopBar");
      saveAllSettings();
    };

    // Listen for save request from TopBar
    document.addEventListener("saveTopBarSettings", handleSaveRequest);

    // Initial sync to iframe
    syncSettingsToIframe(topBarSettings);

    // Set up event listener for global save requests
    window.addEventListener("requestSaveSettings", handleSaveRequest);

    return () => {
      window.removeEventListener("requestSaveSettings", handleSaveRequest);
      document.removeEventListener("saveTopBarSettings", handleSaveRequest);
    };
  }, [topBarSettings, saveAllSettings]);

  // Integration with TopBar's save function
  useEffect(() => {
    // Expose the current settings for the TopBar save function
    const getCurrentTopBarSettings = () => {
      return topBarSettings;
    };

    // Store the function in a globally accessible place
    (window as any)._getTopBarSettings = getCurrentTopBarSettings;

    return () => {
      // Clean up
      delete (window as any)._getTopBarSettings;
    };
  }, [topBarSettings]);

  // Update a single setting
  const updateSetting = (key: keyof TopBarSettings, value: any) => {
    // Process the value based on the setting type
    let processedValue = value;

    if (key === "topBarVisible") {
      processedValue = Boolean(value);
    } else if (key === "topBarHeight") {
      processedValue = Number(value);

      // Store globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarHeight = processedValue;
      }

      console.log(
        `TopBarSettingsPanel - Updated topBarHeight to ${processedValue} (current: ${topBarSettings.topBarHeight})`
      );
    } else if (key === "topBarNavStyle") {
      processedValue = String(value);

      // Store globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarNavStyle = processedValue;
      }

      console.log(
        `TopBarSettingsPanel - Updated topBarNavStyle to ${processedValue} (current: ${topBarSettings.topBarNavStyle})`
      );
    } else if (key === "topBarTextTransform") {
      processedValue = String(value);

      // Store globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarTextTransform = processedValue;
      }

      console.log(
        `TopBarSettingsPanel - Updated topBarTextTransform to ${processedValue} (current: ${topBarSettings.topBarTextTransform})`
      );
    } else if (key === "topBarFontSizeScale") {
      processedValue = Number(value);

      // Ensure valid number
      if (isNaN(processedValue)) {
        console.error(
          `Invalid topBarFontSizeScale value: ${value}, using default of 1`
        );
        processedValue = 1;
      }

      // Store globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarFontSizeScale = processedValue;
      }

      console.log(
        `TopBarSettingsPanel - Updated topBarFontSizeScale to ${processedValue} (current: ${
          topBarSettings.topBarFontSizeScale
        }, raw value: ${value}, type: ${typeof value})`
      );
    } else if (key === "topBarColorScheme") {
      processedValue = String(value);

      // Store globally to prevent race conditions
      if (typeof window !== "undefined") {
        (window as any).__latestTopBarColorScheme = processedValue;
      }

      console.log(
        `TopBarSettingsPanel - Updated topBarColorScheme to ${processedValue} (current: ${topBarSettings.topBarColorScheme}, raw value: ${value})`
      );

      // Apply to iframe immediately for better UX
      const iframe = getIframe();
      if (iframe) {
        applyColorSchemeToIframe(iframe, "topBar", processedValue);
        sendColorSchemeUpdateToIframe(iframe, "topBar", processedValue);
      }
    }

    // Check if the value has actually changed to prevent unnecessary re-renders
    if (topBarSettings[key] === processedValue) {
      console.log(
        `TopBarSettingsPanel - Skipping update for ${key}, value unchanged: ${processedValue}`
      );
      return;
    }

    // Update local state
    setTopBarSettings((prev) => {
      const updated = { ...prev, [key]: processedValue };
      return updated;
    });

    // Update React context if it's the visibility
    if (key === "topBarVisible") {
      setIsTopBarVisible(processedValue);

      // Notify the parent window about the visibility change
      window.parent.postMessage(
        {
          type: "updateTopBarVisibility",
          isVisible: processedValue,
        },
        "*"
      );
    }

    // Apply visual update to iframe immediately for better UX
    if (key === "topBarHeight") {
      updateIframeCss("--top-bar-height", `${processedValue}px`);

      // Send a direct message to the iframe for immediate update
      const iframe = getIframe();
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "UPDATE_TOP_BAR_HEIGHT",
            height: processedValue,
            timestamp: Date.now(),
          },
          "*"
        );
      }
    } else if (key === "topBarVisible") {
      updateIframeCss("--top-bar-visible", processedValue ? "flex" : "none");

      // Get iframe element
      const iframe = getIframe();
      if (iframe && iframe.contentDocument) {
        // Update the .top-bar element directly for immediate effect
        const topBar = iframe.contentDocument.querySelector(
          ".top-bar"
        ) as HTMLElement;
        if (topBar) {
          topBar.style.display = processedValue ? "flex" : "none";
        }

        // Also update all elements with data-section="top"
        const topSections = iframe.contentDocument.querySelectorAll(
          '[data-section="top"]'
        );
        topSections.forEach((element) => {
          (element as HTMLElement).style.display = processedValue
            ? "flex"
            : "none";
        });

        // Force a repaint of the iframe document to ensure changes are visible
        iframe.contentDocument.body.classList.add("force-repaint");
        setTimeout(() => {
          if (iframe.contentDocument) {
            iframe.contentDocument.body.classList.remove("force-repaint");
          }
        }, 10);

        // Also try to send a direct message to the iframe for immediate update
        iframe.contentWindow?.postMessage(
          {
            type: "UPDATE_TOP_BAR_VISIBILITY",
            isVisible: processedValue,
            timestamp: Date.now(),
          },
          "*"
        );
      }
    } else if (key === "topBarColorScheme") {
      const iframe = getIframe();
      if (iframe) {
        applyColorSchemeToIframe(iframe, "topBar", processedValue);
        sendColorSchemeUpdateToIframe(iframe, "topBar", processedValue);
      }
    } else if (key === "topBarFontSizeScale") {
      // Apply visual update to iframe immediately for better UX
      updateIframeCss("--top-bar-font-size-scale", processedValue.toString());

      // Get iframe element and update the styles
      const iframe = getIframe();
      if (iframe && iframe.contentDocument) {
        // Add or update the style element
        const styleId = "top-bar-font-size-style";
        let styleEl = iframe.contentDocument.getElementById(
          styleId
        ) as HTMLStyleElement;

        if (!styleEl) {
          styleEl = iframe.contentDocument.createElement("style");
          styleEl.id = styleId;
          iframe.contentDocument.head.appendChild(styleEl);
        }

        styleEl.textContent = `
          [data-section="top"] {
            font-size: calc(1em * var(--top-bar-font-size-scale, 1)) !important;
          }
          .top-bar {
            font-size: calc(1em * var(--top-bar-font-size-scale, 1)) !important;
          }
          .top-bar * {
            font-size: inherit;
          }
        `;

        // Send a direct message to the iframe for immediate update
        iframe.contentWindow?.postMessage(
          {
            type: "UPDATE_TOP_BAR_FONT_SIZE_SCALE",
            scale: processedValue,
            timestamp: Date.now(),
          },
          "*"
        );
      }
    }

    // Notify parent component about the change
    if (onUpdateSettings) {
      onUpdateSettings({ [key]: processedValue });
    }
  };

  // Debug: Log when topBarHeight changes
  useEffect(() => {
    console.log("TopBarSettingsPanel - topBarHeight changed:", {
      topBarHeight: topBarSettings.topBarHeight,
      type: typeof topBarSettings.topBarHeight,
    });
  }, [topBarSettings.topBarHeight]);

  // Add this useEffect to track topBarFontSizeScale changes
  useEffect(() => {
    console.log("TopBarSettingsPanel - topBarFontSizeScale changed:", {
      fontSizeScale: topBarSettings.topBarFontSizeScale,
      type: typeof topBarSettings.topBarFontSizeScale,
      savedValue:
        typeof window !== "undefined"
          ? (window as any).__latestTopBarFontSizeScale
          : undefined,
    });
  }, [topBarSettings.topBarFontSizeScale]);

  // Add this useEffect to track topBarColorScheme changes
  useEffect(() => {
    console.log("TopBarSettingsPanel - topBarColorScheme changed:", {
      colorScheme: topBarSettings.topBarColorScheme,
      type: typeof topBarSettings.topBarColorScheme,
      savedValue:
        typeof window !== "undefined"
          ? (window as any).__latestTopBarColorScheme
          : undefined,
    });
  }, [topBarSettings.topBarColorScheme]);

  return (
    <>
      {/* Enable Top Bar */}
      <SettingSection
        title="Top Bar Visibility"
        description="Toggle the visibility of the top bar section"
        className="flex gap-2 items-center justify-between"
      >
        <div className="relative">
          <Switch
            checked={topBarSettings.topBarVisible}
            onCheckedChange={(checked) =>
              updateSetting("topBarVisible", Boolean(checked))
            }
            aria-label="Toggle top bar visibility"
            className="cursor-pointer"
          />
        </div>
      </SettingSection>

      {/* Only show other settings if top bar is visible */}
      {topBarSettings.topBarVisible && (
        <>
          {/* Color Scheme Selection */}
          <ColSection
            title="Color Scheme"
            description="Select scheme for the top bar"
            className="pt-4"
          >
            <div className="flex flex-col space-y-2">
              <ColorSchemeSelector
                value={topBarSettings.topBarColorScheme || "light"}
                onChange={(value) => updateSetting("topBarColorScheme", value)}
                width="w-full"
              />
            </div>
          </ColSection>

          <ColSection title="Height" description="" className="pt-4">
            <div className="space-y-4">
              <Slider
                value={[topBarSettings.topBarHeight || 40]}
                min={30}
                max={80}
                step={1}
                onValueChange={(value) => {
                  if (value[0] !== topBarSettings.topBarHeight) {
                    updateSetting("topBarHeight", value[0]);
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>30px</span>
                <span>Current: {topBarSettings.topBarHeight || 40}px</span>
                <span>80px</span>
              </div>
            </div>
          </ColSection>

          <ColSection title="Font Size Scale" description="" className="pt-4">
            <div className="space-y-4">
              <Slider
                value={[topBarSettings.topBarFontSizeScale || 1]}
                min={0.7}
                max={1.5}
                step={0.05}
                onValueChange={(value) => {
                  // Console log the current and new values for debugging
                  console.log(
                    `Font Size Scale slider change: current=${topBarSettings.topBarFontSizeScale}, new=${value[0]}`
                  );

                  if (value[0] !== topBarSettings.topBarFontSizeScale) {
                    updateSetting("topBarFontSizeScale", value[0]);

                    // Apply change to iframe immediately for better visual feedback
                    updateIframeCss(
                      "--top-bar-font-size-scale",
                      value[0].toString()
                    );
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>0.7x</span>
                <span>
                  Current:{" "}
                  {(topBarSettings.topBarFontSizeScale || 1).toFixed(2)}x
                </span>
                <span>1.5x</span>
              </div>

              {/* Add a numeric input for precise control and debugging */}
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">Manual value:</label>
                <input
                  type="number"
                  min={0.7}
                  max={1.5}
                  step={0.05}
                  value={topBarSettings.topBarFontSizeScale || 1}
                  onChange={(e) => {
                    const newValue = parseFloat(e.target.value);
                    if (
                      !isNaN(newValue) &&
                      newValue >= 0.7 &&
                      newValue <= 1.5
                    ) {
                      updateSetting("topBarFontSizeScale", newValue);
                    }
                  }}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          </ColSection>

          <SettingSection title="Navigation Style" className="px-3">
            <div className="flex flex-col gap-2">
              <ToggleGroup
                type="single"
                className="flex-wrap justify-start"
                value={topBarSettings.topBarNavStyle}
                onValueChange={(value) => {
                  if (value) updateSetting("topBarNavStyle", value);
                }}
              >
                {Array.from({ length: 9 }, (_, i) => ({
                  id: `style${i + 1}`,
                  value: `style${i + 1}`,
                  label: `${i + 1}`,
                })).map((option) => (
                  <ToggleGroupItem
                    key={option.id}
                    value={option.value}
                    aria-label={option.label}
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </SettingSection>

          {/* Text Transform Settings */}
          <SettingSection
            title="Text Transform"
            className="px-3"
            divider={false}
          >
            <div className="flex flex-col gap-2">
              <ToggleGroup
                type="single"
                className="flex-wrap justify-start"
                value={topBarSettings.topBarTextTransform}
                onValueChange={(value) => {
                  if (value) updateSetting("topBarTextTransform", value);
                }}
              >
                <ToggleGroupItem value="uppercase" aria-label="Uppercase">
                  <CaseUpper />
                </ToggleGroupItem>
                <ToggleGroupItem value="capitalize" aria-label="Capitalize">
                  <CaseSensitive />
                </ToggleGroupItem>
                <ToggleGroupItem value="lowercase" aria-label="Lowercase">
                  <CaseLower />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </SettingSection>
        </>
      )}
    </>
  );
}
