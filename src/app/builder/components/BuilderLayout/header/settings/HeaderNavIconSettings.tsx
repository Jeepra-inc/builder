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
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlignLeft,
  AlignRight,
  Menu,
  ChevronRight,
  MoreHorizontal,
  AlignVerticalJustifyCenter,
} from "lucide-react";

interface HeaderNavIconSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
  selectedSetting?: string | undefined;
}

// Define interface for nav icon settings
interface NavIconSettings {
  show: boolean;
  type: string; // hamburger, dots, chevron, etc.
  showText: boolean;
  text: string;
  position: string; // left, right
  drawerEffect: string; // slide, fade, push
  drawerDirection: string; // left, right, top
  iconSize: string;
  iconColor?: string;
  textColor?: string;
}

export function HeaderNavIconSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
  selectedSetting,
}: HeaderNavIconSettingsProps) {
  // Track local state for the nav icon settings
  const [localNavIconSettings, setLocalNavIconSettings] =
    useState<NavIconSettings>({
      show: true,
      type: "hamburger",
      showText: true,
      text: "Menu",
      position: "right",
      drawerEffect: "slide",
      drawerDirection: "left",
      iconSize: "24px",
      iconColor: "#333333",
      textColor: "#333333",
      ...(settings.navIcon || {}),
    });

  // Update local state when settings change
  useEffect(() => {
    if (settings.navIcon) {
      setLocalNavIconSettings((prev) => ({
        ...prev,
        ...settings.navIcon,
      }));
    }
  }, [settings.navIcon]);

  // Try to find an iframe as fallback
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

    // If still not found, look for any iframe in the DOM
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

  // Function to update a setting and propagate to iframe
  const updateSetting = (key: keyof NavIconSettings, value: any) => {
    console.log(`NAV ICON: Updating [${key}] to:`, value);

    // Update local state
    setLocalNavIconSettings((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      // Update parent component if callback exists
      if (onUpdateSettings) {
        onUpdateSettings({
          navIcon: updated,
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
          console.log("NAV ICON: Using fallback iframe for sending messages");
          targetWindow = fallbackIframe.contentWindow;
        } else {
          console.error("NAV ICON: No valid iframe found to send settings");
        }
      }

      // If we have a target window, send the messages
      if (targetWindow) {
        try {
          // Send a message with the specific change
          const message = {
            type: "UPDATE_HEADER_SETTINGS",
            settings: {
              navIcon: updated,
            },
            timestamp: Date.now(),
            headers: {
              "Content-Type": "application/json",
              "X-Builder-Source": "HeaderNavIconSettings",
            },
          };

          console.log("NAV ICON: Sending update to iframe");
          targetWindow.postMessage(message, "*");
        } catch (error) {
          console.error(
            "ERROR: Failed to send nav icon settings to iframe:",
            error
          );
        }
      }

      return updated;
    });
  };

  // Define icon type options
  const iconTypes = [
    {
      id: "hamburger",
      name: "Hamburger",
      description: "Classic three-line menu icon",
      icon: <Menu className="h-5 w-5" />,
    },
    {
      id: "chevron",
      name: "Chevron",
      description: "Simple right-pointing arrow",
      icon: <ChevronRight className="h-5 w-5" />,
    },
    {
      id: "dots",
      name: "Dots",
      description: "Three horizontal dots",
      icon: <MoreHorizontal className="h-5 w-5" />,
    },
    {
      id: "justify",
      name: "Justify",
      description: "Four horizontal lines",
      icon: <AlignVerticalJustifyCenter className="h-5 w-5" />,
    },
  ];

  // Define drawer effect options
  const drawerEffects = [
    {
      id: "slide",
      name: "Slide",
      description: "Menu slides in from the edge",
    },
    {
      id: "fade",
      name: "Fade",
      description: "Menu fades in with transparency",
    },
    {
      id: "push",
      name: "Push",
      description: "Menu pushes the content aside",
    },
    {
      id: "reveal",
      name: "Reveal",
      description: "Content moves to reveal menu underneath",
    },
  ];

  // NavIcon preview component
  const NavIconPreview = ({ settings }: { settings: NavIconSettings }) => {
    // Find the selected icon component
    const selectedIcon = iconTypes.find((icon) => icon.id === settings.type)
      ?.icon || <Menu className="h-5 w-5" />;

    return (
      <div className="mt-4 p-4 bg-slate-100 rounded-md">
        <h4 className="font-medium mb-2 text-sm">Preview</h4>
        <div
          className="flex items-center gap-2 p-2 border rounded-md w-fit"
          style={{
            flexDirection: settings.position === "left" ? "row" : "row-reverse",
          }}
        >
          <div style={{ color: settings.iconColor }}>{selectedIcon}</div>
          {settings.showText && (
            <span style={{ color: settings.textColor }}>{settings.text}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SettingSection title="Navigation Icon">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showNavIcon" className="flex-1">
              Show Navigation Icon
            </Label>
            <Switch
              id="showNavIcon"
              checked={localNavIconSettings.show}
              onCheckedChange={(checked) => updateSetting("show", checked)}
            />
          </div>

          {localNavIconSettings.show && (
            <>
              <div className="space-y-2">
                <Label>Icon Type</Label>
                <RadioGroup
                  value={localNavIconSettings.type}
                  onValueChange={(value) => updateSetting("type", value)}
                  className="grid grid-cols-2 gap-2 mt-2"
                >
                  {iconTypes.map((icon) => (
                    <div key={icon.id} className="flex items-start space-x-2">
                      <RadioGroupItem value={icon.id} id={`icon-${icon.id}`} />
                      <Label
                        htmlFor={`icon-${icon.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {icon.icon}
                        <span>{icon.name}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showNavText" className="flex-1">
                    Show Text
                  </Label>
                  <Switch
                    id="showNavText"
                    checked={localNavIconSettings.showText}
                    onCheckedChange={(checked) =>
                      updateSetting("showText", checked)
                    }
                  />
                </div>

                {localNavIconSettings.showText && (
                  <div className="mt-2">
                    <Label htmlFor="navText">Menu Text</Label>
                    <Input
                      id="navText"
                      value={localNavIconSettings.text}
                      onChange={(e) => updateSetting("text", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`p-2 rounded-md ${
                            localNavIconSettings.position === "left"
                              ? "bg-blue-100 border-blue-300 border"
                              : "bg-gray-100"
                          }`}
                          onClick={() => updateSetting("position", "left")}
                        >
                          <AlignLeft className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Left</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`p-2 rounded-md ${
                            localNavIconSettings.position === "right"
                              ? "bg-blue-100 border-blue-300 border"
                              : "bg-gray-100"
                          }`}
                          onClick={() => updateSetting("position", "right")}
                        >
                          <AlignRight className="h-5 w-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Right</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawerEffect">Drawer Effect</Label>
                <Select
                  value={localNavIconSettings.drawerEffect}
                  onValueChange={(value) =>
                    updateSetting("drawerEffect", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select effect" />
                  </SelectTrigger>
                  <SelectContent>
                    {drawerEffects.map((effect) => (
                      <SelectItem key={effect.id} value={effect.id}>
                        {effect.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawerDirection">Drawer Direction</Label>
                <Select
                  value={localNavIconSettings.drawerDirection}
                  onValueChange={(value) =>
                    updateSetting("drawerDirection", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iconColor">Icon Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localNavIconSettings.iconColor || "#333333"}
                    onChange={(e) => updateSetting("iconColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="iconColor"
                    value={localNavIconSettings.iconColor || "#333333"}
                    onChange={(e) => updateSetting("iconColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {localNavIconSettings.showText && (
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localNavIconSettings.textColor || "#333333"}
                      onChange={(e) =>
                        updateSetting("textColor", e.target.value)
                      }
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      id="textColor"
                      value={localNavIconSettings.textColor || "#333333"}
                      onChange={(e) =>
                        updateSetting("textColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="iconSize">Icon Size</Label>
                <Select
                  value={localNavIconSettings.iconSize}
                  onValueChange={(value) => updateSetting("iconSize", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16px">Small (16px)</SelectItem>
                    <SelectItem value="24px">Medium (24px)</SelectItem>
                    <SelectItem value="32px">Large (32px)</SelectItem>
                    <SelectItem value="40px">Extra Large (40px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <NavIconPreview settings={localNavIconSettings} />
            </>
          )}
        </div>
      </SettingSection>
    </div>
  );
}
