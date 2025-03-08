// HeaderHtmlSettings.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, X } from "lucide-react";
import Editor from "@monaco-editor/react";

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
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

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

  const toggleDrawer = (blockNumber: number | null) => {
    setExpandedBlock(blockNumber);
  };

  // Render a drawer for expanded HTML block editing
  const renderDrawer = (number: number) => {
    const field = `html_block_${number}` as keyof typeof htmlBlocks;

    return (
      <div className="fixed top-0 left-0 h-full w-1/2 bg-white z-50 shadow-2xl border-r border-gray-200 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            HTML Block {number} Editor
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleDrawer(null)}
              title="Minimize editor"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleDrawer(null)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={htmlBlocks[field]}
            onChange={(value) => handleUpdate(field, value || "")}
            theme="Dawn"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineHeight: 20,
              padding: { top: 8, bottom: 8 },
              scrollBeyondLastLine: false,
              folding: true,
              lineNumbers: "on",
              glyphMargin: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>
    );
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
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleDrawer(number)}
                className="flex items-center gap-1 text-xs mb-2"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Expand Editor
              </Button>
            </div>
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

  // If we have an expanded block, render it in a drawer
  if (expandedBlock !== null) {
    return renderDrawer(expandedBlock);
  }

  // Otherwise render all blocks normally
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((number) => renderHtmlBlock(number))}
    </div>
  );
}
