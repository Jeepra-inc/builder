"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Settings, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HeaderSearchSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
}

// Define interface for search settings
interface SearchSettings {
  show: boolean;
  type: string;
  placeholder?: string;
  rounded?: number;
  showText: boolean;
  behavior: string;
  design: string;
  style?: string;
  shape?: string;
  showIcon?: boolean;
  iconPosition?: string;
  iconColor?: string;
  iconSize?: string;
  fontSize?: string;
  textColor?: string;
  width?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
}

export function HeaderSearchSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
}: HeaderSearchSettingsProps) {
  // Track local state for the search settings
  const [localSearchSettings, setLocalSearchSettings] =
    useState<SearchSettings>({
      show: true,
      type: "form",
      placeholder: "Search...",
      rounded: 4,
      showText: true,
      behavior: "inline",
      design: "standard",
      style: "minimal",
      shape: "rounded",
      showIcon: true,
      iconPosition: "left",
      iconColor: "#666666",
      iconSize: "16px",
      fontSize: "14px",
      textColor: "#333333",
      width: "250px",
      showButton: false,
      buttonText: "Search",
      buttonColor: "#4a90e2",
      buttonTextColor: "#ffffff",
      ...(settings.search || {}),
    });

  // Update local state when settings change
  useEffect(() => {
    if (settings.search) {
      setLocalSearchSettings((prev) => ({
        ...prev,
        ...settings.search,
      }));
    }
  }, [settings.search]);

  // Also map design to style for compatibility
  useEffect(() => {
    if (localSearchSettings.design && !localSearchSettings.style) {
      const designToStyle: Record<string, string> = {
        standard: "standard",
        minimal: "minimal",
        bordered: "bordered",
        rounded: "rounded",
        underlined: "underlined",
      };

      setLocalSearchSettings((prev) => ({
        ...prev,
        style: designToStyle[prev.design] || "minimal",
      }));
    }
  }, [localSearchSettings.design]);

  // Add a direct method to ensure iframe communication works
  useEffect(() => {
    // Send a test message to verify communication with iframe
    const sendTestMessage = () => {
      if (!contentRef) {
        console.warn(
          "TEST: contentRef prop not provided to HeaderSearchSettings"
        );
        return;
      }

      if (!contentRef.current) {
        console.warn(
          "TEST: Content iframe reference exists but is null or not initialized yet"
        );
        // Set up a delay to try again after iframe might be loaded
        setTimeout(() => {
          if (contentRef.current) {
            console.log("TEST: Retrying iframe communication after delay");
            attemptSendMessage();
          } else {
            console.error(
              "TEST: Content iframe reference is still not available after delay"
            );
          }
        }, 2000); // Try again in 2 seconds
        return;
      }

      attemptSendMessage();
    };

    // Extract the actual message sending logic to a separate function
    const attemptSendMessage = () => {
      if (!contentRef?.current?.contentWindow) {
        console.error(
          "TEST: Content iframe reference exists but contentWindow is not accessible"
        );

        // Try to find iframe manually as fallback
        const iframe = document.querySelector("iframe");
        if (iframe?.contentWindow) {
          console.log(
            "TEST: Found iframe via DOM query, attempting to use it instead"
          );
          try {
            sendMessageToIframe(iframe.contentWindow);
            return;
          } catch (err) {
            console.error("TEST: Failed to use fallback iframe:", err);
          }
        }
        return;
      }

      try {
        sendMessageToIframe(contentRef.current.contentWindow);
      } catch (error) {
        console.error("TEST: Error sending test message to iframe:", error);
      }
    };

    // Extracted function to send the actual message
    const sendMessageToIframe = (targetWindow: Window) => {
      try {
        // Get iframe's src to determine proper origin
        const iframeSrc = contentRef?.current?.src;
        const targetOrigin = "*"; // Use "*" for testing, since we're having issues

        console.log(
          "TEST: Sending test message to iframe with targetOrigin:",
          targetOrigin
        );

        // Set content-type and other headers in the message data itself
        targetWindow.postMessage(
          {
            type: "TEST_IFRAME_COMMUNICATION",
            timestamp: Date.now(),
            headers: {
              "Content-Type": "application/json",
              "X-Builder-Source": "HeaderSearchSettings",
            },
          },
          targetOrigin
        );

        console.log("TEST: Successfully sent test message to iframe");
      } catch (error) {
        console.error("TEST: Final error sending message:", error);
      }
    };

    // Send test message when component mounts
    sendTestMessage();

    // Also try to pre-load search settings to ensure they're set in iframe
    setTimeout(() => {
      if (!contentRef?.current?.contentWindow) {
        console.warn(
          "TEST: Cannot send initial settings - iframe not available"
        );
        return;
      }

      if (localSearchSettings) {
        console.log(
          "TEST: Sending initial search settings to iframe:",
          localSearchSettings
        );

        try {
          // Use "*" as targetOrigin for now to fix communication issues
          contentRef.current.contentWindow.postMessage(
            {
              type: "INITIALIZE_SEARCH_SETTINGS",
              settings: localSearchSettings,
              timestamp: Date.now(),
              headers: {
                "Content-Type": "application/json",
                "X-Builder-Source": "HeaderSearchSettings",
              },
            },
            "*" // Use "*" instead of specific origin to troubleshoot
          );
        } catch (error) {
          console.error(
            "ERROR: Failed to send initial settings to iframe:",
            error
          );
        }
      }
    }, 2000); // Increased to 2 seconds to ensure iframe is fully loaded

    // Add a listener to check if messages are being received back from the iframe
    const handleResponseFromIframe = (event: MessageEvent) => {
      // Make sure the message is from our iframe
      if (
        contentRef?.current &&
        event.source === contentRef.current.contentWindow
      ) {
        console.log("RECEIVED response from iframe:", event.data);

        if (event.data.type === "SEARCH_SETTINGS_RECEIVED") {
          console.log("✅ Search settings successfully received by iframe!");
        } else if (event.data.type === "SCRIPT_EXECUTION_COMPLETE") {
          console.log("✅ Script execution completed successfully in iframe");
        } else if (event.data.type === "SCRIPT_EXECUTION_ERROR") {
          console.error(
            "❌ Script execution failed in iframe:",
            event.data.error
          );
        }
      }
    };

    window.addEventListener("message", handleResponseFromIframe);
    return () => {
      window.removeEventListener("message", handleResponseFromIframe);
    };
  }, []);

  // Define the search design options
  const searchDesigns = [
    {
      id: "standard",
      name: "Standard",
      description: "Classic search with text and icon",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean, borderless design with subtle hover effect",
    },
    {
      id: "bordered",
      name: "Bordered",
      description: "Fully bordered search with prominent outline",
    },
    {
      id: "rounded",
      name: "Rounded",
      description: "Pill-shaped search with rounded ends",
    },
    {
      id: "underlined",
      name: "Underlined",
      description: "Underlined search with focus animation",
    },
  ];

  // Enhance the updateSetting function with a simpler direct approach
  const updateSetting = (key: keyof SearchSettings, value: any) => {
    // First log the attempt to update setting
    console.log(`ACTION: Updating search setting [${key}] to:`, value);

    // Update local state first
    setLocalSearchSettings((prev) => {
      // Create updated settings object
      const updated = {
        ...prev,
        [key]: value,
      };

      console.log("ACTION: Updated local search settings:", updated);

      // Update parent component if callback exists
      if (onUpdateSettings) {
        onUpdateSettings({
          search: updated,
        });
      }

      // Find valid iframe to send message to
      let targetWindow: Window | null = null;

      // Try contentRef first
      if (contentRef?.current?.contentWindow) {
        targetWindow = contentRef.current.contentWindow;
      } else {
        // Fall back to DOM query
        const fallbackIframe = tryGetIframeAsFallback();
        if (fallbackIframe?.contentWindow) {
          console.log("ACTION: Using fallback iframe for sending messages");
          targetWindow = fallbackIframe.contentWindow;
        } else {
          console.error("ACTION: No valid iframe found to send settings");
        }
      }

      // If we have a target window, send the messages
      if (targetWindow) {
        try {
          // Send a simplified direct message with the specific change
          const directMessage = {
            type: "DIRECT_SEARCH_SETTING_UPDATE",
            key: key,
            value: value,
            timestamp: Date.now(),
            headers: {
              "Content-Type": "application/json",
              "X-Builder-Source": "HeaderSearchSettings",
            },
          };

          console.log(
            "ACTION: Sending direct message to iframe:",
            directMessage
          );
          targetWindow.postMessage(directMessage, "*");

          // Also send full settings update for context
          const fullMessage = {
            type: "FULL_SEARCH_SETTINGS_UPDATE",
            settings: updated,
            timestamp: Date.now(),
            headers: {
              "Content-Type": "application/json",
              "X-Builder-Source": "HeaderSearchSettings",
            },
          };

          console.log("ACTION: Sending full settings to iframe");
          targetWindow.postMessage(fullMessage, "*");
        } catch (error) {
          console.error("ERROR: Failed to send message to iframe:", error);
        }
      } else {
        console.error("ERROR: Cannot access any iframe contentWindow!");
      }

      return updated;
    });
  };

  // Improved search preview component
  const SearchPreview = ({ settings }: { settings: any }) => {
    // Use design for preview display
    const design = settings.design || "standard";

    // Get style classes based on settings
    let styleClasses = "";
    switch (design) {
      case "minimal":
        styleClasses = "border-0 bg-gray-50 hover:bg-gray-100";
        break;
      case "bordered":
        styleClasses = "border-2 border-gray-300";
        break;
      case "rounded":
        styleClasses = "rounded-full px-4";
        break;
      case "underlined":
        styleClasses = "border-0 border-b-2 border-gray-300 rounded-none";
        break;
      default: // standard
        styleClasses = "border border-gray-300";
    }

    const borderRadius =
      settings.rounded !== undefined ? `${settings.rounded}px` : "4px";

    const placeholder =
      settings.showText !== false ? settings.placeholder || "Search..." : "";

    const iconColor = settings.iconColor || "#666666";
    const iconSize = settings.iconSize ? parseInt(settings.iconSize) : 16;

    if (settings.type === "icon") {
      return (
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-slate-200">
          <Search size={iconSize} color={iconColor} />
        </div>
      );
    } else {
      return (
        <div
          className={`flex items-center ${styleClasses} bg-white overflow-hidden`}
          style={{
            borderRadius: design === "rounded" ? "9999px" : borderRadius,
            width: settings.width || "200px",
          }}
        >
          {settings.showIcon && settings.iconPosition === "left" && (
            <div className="px-2">
              <Search size={iconSize} color={iconColor} />
            </div>
          )}

          <input
            type="text"
            placeholder={placeholder}
            className="px-3 py-1.5 w-full text-sm focus:outline-none bg-transparent"
            style={{
              fontSize: settings.fontSize || "14px",
              color: settings.textColor || "#333333",
            }}
            readOnly
          />

          {settings.showIcon && settings.iconPosition === "right" && (
            <div className="px-2">
              <Search size={iconSize} color={iconColor} />
            </div>
          )}

          {settings.showButton && (
            <button
              className="px-3 py-1 mx-1 rounded text-sm"
              style={{
                backgroundColor: settings.buttonColor || "#4a90e2",
                color: settings.buttonTextColor || "#ffffff",
              }}
            >
              {settings.buttonText || "Search"}
            </button>
          )}
        </div>
      );
    }
  };

  // Add a delayed fallback for direct DOM access as a last resort
  const tryGetIframeAsFallback = () => {
    // Try document.querySelector first
    let iframe = document.querySelector("iframe");

    // If not found, try getting it from the parent document
    if (!iframe && window.parent && window.parent.document) {
      try {
        iframe = window.parent.document.querySelector("iframe");
      } catch (error) {
        console.error("Failed to access parent document:", error);
      }
    }

    // If still not found, look for any iframe in the DOM using a more exhaustive search
    if (!iframe) {
      const allIframes = document.querySelectorAll("iframe");
      if (allIframes.length > 0) {
        iframe = allIframes[0]; // Use the first one found
        console.log(
          `Found ${allIframes.length} iframes, using the first one as fallback`
        );
      }
    }

    return iframe;
  };

  // Update the updateSearchComponentsDirectly function to use the fallback
  const updateSearchComponentsDirectly = (newType: string) => {
    console.log(
      `DIRECT UPDATE: Attempting to update search type to ${newType}`
    );

    // Safety check for contentRef
    if (!contentRef) {
      console.error("DIRECT UPDATE: contentRef not provided to component");

      // Try to find an iframe as fallback
      const iframe = tryGetIframeAsFallback();
      if (!iframe) {
        console.error(
          "DIRECT UPDATE: No iframe found anywhere in the document"
        );
        return;
      }

      if (!iframe.contentWindow) {
        console.error(
          "DIRECT UPDATE: Found iframe but cannot access contentWindow"
        );
        return;
      }

      console.log("DIRECT UPDATE: Using iframe found in document tree");
      sendUpdateScript(iframe.contentWindow, newType);
      return;
    }

    if (!contentRef.current) {
      console.error("DIRECT UPDATE: contentRef.current is null");

      // Try to find an iframe as fallback
      const iframe = tryGetIframeAsFallback();
      if (!iframe) {
        console.error("DIRECT UPDATE: No iframe found in document");
        return;
      }

      // Use found iframe
      if (!iframe.contentWindow) {
        console.error(
          "DIRECT UPDATE: Found iframe but cannot access contentWindow"
        );
        return;
      }

      console.log("DIRECT UPDATE: Using iframe found in document");
      sendUpdateScript(iframe.contentWindow, newType);
      return;
    }

    if (!contentRef.current.contentWindow) {
      console.error("DIRECT UPDATE: Cannot access iframe window");

      // Try document.querySelector as fallback
      const iframe = tryGetIframeAsFallback();
      if (iframe?.contentWindow) {
        console.log("DIRECT UPDATE: Using fallback iframe");
        sendUpdateScript(iframe.contentWindow, newType);
        return;
      }

      return;
    }

    sendUpdateScript(contentRef.current.contentWindow, newType);
  };

  // Extract the script sending logic
  const sendUpdateScript = (targetWindow: Window, newType: string) => {
    // Generate the script - using string concatenation instead of template literals
    // for the variables that need to be interpolated in the executed script
    const script = `
      try {
        // Find all search components
        const searchComponents = document.querySelectorAll('[data-item-id="search"]');
        
        if (searchComponents.length > 0) {
          console.log("IFRAME DIRECT: Found " + searchComponents.length + " search components to update");
          
          // Update each component
          searchComponents.forEach(comp => {
            if (comp instanceof HTMLElement) {
              console.log("IFRAME DIRECT: Updating component to type: '${newType}'");
              
              // Update data attribute
              comp.setAttribute('data-search-type', '${newType}');
              
              // Add a highlight
              comp.style.outline = '3px solid red';
              
              // Show what type was set
              const typeIndicator = document.createElement('div');
              typeIndicator.textContent = 'Type: ${newType}';
              typeIndicator.style.position = 'absolute';
              typeIndicator.style.top = '0';
              typeIndicator.style.left = '0';
              typeIndicator.style.background = 'red';
              typeIndicator.style.color = 'white';
              typeIndicator.style.padding = '2px 5px';
              typeIndicator.style.zIndex = '1000';
              typeIndicator.style.fontSize = '10px';
              
              // Add the indicator
              comp.style.position = 'relative';
              comp.appendChild(typeIndicator);
              
              console.log("IFRAME DIRECT: Updated component type to '${newType}'");
            }
          });
        }
      } catch(err) {
        console.error("IFRAME DIRECT ERROR:", err);
      }
    `;

    // Create special message to execute script in iframe
    try {
      targetWindow.postMessage(
        {
          type: "EXECUTE_DIRECT_SCRIPT",
          script: script,
          timestamp: Date.now(),
          headers: {
            "Content-Type": "application/json",
            "X-Builder-Source": "HeaderSearchSettings",
          },
        },
        "*"
      );
      console.log("DIRECT UPDATE: Successfully sent script to iframe");
    } catch (error) {
      console.error("DIRECT UPDATE: Error sending script to iframe:", error);
    }
  };

  // Add button to trigger direct update
  const TypeUpdateButton = ({ type }: { type: string }) => (
    <button
      className="px-3 py-1 mt-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
      onClick={() => updateSearchComponentsDirectly(type)}
    >
      Force Type = {type}
    </button>
  );

  return (
    <div className="space-y-6">
      <SettingSection
        title="Search Visibility"
        description="Configure search display settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-search">Show Search</Label>
            <Switch
              id="show-search"
              checked={localSearchSettings.show}
              onCheckedChange={(checked) => updateSetting("show", checked)}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Search Appearance"
        description="Configure how the search appears in the header"
      >
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="icon">Icon</TabsTrigger>
            <TabsTrigger value="button">Button</TabsTrigger>
          </TabsList>

          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Display Type</Label>
                <Select
                  value={localSearchSettings.type || "form"}
                  onValueChange={(value) => updateSetting("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select search type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icon">Icon Only</SelectItem>
                    <SelectItem value="form">Search Bar</SelectItem>
                    <SelectItem value="expandable">
                      Expandable Search
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {localSearchSettings.type === "icon"
                    ? "Shows only a search icon"
                    : localSearchSettings.type === "form"
                    ? "Always shows the full search bar"
                    : "Shows an icon that expands to a search bar on click"}
                </p>
                <div className="flex gap-2 mt-2">
                  <TypeUpdateButton type="icon" />
                  <TypeUpdateButton type="form" />
                  <TypeUpdateButton type="expandable" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Search Behavior</Label>
                <Select
                  value={localSearchSettings.behavior || "inline"}
                  onValueChange={(value) => updateSetting("behavior", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select behavior" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline Search</SelectItem>
                    <SelectItem value="popout">Popout Search</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {localSearchSettings.behavior === "inline"
                    ? "Search results appear below the search bar"
                    : "Search opens in a dropdown or modal overlay"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Search Width</Label>
                <Select
                  value={localSearchSettings.width || "250px"}
                  onValueChange={(value) => updateSetting("width", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select width" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150px">Narrow (150px)</SelectItem>
                    <SelectItem value="200px">Small (200px)</SelectItem>
                    <SelectItem value="250px">Medium (250px)</SelectItem>
                    <SelectItem value="300px">Large (300px)</SelectItem>
                    <SelectItem value="350px">Wide (350px)</SelectItem>
                    <SelectItem value="100%">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-text">Show Placeholder Text</Label>
                <Switch
                  id="show-text"
                  checked={localSearchSettings.showText !== false}
                  onCheckedChange={(checked) =>
                    updateSetting("showText", checked)
                  }
                />
              </div>

              {localSearchSettings.showText !== false && (
                <div className="space-y-2">
                  <Label>Placeholder Text</Label>
                  <Input
                    value={localSearchSettings.placeholder || "Search..."}
                    onChange={(e) =>
                      updateSetting("placeholder", e.target.value)
                    }
                    placeholder="Search..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Text shown inside the search input when empty
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localSearchSettings.textColor || "#333333"}
                    onChange={(e) => updateSetting("textColor", e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    type="text"
                    value={localSearchSettings.textColor || "#333333"}
                    onChange={(e) => updateSetting("textColor", e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={localSearchSettings.fontSize || "14px"}
                  onValueChange={(value) => updateSetting("fontSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">Small (12px)</SelectItem>
                    <SelectItem value="14px">Medium (14px)</SelectItem>
                    <SelectItem value="16px">Large (16px)</SelectItem>
                    <SelectItem value="18px">X-Large (18px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Radius</Label>
                  <span className="text-sm font-medium">
                    {localSearchSettings.rounded || 4}px
                  </span>
                </div>
                <div
                  className="relative w-full h-5 flex items-center cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const width = rect.width;
                    const offsetX = e.clientX - rect.left;
                    const percentage = Math.min(
                      Math.max(offsetX / width, 0),
                      1
                    );
                    const value = Math.round(percentage * 20); // Map to 0-20 range
                    updateSetting("rounded", value);
                  }}
                >
                  <div className="absolute w-full h-1 bg-gray-200 rounded-full"></div>
                  <div
                    className="absolute h-1 bg-blue-500 rounded-full"
                    style={{
                      width: `${(localSearchSettings.rounded || 4) * 5}%`,
                    }} // 0-20 range -> 0-100%
                  ></div>
                  <div
                    className="absolute w-4 h-4 bg-blue-500 rounded-full shadow transform -translate-x-1/2"
                    style={{
                      left: `${(localSearchSettings.rounded || 4) * 5}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0px</span>
                  <span>10px</span>
                  <span>20px</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Search Design</Label>
                <div className="grid grid-cols-1 gap-3">
                  <RadioGroup
                    value={localSearchSettings.design || "standard"}
                    onValueChange={(value) => updateSetting("design", value)}
                    className="gap-2"
                  >
                    {searchDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="flex items-start space-x-2"
                      >
                        <RadioGroupItem
                          value={design.id}
                          id={`design-${design.id}`}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`design-${design.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {design.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {design.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="icon" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-icon">Show Search Icon</Label>
                <Switch
                  id="show-icon"
                  checked={localSearchSettings.showIcon !== false}
                  onCheckedChange={(checked) =>
                    updateSetting("showIcon", checked)
                  }
                />
              </div>

              {localSearchSettings.showIcon !== false && (
                <>
                  <div className="space-y-2">
                    <Label>Icon Position</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          localSearchSettings.iconPosition === "left"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => updateSetting("iconPosition", "left")}
                        className="flex-1"
                      >
                        Left
                      </Button>
                      <Button
                        type="button"
                        variant={
                          localSearchSettings.iconPosition === "right"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => updateSetting("iconPosition", "right")}
                        className="flex-1"
                      >
                        Right
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localSearchSettings.iconColor || "#666666"}
                        onChange={(e) =>
                          updateSetting("iconColor", e.target.value)
                        }
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        type="text"
                        value={localSearchSettings.iconColor || "#666666"}
                        onChange={(e) =>
                          updateSetting("iconColor", e.target.value)
                        }
                        className="flex-grow"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Icon Size</Label>
                    <Select
                      value={localSearchSettings.iconSize || "16px"}
                      onValueChange={(value) =>
                        updateSetting("iconSize", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select icon size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12px">Small (12px)</SelectItem>
                        <SelectItem value="16px">Medium (16px)</SelectItem>
                        <SelectItem value="20px">Large (20px)</SelectItem>
                        <SelectItem value="24px">X-Large (24px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="button" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-button">Show Search Button</Label>
                <Switch
                  id="show-button"
                  checked={localSearchSettings.showButton === true}
                  onCheckedChange={(checked) =>
                    updateSetting("showButton", checked)
                  }
                />
              </div>

              {localSearchSettings.showButton === true && (
                <>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={localSearchSettings.buttonText || "Search"}
                      onChange={(e) =>
                        updateSetting("buttonText", e.target.value)
                      }
                      placeholder="Search"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localSearchSettings.buttonColor || "#4a90e2"}
                        onChange={(e) =>
                          updateSetting("buttonColor", e.target.value)
                        }
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        type="text"
                        value={localSearchSettings.buttonColor || "#4a90e2"}
                        onChange={(e) =>
                          updateSetting("buttonColor", e.target.value)
                        }
                        className="flex-grow"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Button Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={localSearchSettings.buttonTextColor || "#ffffff"}
                        onChange={(e) =>
                          updateSetting("buttonTextColor", e.target.value)
                        }
                        className="w-12 h-8 p-1"
                      />
                      <Input
                        type="text"
                        value={localSearchSettings.buttonTextColor || "#ffffff"}
                        onChange={(e) =>
                          updateSetting("buttonTextColor", e.target.value)
                        }
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SettingSection>

      <SettingSection
        title="Search Preview"
        description="See how your search will appear"
      >
        <div className="p-4 border rounded-md bg-slate-50 flex justify-center">
          <SearchPreview settings={localSearchSettings} />
        </div>
      </SettingSection>
    </div>
  );
}
