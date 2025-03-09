"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Trash2 } from "lucide-react";

interface HeaderSocialSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function HeaderSocialSettings({
  settings = {},
  onUpdateSettings,
}: HeaderSocialSettingsProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  const handleAddSocial = () => {
    const currentSocials = settings.social?.items || [];
    handleUpdate("social.items", [
      ...currentSocials,
      { platform: "facebook", url: "#", icon: "facebook" },
    ]);
  };

  const handleRemoveSocial = (index: number) => {
    const newSocials = [...(settings.social?.items || [])];
    newSocials.splice(index, 1);
    handleUpdate("social.items", newSocials);
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Social Media Icons"
        description="Configure social media links in header"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Social Icons</Label>
            <Switch
              checked={settings.social?.show}
              onCheckedChange={(checked) =>
                handleUpdate("social.show", checked)
              }
            />
          </div>

          {settings.social?.items?.map((social: any, index: number) => (
            <div key={index} className="space-y-2 p-3 border rounded-md">
              <div className="flex items-center justify-between">
                <Label>Social Link {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSocial(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={social.platform}
                  onValueChange={(value) => {
                    const newSocials = [...(settings.social?.items || [])];
                    newSocials[index] = {
                      ...social,
                      platform: value,
                      icon: value,
                    };
                    handleUpdate("social.items", newSocials);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={social.url}
                  onChange={(e) => {
                    const newSocials = [...(settings.social?.items || [])];
                    newSocials[index] = { ...social, url: e.target.value };
                    handleUpdate("social.items", newSocials);
                  }}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleAddSocial} className="w-full">
            Add Social Link
          </Button>
        </div>
      </SettingSection>
    </div>
  );
}
