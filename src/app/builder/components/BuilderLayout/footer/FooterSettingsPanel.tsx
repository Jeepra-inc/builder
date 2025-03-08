"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import {} from "lucide-react";

interface FooterSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function FooterSettingsPanel({
  settings = {},
  onUpdateSettings,
}: FooterSettingsPanelProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  return (
    <ScrollArea className="h-full w-full rounded-md">
      {/* Main Panel Heading - Always visible */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-lg font-semibold text-gray-800">
          Footer Settings
        </h2>
      </div>

      <div className="p-4 pb-8">
        <Accordion type="single" collapsible className="w-full">
          {/* Content Settings */}
          <AccordionItem value="content">
            <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
              <span>Content</span>
            </AccordionTrigger>
            <AccordionContent className="p-3 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Copyright Text</Label>
                  <Input
                    value={settings.content?.copyright || ""}
                    onChange={(e) =>
                      handleUpdate("content.copyright", e.target.value)
                    }
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={settings.content?.description || ""}
                    onChange={(e) =>
                      handleUpdate("content.description", e.target.value)
                    }
                    placeholder="Enter footer description"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Links Settings */}
          <AccordionItem value="links">
            <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
              <span>Links</span>
            </AccordionTrigger>
            <AccordionContent className="p-3">
              <div className="space-y-4">
                {settings.links?.items?.map((item: any, index: number) => (
                  <div key={index} className="space-y-2 p-3 border rounded-md">
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={item.text}
                        onChange={(e) => {
                          const newItems = [...(settings.links?.items || [])];
                          newItems[index] = { ...item, text: e.target.value };
                          handleUpdate("links.items", newItems);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...(settings.links?.items || [])];
                          newItems[index] = { ...item, url: e.target.value };
                          handleUpdate("links.items", newItems);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newItems = [...(settings.links?.items || [])];
                    newItems.push({ text: "", url: "" });
                    handleUpdate("links.items", newItems);
                  }}
                >
                  Add Link
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Layout Settings */}
          <AccordionItem value="layout">
            <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
              <span>Layout</span>
            </AccordionTrigger>
            <AccordionContent className="p-3">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Width</Label>
                  <Input
                    value={settings.layout?.maxWidth || ""}
                    onChange={(e) =>
                      handleUpdate("layout.maxWidth", e.target.value)
                    }
                    placeholder="e.g., 1200px"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.layout?.showSocials}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout.showSocials", checked)
                    }
                  />
                  <Label>Show Social Links</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.layout?.multiColumn}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout.multiColumn", checked)
                    }
                  />
                  <Label>Multi-Column Layout</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ScrollArea>
  );
}
