"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Trash2 } from "lucide-react";

interface ButtonSettings {
  text: string;
  url: string;
  style: string;
  target?: string;
  [key: string]: string | undefined;
}

interface HeaderButtonSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
  selectedSetting?: string | undefined;
}

export function HeaderButtonSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
  selectedSetting,
}: HeaderButtonSettingsProps) {
  const [buttonSettings, setButtonSettings] = useState<
    Record<string, ButtonSettings>
  >({});

  // Initialize button settings only when the component mounts or when specific settings properties change
  useEffect(() => {
    const initialSettings: Record<string, ButtonSettings> = {};

    // Initialize button_1 settings
    initialSettings.button_1 = {
      text: settings.button_1_text || "Button 1",
      url: settings.button_1_url || "#",
      style: settings.button_1_style || "primary",
      target: settings.button_1_target || "_self",
    };

    // Initialize button_2 settings
    initialSettings.button_2 = {
      text: settings.button_2_text || "Button 2",
      url: settings.button_2_url || "#",
      style: settings.button_2_style || "secondary",
      target: settings.button_2_target || "_self",
    };

    setButtonSettings(initialSettings);

    // Only initialize on mount and when button-specific settings change
  }, [
    settings.button_1_text,
    settings.button_1_url,
    settings.button_1_style,
    settings.button_1_target,
    settings.button_2_text,
    settings.button_2_url,
    settings.button_2_style,
    settings.button_2_target,
  ]);

  // Update settings when a button field changes
  const handleButtonUpdate = (
    buttonId: string,
    field: string,
    value: string
  ) => {
    // Check if the value actually changed to prevent unnecessary updates
    if (buttonSettings[buttonId]?.[field] === value) return;

    // Update local state
    setButtonSettings((prev) => ({
      ...prev,
      [buttonId]: {
        ...prev[buttonId],
        [field]: value,
      },
    }));

    // Create settings update object with the appropriate field names
    const settingsUpdate: Record<string, string> = {
      [`${buttonId}_${field}`]: value,
    };

    // Update parent component settings
    if (onUpdateSettings) {
      onUpdateSettings(settingsUpdate);
    }

    // Send update to iframe for immediate preview
    sendUpdateToIframe(buttonId);
  };

  // Use a ref to track update timers for each button
  const updateTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Send the updated button HTML to the iframe with debounce
  const sendUpdateToIframe = (buttonId: string) => {
    const button = buttonSettings[buttonId];
    if (!button) return;

    // Clear any existing timer for this button
    if (updateTimers.current[buttonId]) {
      clearTimeout(updateTimers.current[buttonId]);
    }

    // Set a new timer with debounce to prevent too many updates
    updateTimers.current[buttonId] = setTimeout(() => {
      // Generate HTML for the button
      const buttonHtml = generateButtonHtml(buttonId, button);

      // Send message to iframe
      try {
        if (contentRef?.current?.contentWindow) {
          contentRef.current.contentWindow.postMessage(
            {
              type: "UPDATE_HEADER_SETTINGS",
              settings: { [buttonId]: buttonHtml },
            },
            "*"
          );
        } else {
          // Fallback to direct querySelector
          const iframe = document.querySelector("iframe");
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: "UPDATE_HEADER_SETTINGS",
                settings: { [buttonId]: buttonHtml },
              },
              "*"
            );
          }
        }
      } catch (error) {
        console.error("Error sending button update to iframe:", error);
      }
    }, 300); // 300ms debounce
  };

  // Generate HTML for a button based on its settings
  const generateButtonHtml = (buttonId: string, button: ButtonSettings) => {
    const { text, url, style, target } = button;

    // Generate class based on style
    let className = "header-button";
    switch (style) {
      case "primary":
        className +=
          " bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded";
        break;
      case "secondary":
        className +=
          " bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded";
        break;
      case "outline":
        className +=
          " border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded";
        break;
      case "ghost":
        className += " hover:bg-gray-100 px-4 py-2 rounded";
        break;
      default:
        className +=
          " bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded";
    }

    return `<a href="${url}" target="${target}" class="${className}">${text}</a>`;
  };

  // Render settings for a specific button
  const renderButtonSettings = (buttonId: string) => {
    const button = buttonSettings[buttonId];
    if (!button) return null;

    return (
      <div className="space-y-4 p-3 border rounded-md">
        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={button.text}
            onChange={(e) =>
              handleButtonUpdate(buttonId, "text", e.target.value)
            }
            placeholder="Button text"
          />
        </div>

        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={button.url}
            onChange={(e) =>
              handleButtonUpdate(buttonId, "url", e.target.value)
            }
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Target</Label>
          <Select
            value={button.target}
            onValueChange={(value) =>
              handleButtonUpdate(buttonId, "target", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">Same window (_self)</SelectItem>
              <SelectItem value="_blank">New window (_blank)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={button.style}
            onValueChange={(value) =>
              handleButtonUpdate(buttonId, "style", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select button style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Button 1 Settings"
        description="Configure the first button"
        expanded={selectedSetting === "button_1"}
      >
        {renderButtonSettings("button_1")}
      </SettingSection>

      <SettingSection
        title="Button 2 Settings"
        description="Configure the second button"
        expanded={selectedSetting === "button_2"}
      >
        {renderButtonSettings("button_2")}
      </SettingSection>
    </div>
  );
}
