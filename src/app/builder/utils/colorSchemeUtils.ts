import { useState, useEffect } from "react";
import { SectionSchema } from "@/app/builder/types";

/**
 * Interface representing a color scheme from settings.json
 */
export interface ColorScheme {
  id: string;
  name?: string;
  background: string;
  text: string;
  gradient?: string;
}

// Global cache to store color schemes once fetched
let globalColorSchemes: ColorScheme[] = [];

/**
 * Fetch color schemes from settings.json
 */
export const fetchColorSchemes = async (): Promise<ColorScheme[]> => {
  try {
    // If we already have schemes cached, return them
    if (globalColorSchemes.length > 0) {
      return globalColorSchemes;
    }

    const response = await fetch("/settings.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch settings.json: ${response.status}`);
    }

    const data = await response.json();
    if (data.globalStyles?.colors?.schemes) {
      const schemes = data.globalStyles.colors.schemes as ColorScheme[];
      console.log("Fetched color schemes:", schemes);
      // Update the global cache
      globalColorSchemes = schemes;
      return schemes;
    }

    console.warn("No color schemes found in settings.json");
    return [];
  } catch (error) {
    console.error("Error fetching color schemes:", error);
    return [];
  }
};

/**
 * Update a schema's colorScheme field with available color schemes
 * This modifies the schema object directly to ensure the UI updates
 */
export const updateSchemaWithColorSchemes = (
  schema: SectionSchema,
  colorSchemes: ColorScheme[]
): SectionSchema => {
  if (!schema || !colorSchemes || colorSchemes.length === 0) {
    console.warn("Cannot update schema with color schemes - missing data");
    return schema;
  }

  console.log("Updating schema with color schemes:", colorSchemes.length);

  // Find the colorScheme setting - directly modify instead of creating a clone
  const setting = schema.settings?.find(
    (s: { id: string }) => s.id === "colorScheme"
  );

  if (setting) {
    // Create options from the schemes
    const schemeOptions = colorSchemes.map((scheme) => ({
      value: scheme.id,
      label: scheme.name || `Scheme ${scheme.id}`,
    }));

    console.log("Created scheme options:", schemeOptions);

    // Update the options and default
    setting.options = schemeOptions;
    if (schemeOptions.length > 0 && !setting.default) {
      setting.default = schemeOptions[0].value;
    }

    console.log("Updated colorScheme setting:", setting);
  } else {
    console.warn("No colorScheme setting found in schema");
  }

  return schema;
};

/**
 * Add color scheme options to a component's schema
 * @param componentSchema The schema to add color scheme options to
 * @param componentInstance (Optional) The component instance to update
 */
export const addColorSchemesToSchema = async (
  componentSchema: SectionSchema,
  componentInstance?: { schema?: SectionSchema }
): Promise<SectionSchema> => {
  // Fetch color schemes
  const schemes = await fetchColorSchemes();

  if (schemes.length === 0) {
    console.warn("No color schemes fetched, cannot update schema");
    return componentSchema;
  }

  // Update the schema - this modifies the original object
  updateSchemaWithColorSchemes(componentSchema, schemes);

  // If component instance provided, ensure its schema is updated
  if (componentInstance && componentInstance.schema) {
    // Ensure component instance has the same reference
    componentInstance.schema = componentSchema;

    // Force schema update notification
    if (typeof window !== "undefined") {
      // Notify parent about the update
      if (window.parent) {
        console.log("Notifying parent about schema update");
        window.parent.postMessage(
          {
            type: "SCHEMA_UPDATED",
            componentType: componentSchema.name,
            schema: componentSchema,
          },
          "*"
        );
      }

      // Dispatch a custom event for local components
      console.log("Dispatching schemaUpdated event");
      window.dispatchEvent(
        new CustomEvent("schemaUpdated", {
          detail: {
            componentType: componentSchema.name,
            schema: componentSchema,
          },
        })
      );
    }
  }

  return componentSchema;
};

/**
 * Initialize color schemes as soon as module loads
 * This ensures schemes are loaded before components mount
 */
if (typeof window !== "undefined") {
  fetchColorSchemes().catch((err) =>
    console.error("Failed to pre-fetch color schemes:", err)
  );
}

/**
 * React hook to use color schemes in components
 * @param selectedSchemeId The ID of the selected color scheme
 * @returns Color information and loading state
 */
export const useColorScheme = (selectedSchemeId?: string) => {
  const [colorSchemes, setColorSchemes] =
    useState<ColorScheme[]>(globalColorSchemes);
  const [isLoading, setIsLoading] = useState(globalColorSchemes.length === 0);
  const [colors, setColors] = useState({
    background: "#ffffff",
    text: "#333333",
    gradient: null as string | null,
  });

  // Load color schemes if not already loaded
  useEffect(() => {
    if (globalColorSchemes.length > 0) {
      setColorSchemes(globalColorSchemes);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      fetchColorSchemes()
        .then((schemes) => {
          console.log("useColorScheme: Loaded schemes:", schemes.length);
          setColorSchemes(schemes);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error in useColorScheme:", err);
          setIsLoading(false);
        });
    }
  }, []);

  // Update colors when schemes change or selected scheme changes
  useEffect(() => {
    if (colorSchemes.length === 0) return;

    // Find selected scheme
    const selectedScheme = selectedSchemeId
      ? colorSchemes.find((scheme) => scheme.id === selectedSchemeId)
      : colorSchemes[0];

    if (selectedScheme) {
      setColors({
        background: selectedScheme.background,
        text: selectedScheme.text,
        gradient: selectedScheme.gradient || null,
      });
    }
  }, [colorSchemes, selectedSchemeId]);

  return {
    colorSchemes,
    isLoading,
    colors,
    styles: {
      background: colors.gradient
        ? { background: colors.gradient }
        : { backgroundColor: colors.background },
      text: { color: colors.text },
    },
  };
};

/**
 * Get a background style object based on a color scheme
 */
export const getColorSchemeStyles = (
  colorSchemeId: string | undefined,
  fallbackBg = "#ffffff",
  fallbackText = "#333333"
) => {
  // Ensure we have color schemes loaded
  if (globalColorSchemes.length === 0) {
    console.warn("getColorSchemeStyles: No color schemes loaded yet");
  }

  // Find the scheme
  const scheme = globalColorSchemes.find((s) => s.id === colorSchemeId);

  if (!scheme) {
    return {
      background: { backgroundColor: fallbackBg },
      text: { color: fallbackText },
    };
  }

  return {
    background: scheme.gradient
      ? { background: scheme.gradient }
      : { backgroundColor: scheme.background },
    text: { color: scheme.text },
  };
};
