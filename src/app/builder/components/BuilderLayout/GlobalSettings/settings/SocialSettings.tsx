import React, { useState, useEffect } from "react";
import { SettingSection } from "./SettingSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Check } from "lucide-react";
import { saveSettings } from "@/app/builder/utils/settingsStorage";

type SocialLink = {
  platform: string;
  url: string;
};

const socialOptions = [
  {
    value: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/username",
  },
  {
    value: "twitter",
    label: "Twitter",
    placeholder: "https://twitter.com/username",
  },
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/username",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/username",
  },
  {
    value: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@username",
  },
  {
    value: "github",
    label: "GitHub",
    placeholder: "https://github.com/username",
  },
  {
    value: "website",
    label: "Website",
    placeholder: "https://yourwebsite.com",
  },
];

export function SocialSettings() {
  // Get global settings from localStorage
  const getGlobalSettings = () => {
    try {
      const settings = localStorage.getItem("builder_settings");
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error("Error getting settings from localStorage:", error);
      return {};
    }
  };

  const [links, setLinks] = useState<SocialLink[]>([{ platform: "", url: "" }]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing social links from global settings on component mount
  useEffect(() => {
    const globalSettings = getGlobalSettings();
    if (
      globalSettings?.socialLinks &&
      Array.isArray(globalSettings.socialLinks)
    ) {
      if (globalSettings.socialLinks.length > 0) {
        setLinks(globalSettings.socialLinks);
      }
    }
  }, []);

  const getAvailablePlatforms = (currentIndex: number) => {
    return socialOptions.filter(
      (option) =>
        !links.some(
          (link, index) =>
            index !== currentIndex &&
            link.platform === option.value &&
            link.platform !== ""
        )
    );
  };

  const handleAddLink = () => {
    const newLinks = [...links, { platform: "", url: "" }];
    setLinks(newLinks);
    saveLinksToGlobalSettings(newLinks);
  };

  const handlePlatformChange = (value: string, index: number) => {
    const newLinks = [...links];
    newLinks[index].platform = value;
    setLinks(newLinks);
    saveLinksToGlobalSettings(newLinks);
  };

  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newLinks = [...links];
    newLinks[index].url = e.target.value;
    setLinks(newLinks);
    // Don't save immediately on every keystroke, wait for blur or Enter key
  };

  const handleUrlBlur = (index: number) => {
    // Save when the user tabs away or clicks away from the input
    saveLinksToGlobalSettings(links);
  };

  const handleUrlKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Save when the user presses Enter
    if (e.key === "Enter") {
      saveLinksToGlobalSettings(links);
    }
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    saveLinksToGlobalSettings(newLinks);
  };

  // Function to save links to global settings
  const saveLinksToGlobalSettings = async (linksToSave: SocialLink[]) => {
    // Filter out empty platforms
    const filteredLinks = linksToSave.filter((link) => link.platform !== "");

    setIsSaving(true);

    try {
      // Get current settings
      const globalSettings = getGlobalSettings();

      // Update with the social links
      const updatedSettings = {
        ...globalSettings,
        socialLinks: filteredLinks,
      };

      // Save to localStorage first (as a backup)
      localStorage.setItem("builder_settings", JSON.stringify(updatedSettings));

      // Save to the settings.json file
      await saveSettings(updatedSettings);

      console.log("Social links saved to settings:", filteredLinks);

      // Show success message (using alert since we don't have toast)
      if (typeof window !== "undefined") {
        // Use a non-blocking notification
        const notification = document.createElement("div");
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.right = "20px";
        notification.style.backgroundColor = "#4CAF50";
        notification.style.color = "white";
        notification.style.padding = "16px";
        notification.style.borderRadius = "4px";
        notification.style.zIndex = "9999";
        notification.textContent = "Social links saved successfully";
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to save social links:", error);

      // Show error message
      if (typeof window !== "undefined") {
        // Use a non-blocking notification
        const notification = document.createElement("div");
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.right = "20px";
        notification.style.backgroundColor = "#F44336";
        notification.style.color = "white";
        notification.style.padding = "16px";
        notification.style.borderRadius = "4px";
        notification.style.zIndex = "9999";
        notification.textContent = "Failed to save social links";
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const availablePlatforms = getAvailablePlatforms(-1);

  return (
    <div className="space-y-6">
      <SettingSection
        title="Social Links"
        description="Add links to your social media profiles"
      >
        <div className="space-y-4">
          {links.map((link, index) => {
            const available = getAvailablePlatforms(index);

            return (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 flex gap-2">
                  <Select
                    value={link.platform}
                    onValueChange={(value) =>
                      handlePlatformChange(value, index)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="url"
                    placeholder={
                      socialOptions.find((o) => o.value === link.platform)
                        ?.placeholder || "Enter URL"
                    }
                    value={link.url}
                    onChange={(e) => handleUrlChange(e, index)}
                    onBlur={() => handleUrlBlur(index)}
                    onKeyDown={(e) => handleUrlKeyDown(e, index)}
                  />
                </div>

                <div className="flex space-x-1">
                  {links.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-destructive"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {availablePlatforms.length > 0 && (
            <Button
              variant="outline"
              type="button"
              onClick={handleAddLink}
              className="mt-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  Saving... <Check className="ml-2 h-4 w-4" />
                </>
              ) : (
                "+ Add Link"
              )}
            </Button>
          )}
        </div>
      </SettingSection>
    </div>
  );
}
