// HeaderHtmlSettings.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";

// Add this to make TypeScript happy with our window augmentation
declare global {
  interface Window {
    updateTimeout?: number;
  }
}

interface HeaderHtmlSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
  selectedSetting?: string | undefined;
}

export function HeaderHtmlSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
  selectedSetting,
}: HeaderHtmlSettingsProps) {
  const [htmlBlocks, setHtmlBlocks] = useState({
    html_block_1: settings.html_block_1 || "",
    html_block_2: settings.html_block_2 || "",
    html_block_3: settings.html_block_3 || "",
    html_block_4: settings.html_block_4 || "",
    html_block_5: settings.html_block_5 || "",
  });

  // Initialize state from settings only once when mounted or when settings change significantly
  useEffect(() => {
    setHtmlBlocks({
      html_block_1: settings.html_block_1 || "",
      html_block_2: settings.html_block_2 || "",
      html_block_3: settings.html_block_3 || "",
      html_block_4: settings.html_block_4 || "",
      html_block_5: settings.html_block_5 || "",
    });
  }, []); // Empty dependency array means this only runs on mount

  // Scroll to the selected HTML block if one is specified
  useEffect(() => {
    if (selectedSetting && selectedSetting.startsWith("html_block_")) {
      const blockNumber = selectedSetting.split("_")[2];
      const element = document.getElementById(`html-block-${blockNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedSetting]);

  // Use a ref to track debounce timers per field
  const updateTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const handleUpdate = (field: string, value: string) => {
    // Always update local state immediately for responsive typing
    setHtmlBlocks((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear any existing timer for this field
    if (updateTimers.current[field]) {
      clearTimeout(updateTimers.current[field]);
    }

    // Set a new timer for this field - debounce the iframe updates
    updateTimers.current[field] = setTimeout(() => {
      // Create a settings update with just this field
      // Ensure we're sending a string, not an object
      const newSettings = { [field]: String(value) };

      // Send update to iframe via contentRef or direct querySelector
      try {
        // Try contentRef first
        if (contentRef?.current?.contentWindow) {
          contentRef.current.contentWindow.postMessage(
            {
              type: "UPDATE_HEADER_SETTINGS",
              settings: newSettings,
            },
            "*"
          );
        } else {
          // Fall back to direct querySelector
          const iframe = document.querySelector("iframe");
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: "UPDATE_HEADER_SETTINGS",
                settings: newSettings,
              },
              "*"
            );
          }
        }

        // Update parent component
        if (onUpdateSettings) {
          const updatedSettings = { ...settings };
          updatedSettings[field] = value;
          onUpdateSettings(updatedSettings);
        }
      } catch (error) {
        console.error("Error updating HTML content:", error);
      }
    }, 500); // Debounce time in ms
  };

  const renderHtmlBlock = (number: number) => {
    const field = `html_block_${number}` as keyof typeof htmlBlocks;
    const isSelected = selectedSetting === field;

    return (
      <div
        key={`html-block-${number}-${field}`} // Update the key to ensure uniqueness
        className={`space-y-6 ${isSelected ? "bg-blue-50 p-2 rounded-md" : ""}`}
        id={`html-block-${number}`}
      >
        <SettingSection
          title={`HTML Block ${number}`}
          description={`Add custom HTML content to block ${number}`}
        >
          <div className="space-y-2">
            <Label>HTML Content</Label>
            <Textarea
              value={htmlBlocks[field] || ""}
              onChange={(e) => {
                const newValue = e.target.value;
                handleUpdate(field, newValue);
              }}
              placeholder="Enter HTML content here..."
              rows={6}
              className={`font-mono text-sm resize-y min-h-[100px] ${
                isSelected ? "border-blue-500 ring-2 ring-blue-200" : ""
              }`}
            />
          </div>
        </SettingSection>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((number) => renderHtmlBlock(number))}
    </div>
  );
}
