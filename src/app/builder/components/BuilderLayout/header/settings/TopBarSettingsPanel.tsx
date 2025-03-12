"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import RangeSlider from "../../GlobalSettings/settings/RangeSlider";
import { CaseLower, CaseSensitive, CaseUpper } from "lucide-react";
import RadioButtonGroup from "./RadioButtonGroup";
import { ColorSchemeSelector } from "@/app/builder/components/ColorSchemeSelector";
import { ColSection } from "../../GlobalSettings/settings/colSection";
import {
  applyColorSchemeToIframe,
  saveColorSchemeToStorage,
  sendColorSchemeUpdateToIframe,
} from "./LivePreviewUtils";

interface TopBarSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

// Iframe communication utilities
const iframeUtils = {
  getIframe: () => document.querySelector("iframe") as HTMLIFrameElement | null,

  updateCSSVariable: (
    variable: string,
    value: string,
    important: boolean = true
  ) => {
    const iframe = iframeUtils.getIframe();
    if (!iframe?.contentWindow) return;

    try {
      // Try to access the iframe directly
      if (iframe.contentDocument) {
        // Same-origin access is available
        iframe.contentDocument.documentElement.style.setProperty(
          variable,
          value,
          important ? "important" : ""
        );

        // Remove direct style manipulation for top bar height
        // We'll only rely on CSS variables
      } else {
        // Same-origin access not available, use postMessage
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

        // Also send a specific message for CSS variables
        iframe.contentWindow.postMessage(
          {
            type: "UPDATE_CSS_VARIABLE",
            variable,
            value,
            important,
          },
          "*"
        );
      }
    } catch (e) {
      // Error updating CSS in iframe
    }
  },

  updateTopBarHeight: (height: number) => {
    iframeUtils.updateCSSVariable("--top-bar-height", `${height}px`);
  },

  sendMessage: (settings: any) => {
    const iframe = iframeUtils.getIframe();
    if (!iframe?.contentWindow) return;

    // Create a message with timestamp to avoid duplicates
    const message = {
      type: "UPDATE_HEADER_SETTINGS",
      settings,
      timestamp: Date.now(),
    };

    // Send the message to the iframe
    iframe.contentWindow.postMessage(message, "*");

    // For topBarHeight, also directly update the CSS
    // if (settings.topBarHeight !== undefined) {
    //   iframeUtils.updateTopBarHeight(settings.topBarHeight);
    // }

    // For topBarVisible, force immediate update in the DOM
    if (settings.topBarVisible !== undefined) {
      iframeUtils.updateCSSVariable(
        "--top-bar-visible",
        settings.topBarVisible ? "flex" : "none"
      );
    }
  },

  updateColorScheme: (section: string, value: string) => {
    // Save to localStorage for persistence
    saveColorSchemeToStorage(section, value);

    // Apply changes to iframe
    const iframe = iframeUtils.getIframe();
    if (iframe) {
      applyColorSchemeToIframe(iframe, section, value);
      sendColorSchemeUpdateToIframe(iframe, section, value);
    }
  },
};

export function TopBarSettingsPanel({
  settings = {},
  onUpdateSettings,
}: TopBarSettingsPanelProps) {
  const { isTopBarVisible, setIsTopBarVisible } = useBuilder();
  const [navStyle, setNavStyle] = useState(settings.topBarNavStyle || "style1");
  const [textTransform, setTextTransform] = useState(
    settings.topBarTextTransform || "capitalize"
  );
  const [colorScheme, setColorScheme] = useState(
    settings.topBarColorScheme || "light"
  );

  // Ensure topBarHeight is always a number
  // const initialHeight =
  //   typeof settings.topBarHeight === "number"
  //     ? settings.topBarHeight
  //     : settings.topBarHeight
  //     ? Number(settings.topBarHeight)
  //     : 40;

  // const [topBarHeight, setTopBarHeight] = useState(initialHeight);

  // Update a setting and propagate changes
  const handleSettingUpdate = (key: string) => (value: string | number) => {
    // Create settings update object
    const settingUpdate = { [key]: value };

    // Update parent component settings
    onUpdateSettings?.(settingUpdate);

    // Send to iframe
    iframeUtils.sendMessage(settingUpdate);

    // Handle special cases
    // if (key === "topBarHeight") {
    //   const numValue =
    //     typeof value === "number" ? value : parseInt(String(value), 10);
    //   setTopBarHeight(numValue);
    //   iframeUtils.updateTopBarHeight(numValue);
    // } else if (key === "topBarColorScheme") {
    //   const schemeValue = String(value);
    //   setColorScheme(schemeValue);
    //   iframeUtils.updateColorScheme("top", schemeValue);
    // }
  };

  // Sync with settings when they change
  useEffect(() => {
    // Check if a toggle change is in progress - if so, don't override it
    if (localStorage.getItem("topbar_change_in_progress") === "true") {
      return;
    }

    // Make sure BuilderContext state is synced with incoming settings
    if (
      typeof settings.topBarVisible === "boolean" &&
      settings.topBarVisible !== isTopBarVisible
    ) {
      setIsTopBarVisible(settings.topBarVisible);

      // Immediately apply CSS changes after state update to prevent delay
      iframeUtils.updateCSSVariable(
        "--top-bar-visible",
        settings.topBarVisible ? "flex" : "none"
      );
    }

    // Sync all state values with incoming settings
    setNavStyle(settings.topBarNavStyle || "style1");
    setTextTransform(settings.topBarTextTransform || "capitalize");
    setColorScheme(settings.topBarColorScheme || "light");

    // Update topBarHeight from settings if it exists
    // if (settings.topBarHeight !== undefined) {
    //   const heightValue =
    //     typeof settings.topBarHeight === "number"
    //       ? settings.topBarHeight
    //       : Number(settings.topBarHeight);

    //   setTopBarHeight(heightValue);
    // }
  }, [settings, setIsTopBarVisible, isTopBarVisible]);

  // Unified effect for initialization, color scheme, and event listeners
  useEffect(() => {
    // Function to collect and save all current settings
    const saveAllSettings = () => {
      const settingsToSave = {
        topBarVisible: isTopBarVisible,
        topBarNavStyle: navStyle,
        topBarTextTransform: textTransform,
        topBarColorScheme: colorScheme,
        // topBarHeight: topBarHeight,
      };

      // Update parent component settings
      onUpdateSettings?.(settingsToSave);

      // Also directly update the iframe with all values
      iframeUtils.sendMessage(settingsToSave);
    };

    // 1. Initial setup - Send current settings to iframe
    iframeUtils.sendMessage({
      topBarVisible: isTopBarVisible,
      topBarColorScheme: colorScheme,
    });

    // 2. Try to get saved color scheme from localStorage
    const savedColorScheme = localStorage.getItem(
      "topbar_color_scheme_preview"
    );
    if (savedColorScheme && savedColorScheme !== colorScheme) {
      setColorScheme(savedColorScheme);

      // Apply to iframe if different from settings
      if (settings.topBarColorScheme !== savedColorScheme) {
        const iframe = iframeUtils.getIframe();
        if (iframe?.contentDocument) {
          iframe.contentDocument.documentElement.style.setProperty(
            "--top-bar-color-scheme",
            savedColorScheme,
            "important"
          );

          const header = iframe.contentDocument.querySelector("header");
          if (header) {
            header.setAttribute("data-top-scheme", savedColorScheme);
          }
        }
      }
    }

    // 3. Add event listeners
    const handleSaveRequest = () => saveAllSettings();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "topbar_color_scheme_preview" &&
        e.newValue &&
        e.newValue !== colorScheme
      ) {
        setColorScheme(e.newValue);
      }
    };

    window.addEventListener("requestSaveSettings", handleSaveRequest);
    window.addEventListener("storage", handleStorageChange);

    // Clean up event listeners
    return () => {
      window.removeEventListener("requestSaveSettings", handleSaveRequest);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [
    isTopBarVisible,
    onUpdateSettings,
    navStyle,
    textTransform,
    colorScheme,
    // topBarHeight,
    settings.topBarColorScheme,
  ]);

  // Toggle top bar visibility handler
  const handleTopBarVisibilityToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle the state directly
    const newValue = !isTopBarVisible;

    // First, immediately apply DOM changes to show visual feedback
    iframeUtils.updateCSSVariable(
      "--top-bar-visible",
      newValue ? "flex" : "none"
    );

    // Create a flag in localStorage to block future overrides temporarily
    localStorage.setItem("topbar_change_in_progress", "true");
    localStorage.setItem("topbar_target_state", String(newValue));

    // First update local state
    setIsTopBarVisible(newValue);

    // Small delay before sending iframe message to ensure React state has updated
    setTimeout(() => {
      // Then update settings and send messages
      iframeUtils.sendMessage({ topBarVisible: newValue });
      onUpdateSettings?.({ topBarVisible: newValue });

      // Clear the flag after a short delay
      setTimeout(() => {
        localStorage.removeItem("topbar_change_in_progress");
        localStorage.removeItem("topbar_target_state");
      }, 500);
    }, 10);
  };

  // Handle radio button change for navigation style
  const handleNavStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNavStyle(newValue);
    handleSettingUpdate("topBarNavStyle")(newValue);
  };

  // Handle radio button change for text transform
  const handleTextTransformChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setTextTransform(newValue);
    handleSettingUpdate("topBarTextTransform")(newValue);
  };

  // Handle color scheme change
  const handleColorSchemeChange = (value: string) => {
    // Update local state immediately
    setColorScheme(value);

    // Update through general settings flow
    handleSettingUpdate("topBarColorScheme")(value);
  };

  return (
    <>
      {/* Enable Top Bar */}
      <SettingSection
        title="Top Bar Visibility"
        description="Toggle the visibility of the top bar section"
        className="flex gap-2 items-center justify-between"
      >
        <div className="relative" onClick={handleTopBarVisibilityToggle}>
          <Switch
            checked={isTopBarVisible}
            onCheckedChange={() => {}} // Empty handler since we're using the div onClick
            aria-label="Toggle top bar visibility"
          />
        </div>
      </SettingSection>

      {/* Only show other settings if top bar is visible */}
      {isTopBarVisible && (
        <>
          {/* Color Scheme Selection */}
          <ColSection
            title="Color Scheme"
            description="Select scheme for the top bar"
            className="pt-4"
          >
            <div className="flex flex-col space-y-2">
              <ColorSchemeSelector
                value={colorScheme}
                onChange={handleColorSchemeChange}
                width="w-full"
              />
            </div>
          </ColSection>
          <ColSection title="Height" description="" className="pt-4">
            <RangeSlider
              // value={topBarHeight}
              min={30}
              max={80}
              step={1}
              onValueChange={(value) => {
                handleSettingUpdate("topBarHeight")(value);
              }}
              onInput={(e) => {
                // Get the value from the input event for immediate response
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value)) {
                  // Directly update the iframe without waiting for state changes
                  iframeUtils.updateTopBarHeight(value);
                }
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {/* Current height: {topBarHeight}px */}
            </div>
          </ColSection>
          <SettingSection title="Navigation Style" className="px-3">
            <div
              className="flex flex-col gap-2"
              onChange={handleNavStyleChange}
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
                Current style: {navStyle}
              </div>
            </div>
          </SettingSection>

          {/* Navigation Settings */}
          <SettingSection
            title="Text Transform"
            className="px-3"
            divider={false}
          >
            <div
              className="flex flex-col gap-2"
              onChange={handleTextTransformChange}
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
              Current transform: {textTransform}
            </div>
          </SettingSection>
        </>
      )}
    </>
  );
}
