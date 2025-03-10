"use client";

import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogoSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function LogoSettingsPanel({
  settings = {},
  onUpdateSettings,
}: LogoSettingsPanelProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  // Send message to iframe whenever logo settings change
  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow && settings?.logo) {
      // Send the header-specific settings update
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_HEADER_SETTINGS",
          settings: {
            logo: settings.logo,
            logoWidth: getSizeInPixels(settings.logo.size || "medium"),
            logoUrl: settings.logo.image || "",
          },
        },
        "*"
      );

      // Also send the global branding update to ensure both systems are synced
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_LOGO",
          logoUrl: settings.logo.image || "",
          logoWidth: getSizeInPixels(settings.logo.size || "medium"),
        },
        "*"
      );

      // Now also update the CSS variable in the parent window
      document.documentElement.style.setProperty(
        "--logo-width",
        `${getSizeInPixels(settings.logo.size || "medium")}px`
      );
    }
  }, [settings.logo]);

  // Helper to convert size to pixels
  const getSizeInPixels = (size: string): number => {
    switch (size) {
      case "small":
        return 30;
      case "large":
        return 70;
      default:
        return 50; // medium
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ImageUploader
          value={settings.logo?.image}
          onChange={(url) => handleUpdate("logo.image", url)}
        />
        <div className="space-y-2">
          <Label>Logo Text</Label>
          <Input
            value={settings.logo?.text || ""}
            onChange={(e) => handleUpdate("logo.text", e.target.value)}
            placeholder="Enter logo text"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.logo?.showText}
            onCheckedChange={(checked) =>
              handleUpdate("logo.showText", checked)
            }
          />
          <Label>Show Logo Text</Label>
        </div>
        <div className="space-y-2">
          <Label>Logo Size</Label>
          <Select
            value={settings.logo?.size || "medium"}
            onValueChange={(value) => handleUpdate("logo.size", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
