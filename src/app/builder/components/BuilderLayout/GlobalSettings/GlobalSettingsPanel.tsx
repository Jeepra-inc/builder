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
    <div className="h-full w-full">
      <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-800">
          Global Settings
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {globalSettingsConfig.map((category) => {
          const SettingComponent = SETTINGS_COMPONENTS[category.id];

          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-zinc-100 text-sm font-semibold group">
                <div className="flex items-center gap-2">
                  <span>{category.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                {SettingComponent && <SettingComponent />}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
