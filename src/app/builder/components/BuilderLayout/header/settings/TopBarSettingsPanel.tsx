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

        // Special handling for top bar visibility
        if (variable === "--top-bar-visible") {
          // Find all top-bar elements and set their display directly
          const topBars = iframe.contentDocument.querySelectorAll(
            '[data-section="top"]'
          );
          topBars.forEach((topBar) => {
            (topBar as HTMLElement).style.display =
              value === "flex" ? "flex" : "none";
          });
        }
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

        // For top bar visibility, send a specific message to handle display property directly
        if (variable === "--top-bar-visible") {
          iframe.contentWindow.postMessage(
            {
              type: "DIRECT_ELEMENT_STYLE",
              selector: '[data-section="top"]',
              style: {
                display: value === "flex" ? "flex" : "none",
              },
              timestamp: Date.now(),
            },
            "*"
          );
        }

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
      console.error("Error updating CSS in iframe:", e);
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
  // Add the ref at the component level
  const hasInitializedRef = React.useRef(false);

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
    // Skip if there's no settings object
    if (!settings) return;

    // Get current target state if in progress
    const targetStateInLocalStorage = localStorage.getItem(
      "topbar_target_state"
    );

    // Check if a toggle change is in progress - if so, don't override it
    if (localStorage.getItem("topbar_change_in_progress") === "true") {
      // If we have a target state saved, make sure our local state matches it
      if (targetStateInLocalStorage) {
        const targetState = targetStateInLocalStorage === "true";
        if (isTopBarVisible !== targetState) {
          setIsTopBarVisible(targetState);
        }
      }
      return;
    }

    // Only update BuilderContext state if it's different from incoming settings
    // and not in the middle of a change
    if (
      typeof settings.topBarVisible === "boolean" &&
      settings.topBarVisible !== isTopBarVisible
    ) {
      console.log(
        "Syncing topBarVisible from settings:",
        settings.topBarVisible
      );
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
  }, [settings, setIsTopBarVisible, isTopBarVisible]);

  // Unified effect for initialization, color scheme, and event listeners
  useEffect(() => {
    // Don't send initial settings updates if we're in the middle of a change
    if (localStorage.getItem("topbar_change_in_progress") === "true") {
      return;
    }

    // Function to collect and save all current settings
    const saveAllSettings = () => {
      const settingsToSave = {
        topBarVisible: isTopBarVisible,
        topBarNavStyle: navStyle,
        topBarTextTransform: textTransform,
        topBarColorScheme: colorScheme,
      };

      // Update parent component settings
      onUpdateSettings?.(settingsToSave);

      // Also directly update the iframe with all values
      iframeUtils.sendMessage(settingsToSave);
    };

    // 1. Initial setup - Send current settings to iframe
    // Only do this once on mount, not on every state change
    // The ref is now declared at the component level
    if (!hasInitializedRef.current) {
      iframeUtils.sendMessage({
        topBarVisible: isTopBarVisible,
        topBarColorScheme: colorScheme,
      });
      hasInitializedRef.current = true;
    }

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
    settings.topBarColorScheme,
  ]);

  // Clean up any stale flags on component mount
  useEffect(() => {
    // Check if there are stale flags (older than 5 seconds)
    const flagTimestampStr = localStorage.getItem("topbar_change_timestamp");
    const flagTimestamp = flagTimestampStr ? parseInt(flagTimestampStr, 10) : 0;
    const now = Date.now();

    if (
      now - flagTimestamp > 5000 &&
      localStorage.getItem("topbar_change_in_progress") === "true"
    ) {
      console.log("Clearing stale topbar change flags");
      localStorage.removeItem("topbar_change_in_progress");
      localStorage.removeItem("topbar_target_state");
      localStorage.removeItem("topbar_change_timestamp");
    }

    return () => {
      // Clean up on unmount to prevent flags from persisting between sessions
      if (localStorage.getItem("topbar_change_in_progress") === "true") {
        localStorage.removeItem("topbar_change_in_progress");
        localStorage.removeItem("topbar_target_state");
        localStorage.removeItem("topbar_change_timestamp");
      }
    };
  }, []);

  // Toggle top bar visibility handler
  const handleTopBarVisibilityToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("TopBarVisibilityToggle clicked", {
      current: isTopBarVisible,
      event: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
    });

    // Already handled by the component and div wrapper, so don't double-toggle
    if (e.currentTarget !== e.target) {
      console.log("Skipping toggle due to event bubbling");
      return;
    }

    // Force clear any stuck flags that might be older than 3 seconds
    const flagTimestampStr = localStorage.getItem("topbar_change_timestamp");
    const flagTimestamp = flagTimestampStr ? parseInt(flagTimestampStr, 10) : 0;
    const now = Date.now();

    if (
      now - flagTimestamp > 3000 &&
      localStorage.getItem("topbar_change_in_progress") === "true"
    ) {
      console.log("Clearing stuck topbar change flags before toggle");
      localStorage.removeItem("topbar_change_in_progress");
      localStorage.removeItem("topbar_target_state");
      localStorage.removeItem("topbar_change_timestamp");
    }

    // Check if a toggle is already in progress
    if (localStorage.getItem("topbar_change_in_progress") === "true") {
      console.log("Ignoring toggle, change already in progress");
      return;
    }

    // Toggle the state directly
    const newValue = !isTopBarVisible;
    console.log("Toggling top bar visibility to:", newValue);

    // First, immediately apply DOM changes to show visual feedback
    iframeUtils.updateCSSVariable(
      "--top-bar-visible",
      newValue ? "flex" : "none"
    );

    // Create a flag in localStorage to block future overrides temporarily
    localStorage.setItem("topbar_change_in_progress", "true");
    localStorage.setItem("topbar_target_state", String(newValue));
    localStorage.setItem("topbar_change_timestamp", String(Date.now()));

    // First update local state
    setIsTopBarVisible(newValue);

    // Force update all top bar DOM elements directly for immediate feedback
    const iframe = iframeUtils.getIframe();
    if (iframe?.contentDocument) {
      const topSections = iframe.contentDocument.querySelectorAll(
        '[data-section="top"]'
      );
      console.log(`Found ${topSections.length} top bar sections to update`);
      topSections.forEach((section) => {
        (section as HTMLElement).style.display = newValue ? "flex" : "none";
        console.log(
          `Updated top section display to: ${newValue ? "flex" : "none"}`
        );
      });

      // Also update the CSS variable
      iframe.contentDocument.documentElement.style.setProperty(
        "--top-bar-visible",
        newValue ? "flex" : "none",
        "important"
      );
      console.log(
        `Updated --top-bar-visible CSS variable to: ${
          newValue ? "flex" : "none"
        }`
      );
    } else {
      console.log(
        "Could not access iframe content document for direct DOM updates"
      );
    }

    // Small delay before sending iframe message to ensure React state has updated
    setTimeout(() => {
      console.log("Executing delayed updates for topBarVisible:", newValue);
      // Then update settings and send messages
      iframeUtils.sendMessage({ topBarVisible: newValue });

      // Only update settings if the callback exists
      if (onUpdateSettings) {
        console.log("Calling onUpdateSettings with:", {
          topBarVisible: newValue,
        });
        onUpdateSettings({ topBarVisible: newValue });

        // Also dispatch an event for the page component to save the setting globally
        console.log("Dispatching updateHeaderSetting event");
        window.dispatchEvent(
          new CustomEvent("updateHeaderSetting", {
            detail: {
              setting: "topBarVisible",
              value: newValue,
            },
          })
        );
      } else {
        console.log("onUpdateSettings callback not available");
      }

      // Clear the flag after a longer delay to ensure all updates have completed
      setTimeout(() => {
        localStorage.removeItem("topbar_change_in_progress");
        localStorage.removeItem("topbar_target_state");
        localStorage.removeItem("topbar_change_timestamp");
        console.log("Topbar change completed and flags cleared");
      }, 1000);
    }, 50);
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
        <div
          className="relative cursor-pointer"
          onClick={handleTopBarVisibilityToggle}
        >
          <Switch
            checked={isTopBarVisible}
            onCheckedChange={() => {
              // Direct toggle without the event object
              console.log("Switch toggled directly");

              // Skip if a toggle is already in progress
              if (
                localStorage.getItem("topbar_change_in_progress") === "true"
              ) {
                console.log(
                  "Ignoring direct toggle, change already in progress"
                );
                return;
              }

              // Toggle the value directly
              const newValue = !isTopBarVisible;

              // Update state and send changes
              setIsTopBarVisible(newValue);

              // Update the CSS directly
              iframeUtils.updateCSSVariable(
                "--top-bar-visible",
                newValue ? "flex" : "none"
              );

              // Update settings
              if (onUpdateSettings) {
                onUpdateSettings({ topBarVisible: newValue });

                // Dispatch the event to update global state
                window.dispatchEvent(
                  new CustomEvent("updateHeaderSetting", {
                    detail: {
                      setting: "topBarVisible",
                      value: newValue,
                    },
                  })
                );
              }
            }}
            aria-label="Toggle top bar visibility"
            className="cursor-pointer"
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
