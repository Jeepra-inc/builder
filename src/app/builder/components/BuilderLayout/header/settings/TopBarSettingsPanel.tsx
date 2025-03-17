"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import RangeSlider from "../../GlobalSettings/settings/RangeSlider";
import {
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import RadioButtonGroup from "./RadioButtonGroup";
import { ColorSchemeSelector } from "@/app/builder/components/ColorSchemeSelector";
import { ColSection } from "../../GlobalSettings/settings/colSection";
import {
  applyColorSchemeToIframe,
  saveColorSchemeToStorage,
  sendColorSchemeUpdateToIframe,
} from "./LivePreviewUtils";
import { saveSettings } from "@/app/builder/utils/settingsStorage";

interface TopBarSettings {
  topBarVisible?: boolean;
  topBarHeight?: number;
  topBarNavStyle?: string;
  topBarTextTransform?: string;
  topBarColorScheme?: string;
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
  if (!iframe?.contentWindow) return;

  // Send settings message
  iframe.contentWindow.postMessage(
    { type: "UPDATE_HEADER_SETTINGS", settings, timestamp: Date.now() },
    "*"
  );

  // Update CSS variables
  if (settings.topBarVisible !== undefined) {
    updateIframeCss(
      "--top-bar-visible",
      settings.topBarVisible ? "flex" : "none"
    );
  }

  if (settings.topBarHeight !== undefined) {
    updateIframeCss("--top-bar-height", `${settings.topBarHeight}px`);
  }
};

export function TopBarSettingsPanel({
  settings = {},
  onUpdateSettings,
}: TopBarSettingsPanelProps) {
  const { isTopBarVisible, setIsTopBarVisible } = useBuilder();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Consolidated state
  const [topBarSettings, setTopBarSettings] = useState<TopBarSettings>({
    topBarVisible: isTopBarVisible,
    topBarNavStyle: settings.topBarNavStyle || "style1",
    topBarTextTransform: settings.topBarTextTransform || "capitalize",
    topBarColorScheme: settings.topBarColorScheme || "light",
    topBarHeight:
      typeof settings.topBarHeight === "number"
        ? settings.topBarHeight
        : settings.topBarHeight
        ? Number(settings.topBarHeight)
        : 40,
  });

  // Update a single setting
  const updateSetting = (key: keyof TopBarSettings, value: any) => {
    // Update local state
    setTopBarSettings((prev) => {
      const updated = { ...prev, [key]: value };
      return updated;
    });

    // Update React context if it's the visibility
    if (key === "topBarVisible") {
      setIsTopBarVisible(value);
    }

    // Apply visual update to iframe immediately for better UX
    if (key === "topBarHeight") {
      updateIframeCss("--top-bar-height", `${value}px`);
    } else if (key === "topBarVisible") {
      updateIframeCss("--top-bar-visible", value ? "flex" : "none");
    } else if (key === "topBarColorScheme") {
      const iframe = getIframe();
      if (iframe) {
        saveColorSchemeToStorage("topBar", value);
        applyColorSchemeToIframe(iframe, "topBar", value);
        sendColorSchemeUpdateToIframe(iframe, "topBar", value);
      }
    }

    // Notify parent component about the change
    if (onUpdateSettings) {
      onUpdateSettings({ [key]: value });
    }
  };

  // Get global settings from localStorage
  const getGlobalSettings = () => {
    // Try to get settings from localStorage
    const settingsStr = localStorage.getItem("visual-builder-settings");

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

    if (settingsStr) {
      try {
        const parsedSettings = JSON.parse(settingsStr);

        // Ensure headerSettings exists
        if (!parsedSettings.headerSettings) {
          parsedSettings.headerSettings = defaultSettings.headerSettings;
        }

        return parsedSettings;
      } catch (e) {
        console.error("Error parsing settings from localStorage:", e);
      }
    }

    return defaultSettings;
  };

  // Save all settings to both API and file - this will be called from the global save button
  const saveAllSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Get current global settings
      const globalSettings = getGlobalSettings();

      // Create final settings structure
      const updatedSettings = {
        ...globalSettings,
        headerSettings: {
          ...(globalSettings.headerSettings || {}),
          ...topBarSettings,
        },
      };

      console.log("Saving settings to file:", updatedSettings);

      // 1. Save settings using the utils function which handles localStorage
      await saveSettings(updatedSettings);

      // 2. Direct API call to ensure settings.json is updated
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

      // Update iframe
      syncSettingsToIframe(topBarSettings);

      console.log("All settings saved successfully!");
      setSaveSuccess(true);

      // Reset success feedback after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);

      return true;
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Register a global save handler
  useEffect(() => {
    // Define custom event for saving top bar settings
    const handleSaveRequest = (event: Event) => {
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
  }, [topBarSettings]);

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
      }

      // Update iframe
      syncSettingsToIframe(updatedSettings);
    }
  }, [settings]);

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
            <RangeSlider
              value={topBarSettings.topBarHeight}
              min={30}
              max={80}
              step={1}
              onValueChange={(value) => updateSetting("topBarHeight", value)}
              onInput={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  updateIframeCss("--top-bar-height", `${value}px`);
                }
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Current height: {topBarSettings.topBarHeight}px
            </div>
          </ColSection>

          <SettingSection title="Navigation Style" className="px-3">
            <div
              className="flex flex-col gap-2"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateSetting("topBarNavStyle", e.target.value);
              }}
            >
              <RadioButtonGroup
                options={Array.from({ length: 9 }, (_, i) => ({
                  id: `style${i + 1}`,
                  value: `style${i + 1}`,
                  label: `${i + 1}`,
                }))}
                name="navStyle"
                required
              />
              <div className="mt-1 text-xs text-gray-500">
                Current style: {topBarSettings.topBarNavStyle}
              </div>
            </div>
          </SettingSection>

          {/* Text Transform Settings */}
          <SettingSection
            title="Text Transform"
            className="px-3"
            divider={false}
          >
            <div
              className="flex flex-col gap-2"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateSetting("topBarTextTransform", e.target.value);
              }}
            >
              <RadioButtonGroup
                options={[
                  {
                    id: "uppercase",
                    value: "uppercase",
                    label: <CaseUpper />,
                  },
                  {
                    id: "capitalize",
                    value: "capitalize",
                    label: <CaseSensitive />,
                  },
                  {
                    id: "lowercase",
                    value: "lowercase",
                    label: <CaseLower />,
                  },
                ]}
                name="textTransform"
                required
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Current transform: {topBarSettings.topBarTextTransform}
            </div>
          </SettingSection>

          <div className="text-xs text-center mt-6 px-3 text-gray-500">
            Click the Save button in the top bar to save changes
          </div>
        </>
      )}
    </>
  );
}
