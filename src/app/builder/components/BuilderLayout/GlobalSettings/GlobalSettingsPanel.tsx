import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { globalSettingsConfig } from "@/app/builder/config/globalSettings";
import {
  BrandingSettings,
  TypographySettings,
  CustomCSSSettings,
  ColorsSettings,
  LayoutSettings,
  SocialSettings,
  AnimationSettings,
  ButtonSettings,
  InputSettings,
  BlogCardSettings,
  MediaSettings,
} from "./settings";

const SETTINGS_COMPONENTS: Record<string, React.ComponentType> = {
  branding: BrandingSettings,
  typography: TypographySettings,
  "custom-css": CustomCSSSettings,
  colors: ColorsSettings,
  layout: LayoutSettings,
  social: SocialSettings,
  animation: AnimationSettings,
  buttons: ButtonSettings,
  inputs: InputSettings,
  "blog-card": BlogCardSettings,
  media: MediaSettings,
};

export function GlobalSettingsPanel() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {globalSettingsConfig.map((category) => {
        const SettingComponent = SETTINGS_COMPONENTS[category.id];

        return (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
              <div className="flex items-center gap-2">
                <category.icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                <span>{category.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-3">
              {SettingComponent ? (
                <SettingComponent />
              ) : (
                <p className="text-sm text-gray-500">Settings coming soon...</p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
