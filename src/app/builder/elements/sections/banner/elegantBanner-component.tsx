// src/sections/new-arrival/new-arrival-component.tsx
import { FC, useEffect, useState } from "react";
import clsx from "clsx";
import { SectionSchema, SectionType } from "@/app/builder/types";
import withSection from "../withSection";
import {
  useColorScheme,
  addColorSchemesToSchema,
  fetchColorSchemes,
} from "@/app/builder/utils/colorSchemeUtils";

interface NewArrivalComponentType extends FC<any> {
  schema?: SectionSchema;
}

//

// Create the initial schema
export const getBaseSchema = (): SectionSchema => ({
  name: "New Arrival",
  type: SectionType.Banner,
  schema: [
    {
      id: "title",
      type: "text",
      label: "Title",
      default: "New Arrival",
    },
    {
      id: "subtitle",
      type: "text",
      label: "Subtitle",
      default: "Discover Our\nNew Collection",
    },
    {
      id: "description",
      type: "textarea",
      label: "Description",
      default:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.",
    },
  ],
  settings: [
    {
      id: "colorScheme",
      type: "select",
      label: "Color Scheme",
      options: [],
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
      default: "BUY NOW",
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

export const newArrivalSchema = getBaseSchema();

if (typeof window !== "undefined") {
  fetchColorSchemes().then((schemes) => {
    const colorSchemeSetting = newArrivalSchema.settings?.find(
      (s: { id: string }) => s.id === "colorScheme"
    );
    if (colorSchemeSetting) {
      colorSchemeSetting.options = schemes.map((scheme) => ({
        value: scheme.id,
        label: scheme.name || `Scheme ${scheme.id}`,
      }));
      colorSchemeSetting.default = schemes[0]?.id || "";
    }
  });
}

const NewArrivalComponent: NewArrivalComponentType = withSection({
  schema: newArrivalSchema,
  renderContent: (settings) => {
    const { styles, isLoading } = useColorScheme(settings.colorScheme);
    const [hasSchemas, setHasSchemas] = useState(false);

    useEffect(() => {
      window.addEventListener("schemaUpdated", () =>
        setHasSchemas((prev) => !prev)
      );
      return () =>
        window.removeEventListener("schemaUpdated", () =>
          setHasSchemas((prev) => !prev)
        );
    }, []);

    return (
      <div
        className={clsx("max-w-4xl mx-auto p-8 space-y-6", {
          "text-left": settings.textAlignment === "left",
          "text-center": settings.textAlignment === "center",
          "text-right": settings.textAlignment === "right",
        })}
        style={styles.background}
      >
        {isLoading && (
          <div className="text-xs text-gray-500">Loading colors...</div>
        )}

        <div className="space-y-4">
          {settings.title && (
            <h2 className="text-2xl font-light uppercase" style={styles.text}>
              {settings.title}
            </h2>
          )}

          {settings.subtitle && (
            <h1
              className="text-4xl font-bold leading-tight"
              style={styles.text}
            >
              {settings.subtitle.split("\n").map((line: string, i: number) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
          )}

          {settings.description && (
            <p className="text-lg max-w-xl mx-auto" style={styles.text}>
              {settings.description}
            </p>
          )}
        </div>

        {settings.buttonText && (
          <a
            href={settings.buttonLink}
            className={clsx(
              "inline-block px-8 py-3 text-lg font-medium rounded-md transition-all",
              {
                "bg-primary-600 text-white hover:bg-primary-700":
                  settings.buttonStyle === "primary",
                "bg-gray-800 text-white hover:bg-gray-900":
                  settings.buttonStyle === "secondary",
                "border-2 border-primary-600 text-primary-600 hover:bg-primary-50":
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

addColorSchemesToSchema(newArrivalSchema, NewArrivalComponent);

NewArrivalComponent.schema = newArrivalSchema;
export { NewArrivalComponent };
