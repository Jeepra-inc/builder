// src/sections/banner/banner-component.tsx
import { FC, useEffect, useState } from "react";
import clsx from "clsx";
import { SectionSchema, SectionType } from "@/app/builder/types";
import withSection from "../withSection";
import {
  useColorScheme,
  addColorSchemesToSchema,
  fetchColorSchemes,
} from "@/app/builder/utils/colorSchemeUtils";

interface BannerComponentType extends FC<any> {
  schema?: SectionSchema;
}

// Create the initial schema with empty options for color scheme
export const getBaseSchema = (): SectionSchema => ({
  name: "Banner",
  type: SectionType.Banner,
  schema: [
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "Your Banner Title",
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default: "Add your banner description here",
    },
  ],
  settings: [
    {
      id: "colorScheme",
      type: "select",
      label: "Color Scheme",
      options: [], // Will be populated by addColorSchemesToSchema
      default: "",
    },
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
});

// Initialize with base schema
export const bannerSchema = getBaseSchema();

// Immediately update the schema with color schemes to ensure options are available
if (typeof window !== "undefined") {
  // First, try to initialize with color schemes immediately
  fetchColorSchemes().then((schemes) => {
    if (schemes.length > 0) {
      console.log(
        "Banner: Initializing schema with color schemes:",
        schemes.length
      );
      const colorSchemeSetting = bannerSchema.settings?.find(
        (s: { id: string }) => s.id === "colorScheme"
      );
      if (colorSchemeSetting) {
        colorSchemeSetting.options = schemes.map((scheme) => ({
          value: scheme.id,
          label: scheme.name || `Scheme ${scheme.id}`,
        }));
        if (schemes.length > 0 && !colorSchemeSetting.default) {
          colorSchemeSetting.default = schemes[0].id;
        }
        console.log(
          "Banner: Updated colorScheme options:",
          colorSchemeSetting.options
        );
      }
    }
  });
}

/**
 * BannerComponent renders a customizable banner section based on the provided schema and settings.
 */
const BannerComponent: BannerComponentType = withSection({
  schema: bannerSchema,
  renderContent: (settings) => {
    // Use the color scheme hook to get styles based on selected scheme
    const { styles, isLoading, colorSchemes } = useColorScheme(
      settings.colorScheme
    );
    const [hasSchemas, setHasSchemas] = useState(false);

    useEffect(() => {
      // Log to debug
      console.log(
        "Banner: Current color scheme setting:",
        settings.colorScheme
      );
      console.log("Banner: Available color schemes:", colorSchemes);

      if (colorSchemes.length > 0) {
        setHasSchemas(true);
      }

      // Listen for schema updates
      const handleSchemaUpdate = () => {
        console.log("Banner: Schema update event received");
        // Force refresh of component
        setHasSchemas((prev) => !prev);
      };

      window.addEventListener("schemaUpdated", handleSchemaUpdate);
      return () => {
        window.removeEventListener("schemaUpdated", handleSchemaUpdate);
      };
    }, [colorSchemes, settings.colorScheme]);

    return (
      <div
        className={clsx("max-w-4xl mx-auto pt-[30px] p-6 rounded-lg", {
          "text-left": settings.textAlignment === "left",
          "text-center": settings.textAlignment === "center",
          "text-right": settings.textAlignment === "right",
        })}
        style={styles.background}
      >
        {isLoading && (
          <div className="text-xs text-gray-500 mb-2">
            Loading color schemes...
          </div>
        )}

        {settings.title && (
          <h1 className="text-3xl font-bold mb-4" style={styles.text}>
            {settings.title}
          </h1>
        )}
        {settings.description && (
          <p className="text-lg mb-6" style={styles.text}>
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

// Update the schema with color schemes - this is a fallback
// to the initialization above
addColorSchemesToSchema(bannerSchema, BannerComponent).catch((error) =>
  console.error("Failed to add color schemes to banner schema:", error)
);

// Attach the schema to the component for builder integration
BannerComponent.schema = bannerSchema;
export { BannerComponent };
