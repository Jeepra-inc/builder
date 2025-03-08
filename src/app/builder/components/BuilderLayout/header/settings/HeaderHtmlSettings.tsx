// HeaderHtmlSettings.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useDrawerEscapeOutsideClick } from "@/app/builder/hooks/useDrawerEscapeOutsideClick";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DOMPurify from "dompurify";

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
      // Sanitize the HTML content before sending it to the iframe
      const sanitizedValue = DOMPurify.sanitize(value);

      // Create a settings update with just this field
      const newSettings = { [field]: sanitizedValue };

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
          updatedSettings[field] = sanitizedValue;
          onUpdateSettings(updatedSettings);
        }
      } catch (error) {
        console.error("Error updating HTML content:", error);
      }
    }, 500); // Debounce time in ms
  };

  const toggleDrawer = useCallback((blockNumber: number | null) => {
    setExpandedBlock(blockNumber);
  }, []);

  // Use our custom hook for Escape key and outside click
  useDrawerEscapeOutsideClick(
    expandedBlock !== null,
    () => toggleDrawer(null),
    ".html-drawer-container"
  );

  // Render a drawer for expanded HTML block editing
  const renderDrawer = (number: number) => {
    const field = `html_block_${number}` as keyof typeof htmlBlocks;

    return (
      <div className="fixed z-[100] top-0 left-0 h-full w-1/2 bg-white shadow-2xl border-r border-gray-200 overflow-hidden flex flex-col html-drawer-container">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            HTML {number} Editor
          </h3>
          <div className="flex gap-1 items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6"
                    disabled
                  >
                    esc
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press ESC to close</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleDrawer(null)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize Editor</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1 p-3 overflow-hidden">
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
        className={` ${isSelected ? "bg-blue-50" : ""}`}
        id={`html-block-${number}`}
      >
        <SettingSection
          title={`HTML ${number}`}
          description={`Add custom HTML`}
        >
          <div className="space-y-2 relative">
            <div className="absolute top-0 right-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDrawer(number)}
                      className="flex items-center gap-1 text-xs w-6 h-6 text-zinc-500"
                    >
                      <Maximize2 width={5} height={5} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Expand Editor</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Label className="sr-only">HTML Content</Label>
            <Textarea
              value={htmlBlocks[field] || ""}
              onChange={(e) => {
                const newValue = e.target.value;
                handleUpdate(field, newValue);
              }}
              placeholder="Enter HTML content here..."
              rows={6}
              className={`font-mono text-sm resize-y min-h-[100px] ${
                isSelected ? "" : ""
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
  return <div>{[1, 2, 3, 4, 5].map((number) => renderHtmlBlock(number))}</div>;
}
