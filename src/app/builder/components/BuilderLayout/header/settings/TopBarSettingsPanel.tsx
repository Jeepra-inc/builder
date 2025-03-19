"use client";

import React, { useEffect, useState } from "react";
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

// Types
export interface TopBarSettings {
  topBarVisible?: boolean;
  topBarHeight?: number;
  topBarNavStyle?: string;
  topBarTextTransform?: string;
  topBarColorScheme?: string;
  topBarFontSizeScale?: number;
  topBarNavSpacing?: number;
}

interface TopBarSettingsPanelProps {
  settings?: TopBarSettings;
  onUpdateSettings?: (settings: TopBarSettings) => void;
}

// Keep track of latest settings to prevent race conditions
const settingsStore =
  typeof window !== "undefined"
    ? {
        topBarVisible: undefined,
        topBarHeight: undefined,
        topBarNavStyle: undefined,
        topBarTextTransform: undefined,
        topBarFontSizeScale: undefined,
        topBarNavSpacing: undefined,
        topBarColorScheme: undefined,
      }
    : {};

// Iframe utilities
const getIframe = () =>
  document.querySelector("iframe") as HTMLIFrameElement | null;

// Read a CSS variable from the iframe
const getIframeCssVariable = (variableName: string, defaultValue: any): any => {
  const iframe = getIframe();
  if (!iframe?.contentDocument) return defaultValue;

  try {
    const style = getComputedStyle(iframe.contentDocument.documentElement);
    const value = style.getPropertyValue(variableName).trim();

    if (!value) return defaultValue;

    // Parse numeric values (strip 'px' if present)
    if (value.endsWith("px")) {
      return parseFloat(value.replace("px", ""));
    }

    // Try to parse as number if possible
    const numValue = parseFloat(value);
    return !isNaN(numValue) ? numValue : value;
  } catch (e) {
    console.error(`Error reading CSS variable ${variableName}:`, e);
    return defaultValue;
  }
};

// Store the final color scheme value in a global variable for the settings.json save process
const storeColorSchemeForSave = (scheme: string) => {
  if (typeof window !== "undefined") {
    (window as any).__FINAL_topBarColorScheme = scheme;
    console.log(`Stored final color scheme for save: ${scheme}`);
  }
};

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
        const topBars = iframe.contentDocument.querySelectorAll("#topBar");
        if (topBars) {
          topBars.forEach((topBar) => {
            if (topBar instanceof HTMLElement) {
              topBar.style.display = value === "flex" ? "flex" : "none";
            }
          });
        }
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
            selector: "#topBar",
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

// Helper function to update style in iframe
const updateIframeStyle = (styleId: string, cssContent: string) => {
  const iframe = getIframe();
  if (!iframe?.contentDocument) return;

  let styleEl = iframe.contentDocument.getElementById(
    styleId
  ) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = iframe.contentDocument.createElement("style");
    styleEl.id = styleId;
    iframe.contentDocument.head.appendChild(styleEl);
  }
  styleEl.textContent = cssContent;
};

// Apply setting handlers
const settingHandlers: Record<keyof TopBarSettings, (value: any) => void> = {
  topBarVisible: (value: boolean) => {
    updateIframeCss("--top-bar-visible", value ? "flex" : "none");

    const iframe = getIframe();
    if (iframe?.contentDocument) {
      // Update direct elements
      const topBar = iframe.contentDocument.querySelector(
        ".top-bar"
      ) as HTMLElement;
      if (topBar) topBar.style.display = value ? "flex" : "none";

      // Update sections
      const topSections = iframe.contentDocument.querySelectorAll(
        '[data-section="top"]'
      );
      if (topSections) {
        topSections.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = value ? "flex" : "none";
          }
        });
      }

      // Force repaint
      iframe.contentDocument.body.classList.add("force-repaint");
      setTimeout(() => {
        if (iframe.contentDocument) {
          iframe.contentDocument.body.classList.remove("force-repaint");
        }
      }, 10);

      // Send message
      iframe.contentWindow?.postMessage(
        {
          type: "UPDATE_TOP_BAR_VISIBILITY",
          isVisible: value,
          timestamp: Date.now(),
        },
        "*"
      );
    }

    // Notify parent
    window.parent.postMessage(
      { type: "updateTopBarVisibility", isVisible: value },
      "*"
    );
  },

  topBarHeight: (value: number) => {
    updateIframeCss("--top-bar-height", `${value}px`);

    const iframe = getIframe();
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        { type: "UPDATE_TOP_BAR_HEIGHT", height: value, timestamp: Date.now() },
        "*"
      );
    }
  },

  topBarColorScheme: (value: string) => {
    const iframe = getIframe();
    if (iframe) {
      applyColorSchemeToIframe(iframe, "topBar", value);
      sendColorSchemeUpdateToIframe(iframe, "topBar", value);
      updateIframeCss("--top-bar-color-scheme", value, false);

      // Store the color scheme value for saving in settings.json
      storeColorSchemeForSave(value);

      // Also extract and set color values from the scheme
      extractAndSetColorValues(value);

      iframe.contentWindow?.postMessage(
        {
          type: "PRIORITY_COLOR_SCHEME_UPDATE",
          section: "topBar",
          scheme: value,
          timestamp: Date.now(),
        },
        "*"
      );
    }
  },

  topBarFontSizeScale: (value: number) => {
    updateIframeCss("--top-bar-font-size-scale", value.toString());

    const cssContent = `
      #topBar {
        font-size: calc(1em * var(--top-bar-font-size-scale, 1)) !important;
      }
      #topBar * {
        font-size: inherit;
      }
    `;

    updateIframeStyle("top-bar-font-size-style", cssContent);

    const iframe = getIframe();
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_TOP_BAR_FONT_SIZE_SCALE",
          scale: value,
          timestamp: Date.now(),
        },
        "*"
      );
    }
  },

  topBarNavSpacing: (value: number) => {
    updateIframeCss("--top-bar-nav-spacing", `${value}px`);

    const cssContent = `
      #topBar {
        padding-left: var(--top-bar-nav-spacing, 24px) !important;
      }
    `;

    updateIframeStyle("top-bar-nav-spacing-style", cssContent);

    const iframe = getIframe();
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_TOP_BAR_NAV_SPACING",
          spacing: value,
          timestamp: Date.now(),
        },
        "*"
      );
    }
  },

  topBarNavStyle: (value: string) => {
    updateIframeCss("--top-bar-nav-style", value);
  },

  topBarTextTransform: (value: string) => {
    updateIframeCss("--top-bar-text-transform", value);
  },
};

// Function to extract color values from a scheme and set CSS variables
const extractAndSetColorValues = async (schemeId: string) => {
  try {
    console.log(
      `[TopBarSettingsPanel] Extracting color values for scheme: ${schemeId}`
    );

    // Try to load from global cache first
    let colorSchemes = [];

    if (
      typeof window !== "undefined" &&
      (window as any).globalColorSchemes?.length > 0
    ) {
      colorSchemes = (window as any).globalColorSchemes;
    } else {
      // Fetch color schemes from settings.json
      const response = await fetch("/settings.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch settings.json: ${response.status}`);
      }

      const data = await response.json();
      if (data.globalStyles?.colors?.schemes) {
        colorSchemes = data.globalStyles.colors.schemes;
      }
    }

    if (!colorSchemes || colorSchemes.length === 0) {
      console.warn("[TopBarSettingsPanel] No color schemes found");
      return;
    }

    // Find the selected scheme
    const scheme = colorSchemes.find((s: any) => s.id === schemeId);

    if (!scheme) {
      console.warn(`[TopBarSettingsPanel] Scheme not found: ${schemeId}`);

      // Try to match by case-insensitive ID
      const caseInsensitiveMatch = colorSchemes.find(
        (s: any) => s.id.toLowerCase() === schemeId.toLowerCase()
      );

      if (!caseInsensitiveMatch) {
        // Use fallback values based on scheme name
        if (schemeId === "dark" || schemeId.includes("dark")) {
          updateIframeCss("--topbar-bg", "#1a1a1a");
          updateIframeCss("--topbar-color", "#ffffff");
          updateIframeCss("--topbar-border-color", "#444444");
        } else {
          updateIframeCss("--topbar-bg", "#ffffff");
          updateIframeCss("--topbar-color", "#333333");
          updateIframeCss("--topbar-border-color", "#e5e5e5");
        }
        return;
      }

      // Use the case-insensitive match
      console.log(
        `[TopBarSettingsPanel] Using case-insensitive match: ${caseInsensitiveMatch.id}`
      );
      setColorVariables(caseInsensitiveMatch);
      return;
    }

    // Set the color variables from the scheme
    setColorVariables(scheme);
  } catch (error) {
    console.error(
      "[TopBarSettingsPanel] Error extracting color values:",
      error
    );
  }
};

// Helper function to set CSS variables from a scheme
const setColorVariables = (scheme: any) => {
  if (!scheme) return;

  console.log(
    `[TopBarSettingsPanel] Setting color variables for scheme:`,
    scheme
  );

  // Set the primary variables
  updateIframeCss("--topbar-bg", scheme.background || "#ffffff");
  updateIframeCss("--topbar-color", scheme.text || "#333333");

  // Set border color if available, otherwise derive it
  if (scheme.borderColor) {
    updateIframeCss("--topbar-border-color", scheme.borderColor);
  } else {
    // Derive border color from background
    const bgColor = scheme.background || "#ffffff";
    updateIframeCss(
      "--topbar-border-color",
      bgColor === "#ffffff" ? "#e5e5e5" : adjustColorBrightness(bgColor, 20)
    );
  }

  // Set additional variables if needed
  if (scheme.gradient) {
    updateIframeCss("--topbar-gradient", scheme.gradient);
  }

  // Apply the variables to the top bar
  const iframe = getIframe();
  if (iframe?.contentDocument) {
    const topBar = iframe.contentDocument.querySelector(
      "#topBar"
    ) as HTMLElement;
    if (topBar) {
      const cssContent = `
        #topBar {
          background: var(--topbar-bg, #ffffff) !important;
          color: var(--topbar-color, #333333) !important;
          border-color: var(--topbar-border-color, #e5e5e5) !important;
          ${
            scheme.gradient
              ? `background: var(--topbar-gradient) !important;`
              : ""
          }
        }
        #topBar a {
          color: var(--topbar-color, #333333) !important;
        }
      `;

      updateIframeStyle("topbar-colors-style", cssContent);
    }
  }
};

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, amount: number): string => {
  // Simple function to adjust hex color brightness
  if (!color.startsWith("#") || color.length !== 7) return color;

  let r = parseInt(color.substr(1, 2), 16);
  let g = parseInt(color.substr(3, 2), 16);
  let b = parseInt(color.substr(5, 2), 16);

  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Read current values from the iframe
const getCurrentIframeValues = (): Partial<TopBarSettings> => {
  if (typeof window === "undefined") return {};

  return {
    topBarHeight: getIframeCssVariable("--top-bar-height", 40),
    topBarFontSizeScale: getIframeCssVariable("--top-bar-font-size-scale", 1),
    topBarNavSpacing: getIframeCssVariable("--top-bar-nav-spacing", 24),
    topBarColorScheme: getIframeCssVariable("--top-bar-color-scheme", "light"),
  };
};

export function TopBarSettingsPanel({
  settings = {},
  onUpdateSettings,
}: TopBarSettingsPanelProps) {
  const { isTopBarVisible, setIsTopBarVisible } = useBuilder();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Get current values from iframe
  const currentIframeValues = hasInitialized ? {} : getCurrentIframeValues();

  // Debug log for color scheme in settings
  useEffect(() => {
    console.log("[TopBarSettingsPanel] Settings provided:", {
      topBarColorScheme: settings.topBarColorScheme,
      settingsType: typeof settings.topBarColorScheme,
    });
    console.log("[TopBarSettingsPanel] Current iframe values:", {
      topBarColorScheme: currentIframeValues.topBarColorScheme,
      valuesType: typeof currentIframeValues.topBarColorScheme,
    });

    // Force-load settings.json to get the latest values
    if (typeof window !== "undefined") {
      (async () => {
        try {
          const response = await fetch("/settings.json");
          if (response.ok) {
            const data = await response.json();
            const savedScheme = data.headerSettings?.topBarColorScheme;

            if (savedScheme && savedScheme !== settings.topBarColorScheme) {
              console.log(
                `[TopBarSettingsPanel] Found saved scheme in settings.json: ${savedScheme}`
              );
              // Store this for the ColorSchemeSelector
              storeColorSchemeForSave(savedScheme);

              // Update local state
              setTopBarSettings((prev) => ({
                ...prev,
                topBarColorScheme: savedScheme,
              }));
            }
          }
        } catch (error) {
          console.error(
            "[TopBarSettingsPanel] Error loading settings.json:",
            error
          );
        }
      })();
    }
  }, []);

  // Initialize state with iframe values first, then props, then defaults
  const [topBarSettings, setTopBarSettings] = useState<TopBarSettings>({
    topBarVisible: settings.topBarVisible ?? isTopBarVisible,
    topBarNavStyle: settings.topBarNavStyle || "style1",
    topBarTextTransform: settings.topBarTextTransform || "capitalize",
    topBarColorScheme:
      settings.topBarColorScheme ||
      currentIframeValues.topBarColorScheme ||
      "light",
    topBarHeight:
      currentIframeValues.topBarHeight ?? settings.topBarHeight ?? 40,
    topBarFontSizeScale:
      currentIframeValues.topBarFontSizeScale ??
      settings.topBarFontSizeScale ??
      1,
    topBarNavSpacing:
      currentIframeValues.topBarNavSpacing ?? settings.topBarNavSpacing ?? 24,
  });

  // Log the initial topBarSettings
  useEffect(() => {
    console.log("[TopBarSettingsPanel] Initial topBarSettings:", {
      topBarColorScheme: topBarSettings.topBarColorScheme,
      settingsType: typeof topBarSettings.topBarColorScheme,
    });
  }, []);

  // Only sync settings that weren't read from the iframe
  useEffect(() => {
    setHasInitialized(true);

    // Add specific log for color scheme
    console.log("[TopBarSettingsPanel] Initialization - Color scheme value:", {
      settingsValue: settings.topBarColorScheme,
      stateValue: topBarSettings.topBarColorScheme,
      iframeValue: currentIframeValues.topBarColorScheme,
      finalValue: topBarSettings.topBarColorScheme,
    });

    // Apply all settings except those we read from the iframe
    Object.entries(topBarSettings).forEach(([key, value]) => {
      if (value !== undefined) {
        // Skip applying values we already read from the iframe
        const keyTyped = key as keyof TopBarSettings;
        if (
          currentIframeValues[keyTyped] !== undefined &&
          ["topBarHeight", "topBarFontSizeScale", "topBarNavSpacing"].includes(
            key
          )
        ) {
          return;
        }

        const handler = settingHandlers[keyTyped];
        if (handler) handler(value);

        // Store color scheme for save if present
        if (key === "topBarColorScheme") {
          storeColorSchemeForSave(value as string);
          console.log(`[TopBarSettingsPanel] Applied color scheme: ${value}`);

          // Also extract and set the color values
          extractAndSetColorValues(value as string);
        }
      }
    });

    // Delayed reapplication for more reliable color scheme
    setTimeout(() => {
      if (topBarSettings.topBarColorScheme) {
        const iframe = getIframe();
        if (iframe) {
          console.log(
            `[TopBarSettingsPanel] Delayed reapplication of color scheme: ${topBarSettings.topBarColorScheme}`
          );
          applyColorSchemeToIframe(
            iframe,
            "topBar",
            topBarSettings.topBarColorScheme
          );
          sendColorSchemeUpdateToIframe(
            iframe,
            "topBar",
            topBarSettings.topBarColorScheme
          );
          storeColorSchemeForSave(topBarSettings.topBarColorScheme);

          // Make sure color variables are applied
          extractAndSetColorValues(topBarSettings.topBarColorScheme);
        }
      }
    }, 500);
  }, []);

  // Update a single setting
  const updateSetting = (key: keyof TopBarSettings, value: any) => {
    // Process the value based on the setting type
    let processedValue = value;

    // Type-specific processing
    if (key === "topBarVisible") {
      processedValue = Boolean(value);
      setIsTopBarVisible(processedValue);
    } else if (
      ["topBarHeight", "topBarFontSizeScale", "topBarNavSpacing"].includes(key)
    ) {
      processedValue = Number(value);

      // Validate number for font scale
      if (key === "topBarFontSizeScale" && isNaN(processedValue)) {
        console.error(`Invalid ${key} value: ${value}, using default of 1`);
        processedValue = 1;
      }
    } else if (key === "topBarColorScheme" && (!value || value.trim() === "")) {
      console.warn(`Empty ${key} value: ${value}, using default of 'scheme-1'`);
      processedValue = "scheme-1";
    }

    // Store in global store
    if (typeof window !== "undefined") {
      (settingsStore as Record<string, any>)[key] = processedValue;

      // Special handling for color scheme
      if (key === "topBarColorScheme") {
        storeColorSchemeForSave(processedValue);
      }
    }

    // Skip if no change
    if (topBarSettings[key] === processedValue) {
      return;
    }

    // Update local state
    setTopBarSettings((prev) => ({ ...prev, [key]: processedValue }));

    // Apply visual update handler
    const handler = settingHandlers[key];
    if (handler) handler(processedValue);

    // Notify parent component about the change
    if (onUpdateSettings) {
      onUpdateSettings({ [key]: processedValue });
    }
  };

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
                onChange={(value) => {
                  console.log(
                    `[TopBarSettingsPanel] ColorScheme selected: ${value}`
                  );
                  updateSetting("topBarColorScheme", value);
                }}
                width="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">
                  Current: {topBarSettings.topBarColorScheme || "light"}
                </span>
              </div>
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
                  if (value[0] !== topBarSettings.topBarFontSizeScale) {
                    updateSetting("topBarFontSizeScale", value[0]);
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

          {/* Nav Spacing Setting */}
          <ColSection title="Nav Spacing" description="" className="pt-4">
            <div className="space-y-4">
              <Slider
                value={[topBarSettings.topBarNavSpacing || 24]}
                min={0}
                max={48}
                step={2}
                onValueChange={(value) => {
                  if (value[0] !== topBarSettings.topBarNavSpacing) {
                    updateSetting("topBarNavSpacing", value[0]);
                  }
                }}
              />
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>0px</span>
                <span>Current: {topBarSettings.topBarNavSpacing || 24}px</span>
                <span>48px</span>
              </div>
            </div>
          </ColSection>

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
