// src/sections/moderBanner/moderBanner-component.tsx
import { FC } from "react";
import clsx from "clsx";
import { SectionSchema, SectionType } from "@/app/builder/types";
import withSection from "../withSection";

interface ModernBannerComponentType extends FC<any> {
  schema?: SectionSchema;
}

export const moderBannerSchema: SectionSchema = {
  name: "moderBanner",
  type: SectionType.ModernBanner,
  schema: [
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "Your moderBanner Title",
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default: "Add your moderBanner description here",
    },
  ],
  settings: [
    {
      id: "textAlignment",
      type: "select",
      label: "Text Alignment",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
      default: "center",
    },
    {
      id: "buttonText",
      type: "text",
      label: "Button Text",
      default: "Learn More",
    },
    {
      id: "buttonLink",
      type: "text",
      label: "Button Link",
      default: "#",
    },
    {
      id: "buttonStyle",
      type: "select",
      label: "Button Style",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
      ],
      default: "primary",
    },
  ],
};

/**
 * ModernBannerComponent renders a customizable moderBanner section based on the provided schema and settings.
 */
const ModernBannerComponent: ModernBannerComponentType = withSection({
  schema: moderBannerSchema,
  renderContent: (settings) => {
    return (
      <div
        className={clsx("max-w-4xl mx-auto pt-[30px]", {
          "text-left": settings.textAlignment === "left",
          "text-center": settings.textAlignment === "center",
          "text-right": settings.textAlignment === "right",
        })}
      >
        {settings.title && (
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: settings.textColor }}
          >
            {settings.title}
          </h1>
        )}
        {settings.description && (
          <p className="text-lg mb-6" style={{ color: settings.textColor }}>
            {settings.description}
          </p>
        )}
        {settings.buttonText && (
          <a
            href={settings.buttonLink}
            className={clsx(
              "inline-block px-6 py-2 rounded transition-colors duration-300",
              {
                "bg-blue-500 text-white hover:bg-blue-600":
                  settings.buttonStyle === "primary",
                "bg-gray-500 text-white hover:bg-gray-600":
                  settings.buttonStyle === "secondary",
                "border border-blue-500 text-blue-500 hover:bg-blue-50":
                  settings.buttonStyle === "outline",
              }
            )}
          >
            {settings.buttonText}
          </a>
        )}
      </div>
    );
  },
});

// Attach the schema to the component for builder integration
ModernBannerComponent.schema = moderBannerSchema;
export { ModernBannerComponent };
