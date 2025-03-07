import React, { useEffect, useState } from "react";
import { Section, SectionType, SectionSchema } from "@/app/builder/types";
import clsx from "clsx";
import SectionWrapper from "@/app/builder/components/IframeContent/SectionWrapper";
import {
  useColorScheme,
  addColorSchemesToSchema,
  fetchColorSchemes,
} from "@/app/builder/utils/colorSchemeUtils";

interface HeroComponentProps {
  section: Section;
  isEditing?: boolean;
  isSelected?: boolean;
  onUpdateSection?: (updates: Partial<Section>) => void;
  className?: string;
}

interface HeroComponentWithSchema extends React.FC<HeroComponentProps> {
  schema: any;
}

export const heroSchema = {
  name: "Hero",
  type: SectionType.Hero,
  schema: [
    {
      id: "title",
      type: "text" as const,
      label: "Title",
      default: "Your Hero Title",
    },
    {
      id: "subtitle",
      type: "text" as const,
      label: "Subtitle",
      default: "Your Hero Subtitle",
    },
    {
      id: "image",
      type: "text" as const,
      label: "Image",
      default: "https://pagedone.io/asset/uploads/1691054543.png",
    },
    {
      id: "description",
      type: "textarea" as const,
      label: "Description",
      default: "Add your Hero description here",
    },
    {
      id: "buttonText",
      type: "text" as const,
      label: "Button Text",
      default: "Learn More",
    },
  ],
  settings: [
    {
      id: "title",
      type: "text" as const,
      label: "Title",
      default: "Your Hero Title",
    },
    {
      id: "subtitle",
      type: "text" as const,
      label: "Subtitle",
      default: "Your Hero Subtitle",
    },
    {
      id: "image",
      type: "text" as const,
      label: "Image",
      default: "https://pagedone.io/asset/uploads/1691054543.png",
    },
    {
      id: "description",
      type: "textarea" as const,
      label: "Description",
      default: "Add your Hero description here",
    },
    {
      id: "buttonText",
      type: "text" as const,
      label: "Button Text",
      default: "Learn More",
    },
    {
      id: "buttonLink",
      type: "text" as const,
      label: "Button Link",
      default: "#",
    },
    {
      id: "buttonStyle",
      type: "select" as const,
      label: "Button Style",
      default: "primary",
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
      ],
    },
    {
      id: "textAlignment",
      type: "select" as const,
      label: "Text Alignment",
      default: "center",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
    },
    {
      id: "colorScheme",
      type: "select" as const,
      label: "Color Scheme",
      options: [], // Will be populated by addColorSchemesToSchema
      default: "",
    },
    // Keeping these as fallbacks in case no color scheme is selected
    {
      id: "backgroundColor",
      type: "color" as const,
      label: "Background Color",
      default: "#f0f0f0",
    },
    {
      id: "textColor",
      type: "color" as const,
      label: "Text Color",
      default: "#000000",
    },
  ],
} satisfies SectionSchema;

// Immediately update the schema with color schemes to ensure options are available
if (typeof window !== "undefined") {
  // First, try to initialize with color schemes immediately
  fetchColorSchemes().then((schemes) => {
    if (schemes.length > 0) {
      console.log(
        "Hero: Initializing schema with color schemes:",
        schemes.length
      );
      const colorSchemeSetting = heroSchema.settings?.find(
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
          "Hero: Updated colorScheme options:",
          colorSchemeSetting.options
        );
      }
    }
  });
}

export const HeroComponent: HeroComponentWithSchema = ({
  section,
  isEditing,
  isSelected,
  onUpdateSection,
  className,
}) => {
  // Use the color scheme hook to get styles based on selected scheme
  const { styles, isLoading, colorSchemes } = useColorScheme(
    section.settings?.colorScheme
  );
  const [hasSchemas, setHasSchemas] = useState(false);

  useEffect(() => {
    // Log to debug
    console.log(
      "Hero: Current color scheme setting:",
      section.settings?.colorScheme
    );
    console.log("Hero: Available color schemes:", colorSchemes);

    if (colorSchemes.length > 0) {
      setHasSchemas(true);
    }

    // Listen for schema updates
    const handleSchemaUpdate = () => {
      console.log("Hero: Schema update event received");
      // Force refresh of component
      setHasSchemas((prev) => !prev);
    };

    window.addEventListener("schemaUpdated", handleSchemaUpdate);
    return () => {
      window.removeEventListener("schemaUpdated", handleSchemaUpdate);
    };
  }, [colorSchemes, section.settings?.colorScheme]);

  const resolvedSettings = {
    title: section.settings?.title || "Your Hero Title",
    subtitle: section.settings?.subtitle || "Your Hero Subtitle",
    description:
      section.settings?.description || "Add your Hero description here",
    image:
      section.settings?.image ||
      "https://pagedone.io/asset/uploads/1691054543.png",
    buttonText: section.settings?.buttonText || "Learn More",
    buttonLink: section.settings?.buttonLink || "#",
    buttonStyle: section.settings?.buttonStyle || "primary",
    textAlignment: section.settings?.textAlignment || "center",
    backgroundColor: section.settings?.backgroundColor || "#f0f0f0",
    textColor: section.settings?.textColor || "#000000",
  };

  return (
    <SectionWrapper
      section={section}
      isEditing={isEditing}
      isSelected={isSelected}
      className={className}
    >
      <section
        className={clsx("pt-8 lg:pt-32 bg-center bg-cover", className)}
        style={styles.background}
      >
        {isLoading && (
          <div className="text-xs text-gray-500 mb-2 text-center">
            Loading color schemes...
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="border border-indigo-600 p-1 w-60 mx-auto rounded-full flex items-center justify-between mb-4">
            <span className="font-inter text-xs font-medium text-gray-900 ml-3">
              Explore how to use for brands.
            </span>
            <a
              href="javascript:;"
              className="w-8 h-8 rounded-full flex justify-center items-center bg-indigo-600"
            >
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.83398 8.00019L12.9081 8.00019M9.75991 11.778L13.0925 8.44541C13.3023 8.23553 13.4073 8.13059 13.4073 8.00019C13.4073 7.86979 13.3023 7.76485 13.0925 7.55497L9.75991 4.22241"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
          {resolvedSettings.title && (
            <h1
              className="max-w-2xl mx-auto text-center font-manrope font-bold text-4xl mb-5 md:text-5xl leading-[50px]"
              style={styles.text}
            >
              {resolvedSettings.title}
              {resolvedSettings.subtitle && (
                <span className="text-indigo-600">
                  {resolvedSettings.subtitle}
                </span>
              )}
            </h1>
          )}
          {resolvedSettings.description && (
            <p
              className="max-w-sm mx-auto text-center text-base font-normal leading-7 mb-9"
              style={styles.text}
            >
              {resolvedSettings.description}
            </p>
          )}
          {resolvedSettings.buttonText && (
            <a
              href={resolvedSettings.buttonLink}
              className="w-full md:w-auto mb-14 inline-flex items-center justify-center py-3 px-7 text-base font-semibold text-center text-white rounded-full bg-indigo-600 shadow-xs hover:bg-indigo-700 transition-all duration-500"
            >
              {resolvedSettings.buttonText}
              <svg
                className="ml-2"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 15L11.0858 11.4142C11.7525 10.7475 12.0858 10.4142 12.0858 10C12.0858 9.58579 11.7525 9.25245 11.0858 8.58579L7.5 5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
          {resolvedSettings.image && (
            <div className="flex justify-center">
              <img
                src={resolvedSettings.image}
                alt="Dashboard"
                className="rounded-t-3xl max-w-[1000px] h-auto max-h-[500px] object-cover"
              />
            </div>
          )}
        </div>
      </section>
    </SectionWrapper>
  );
};

// Update the schema with color schemes - this is a fallback
// to the initialization above
addColorSchemesToSchema(heroSchema, HeroComponent).catch((error) =>
  console.error("Failed to add color schemes to hero schema:", error)
);

HeroComponent.schema = heroSchema;
export default HeroComponent;
