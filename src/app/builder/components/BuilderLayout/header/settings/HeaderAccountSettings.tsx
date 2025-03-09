"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface HeaderAccountSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
}

export function HeaderAccountSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
}: HeaderAccountSettingsProps) {
  // Add state to handle radio button selection
  const [selectedStyle, setSelectedStyle] = useState<string>(
    settings.account?.style || "default"
  );

  // Add state to handle icon style selection
  const [selectedIconStyle, setSelectedIconStyle] = useState<string>(
    settings.account?.iconStyle || "default"
  );

  // Add state to handle icon size selection
  const [selectedIconSize, setSelectedIconSize] = useState<string>(
    settings.account?.iconSize || "medium"
  );

  // Add state for icon visibility
  const [showIcon, setShowIcon] = useState<boolean>(
    settings.account?.showIcon !== false
  );

  // Add state for text visibility
  const [showText, setShowText] = useState<boolean>(
    settings.account?.showText !== false
  );

  // Add state for dropdown
  const [dropdownEnabled, setDropdownEnabled] = useState<boolean>(
    settings.account?.dropdownEnabled !== false
  );

  const handleUpdate = (field: string, value: any) => {
    // Update local state based on which field is being changed
    if (field === "account.showIcon") {
      setShowIcon(value);
    } else if (field === "account.showText") {
      setShowText(value);
    } else if (field === "account.dropdownEnabled") {
      setDropdownEnabled(value);
    }

    // For nested account properties, we need to handle them specially
    if (field.startsWith("account.")) {
      const propertyName = field.replace("account.", "");

      // Update parent component state with properly nested object
      if (onUpdateSettings) {
        onUpdateSettings({
          account: {
            [propertyName]: value,
          },
        });
      }

      // Send a properly nested object to the iframe
      const iframe = contentRef?.current || document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "UPDATE_HEADER_SETTINGS",
            settings: {
              account: {
                [propertyName]: value,
              },
            },
          },
          "*"
        );
      }
    } else {
      // Handle non-nested properties normally
      if (onUpdateSettings) {
        onUpdateSettings({ [field]: value });
      }

      // Send message to iframe
      const iframe = contentRef?.current || document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "UPDATE_HEADER_SETTINGS",
            settings: { [field]: value },
          },
          "*"
        );
      }
    }
  };

  // Access account settings with defaults if not present
  const accountSettings = settings.account || {
    showText: true,
    text: "Account",
    showIcon: true,
    style: "default",
    iconStyle: "default",
    iconSize: "medium",
    dropdownEnabled: true,
    loginEnabled: true,
    registerEnabled: true,
  };

  // Function to handle radio button selection
  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);

    // If "text" style is selected, force icon to be hidden
    if (value === "text" && showIcon) {
      setShowIcon(false);
      // Update both the style and showIcon properties
      if (onUpdateSettings) {
        onUpdateSettings({
          account: {
            style: value,
            showIcon: false,
          },
        });
      }

      // Send message to iframe with both updates
      const iframe = contentRef?.current || document.querySelector("iframe");
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          {
            type: "UPDATE_HEADER_SETTINGS",
            settings: {
              account: {
                style: value,
                showIcon: false,
              },
            },
          },
          "*"
        );
      }
    } else {
      // Just update the style normally
      handleUpdate("account.style", value);
    }
  };

  // Function to handle icon style selection
  const handleIconStyleChange = (value: string) => {
    setSelectedIconStyle(value);
    handleUpdate("account.iconStyle", value);
  };

  // Function to handle icon size selection
  const handleIconSizeChange = (value: string) => {
    setSelectedIconSize(value);
    handleUpdate("account.iconSize", value);
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Account Widget"
        description="Configure the account widget in the header"
      >
        <div className="space-y-4">
          {/* Account Display Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border p-2 mb-2 rounded-lg">
              <div>
                <Label htmlFor="show-account-icon">Show Icon</Label>
                <span className="text-xs block">
                  {selectedStyle === "text"
                    ? "Icons are hidden in Text Only mode"
                    : "Show or hide the account icon"}
                </span>
              </div>
              <Switch
                id="show-account-icon"
                checked={selectedStyle === "text" ? false : showIcon}
                disabled={selectedStyle === "text"}
                onCheckedChange={(checked) => {
                  setShowIcon(checked);
                  handleUpdate("account.showIcon", checked);
                }}
              />
            </div>
            {/* Dropdown Settings */}
            <div className="flex flex-col border p-2 mb-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-dropdown">Enable Dropdown</Label>
                  <span className="text-xs block">Show dropdown menu</span>
                </div>

                <Switch
                  id="enable-dropdown"
                  checked={dropdownEnabled}
                  onCheckedChange={(checked) => {
                    setDropdownEnabled(checked);
                    handleUpdate("account.dropdownEnabled", checked);
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col border p-2 mb-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-account-text">Show Text</Label>
                  <span className="text-xs block">Show or hide text label</span>
                </div>
                <Switch
                  id="show-account-text"
                  checked={showText}
                  onCheckedChange={(checked) => {
                    setShowText(checked);
                    handleUpdate("account.showText", checked);
                  }}
                />
              </div>
              {/* Account Text */}
              {showText && (
                <div className="mt-4">
                  <Label htmlFor="account-text">Account Text</Label>
                  <Input
                    id="account-text"
                    value={accountSettings.text || "Account"}
                    onChange={(e) =>
                      handleUpdate("account.text", e.target.value)
                    }
                    placeholder="Account"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Icon Style - New section */}
          {showIcon && (
            <div className="space-y-2">
              <Label>Icon Style</Label>
              <div className="flex flex-wrap">
                {/* First row */}
                <div className="flex w-full rounded-t-lg border overflow-hidden">
                  {/* Default/Plain icon */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer transition-colors ${
                            selectedIconStyle === "default"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleIconStyleChange("default")}
                        >
                          <User
                            className={`h-5 w-5 ${
                              selectedIconStyle === "default"
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Default</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Circle icon */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer border-l transition-colors ${
                            selectedIconStyle === "circle"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleIconStyleChange("circle")}
                        >
                          <div
                            className={`rounded-full ${
                              selectedIconStyle === "circle"
                                ? "bg-white"
                                : "bg-blue-400"
                            } p-1 flex items-center justify-center`}
                          >
                            <User
                              className={`h-3 w-3 ${
                                selectedIconStyle === "circle"
                                  ? "text-primary"
                                  : "text-white"
                              }`}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Circle</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Square icon */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer border-l transition-colors ${
                            selectedIconStyle === "square"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleIconStyleChange("square")}
                        >
                          <div
                            className={`rounded-md ${
                              selectedIconStyle === "square"
                                ? "bg-white"
                                : "bg-blue-400"
                            } p-1 flex items-center justify-center`}
                          >
                            <User
                              className={`h-3 w-3 ${
                                selectedIconStyle === "square"
                                  ? "text-primary"
                                  : "text-white"
                              }`}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Square</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Second row */}
                <div className="flex w-full rounded-b-lg border border-t-0 overflow-hidden">
                  {/* Outline Circle */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer transition-colors ${
                            selectedIconStyle === "outline-circle"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            handleIconStyleChange("outline-circle")
                          }
                        >
                          <div
                            className={`rounded-full border ${
                              selectedIconStyle === "outline-circle"
                                ? "border-white"
                                : "border-blue-400"
                            } p-1 flex items-center justify-center`}
                          >
                            <User
                              className={`h-3 w-3 ${
                                selectedIconStyle === "outline-circle"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Outline Circle</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Outline Square */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer border-l transition-colors ${
                            selectedIconStyle === "outline-square"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            handleIconStyleChange("outline-square")
                          }
                        >
                          <div
                            className={`rounded-md border ${
                              selectedIconStyle === "outline-square"
                                ? "border-white"
                                : "border-blue-400"
                            } p-1 flex items-center justify-center`}
                          >
                            <User
                              className={`h-3 w-3 ${
                                selectedIconStyle === "outline-square"
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Outline Square</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Solid Background */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex-1 h-11 flex items-center justify-center cursor-pointer border-l transition-colors ${
                            selectedIconStyle === "solid-bg"
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => handleIconStyleChange("solid-bg")}
                        >
                          <div
                            className={`rounded-md ${
                              selectedIconStyle === "solid-bg"
                                ? "bg-white"
                                : "bg-blue-400"
                            } p-1 flex items-center justify-center`}
                          >
                            <User
                              className={`h-3 w-3 ${
                                selectedIconStyle === "solid-bg"
                                  ? "text-primary"
                                  : "text-white"
                              }`}
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Solid Background</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          )}

          {/* Icon Size - Move here, right after Icon Style */}
          {showIcon && (
            <div className="space-y-2 mt-4">
              <Label>Icon Size</Label>
              <div className="flex w-full rounded-lg border overflow-hidden">
                {/* SM Option */}
                <div
                  className={`flex-1 h-10 flex items-center justify-center cursor-pointer transition-colors ${
                    selectedIconSize === "small"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleIconSizeChange("small")}
                >
                  <span className="text-xs font-medium">SM</span>
                </div>

                {/* MD Option */}
                <div
                  className={`flex-1 h-10 flex items-center justify-center cursor-pointer border-l transition-colors ${
                    selectedIconSize === "medium"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleIconSizeChange("medium")}
                >
                  <span className="text-xs font-medium">MD</span>
                </div>

                {/* LG Option */}
                <div
                  className={`flex-1 h-10 flex items-center justify-center cursor-pointer border-l transition-colors ${
                    selectedIconSize === "large"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleIconSizeChange("large")}
                >
                  <span className="text-xs font-medium">LG</span>
                </div>

                {/* XL Option */}
                <div
                  className={`flex-1 h-10 flex items-center justify-center cursor-pointer border-l transition-colors ${
                    selectedIconSize === "xlarge"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleIconSizeChange("xlarge")}
                >
                  <span className="text-xs font-medium">XL</span>
                </div>
              </div>
            </div>
          )}

          {/* Account Style */}
          <div className="space-y-2">
            <Label>Account Style</Label>
            <div className="flex w-full rounded-lg border overflow-hidden">
              {/* Default Option */}
              <div
                className={`flex-1 h-10 flex items-center justify-center cursor-pointer transition-colors ${
                  selectedStyle === "default"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleStyleChange("default")}
              >
                <span className="text-xs font-medium">Default</span>
              </div>

              {/* Button Option */}
              <div
                className={`flex-1 h-10 flex items-center justify-center cursor-pointer border-l transition-colors ${
                  selectedStyle === "button"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleStyleChange("button")}
              >
                <span className="text-xs font-medium">Button</span>
              </div>

              {/* Text Only Option */}
              <div
                className={`flex-1 h-10 flex items-center justify-center cursor-pointer border-l transition-colors ${
                  selectedStyle === "text"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleStyleChange("text")}
              >
                <span className="text-xs font-medium">Text Only</span>
              </div>
            </div>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
