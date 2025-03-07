import React, { useState, useEffect } from "react";
import {
  useColorScheme,
  addColorSchemesToSchema,
  getColorSchemeStyles,
  fetchColorSchemes,
  ColorScheme,
} from "../utils/colorSchemeUtils";
import { SectionSchema, SectionType } from "../types";

/**
 * Example component showing how to use the colorSchemeUtils
 *
 * This component demonstrates three ways to use color schemes:
 * 1. Using the useColorScheme hook
 * 2. Using the getColorSchemeStyles utility function
 * 3. Initializing a schema and using addColorSchemesToSchema
 */
const ColorSchemeExample: React.FC = () => {
  // Example 1: Using the useColorScheme hook
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const { styles, isLoading, colorSchemes } = useColorScheme(selectedScheme);

  // Example 2: Direct usage of getColorSchemeStyles
  const [directSchemeId, setDirectSchemeId] = useState<string>("");
  const [directStyles, setDirectStyles] = useState<{
    background: any;
    text: any;
  }>({
    background: {},
    text: {},
  });

  // Update direct styles when directSchemeId changes
  useEffect(() => {
    if (directSchemeId) {
      const styles = getColorSchemeStyles(directSchemeId);
      setDirectStyles(styles);
    }
  }, [directSchemeId]);

  // Example 3: Schema initialization
  // Define a basic schema for a component
  const exampleSchema: SectionSchema = {
    name: "Example Component",
    type: SectionType.Banner,
    schema: [
      {
        id: "title",
        type: "text",
        label: "Title",
        default: "Example Title",
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
    ],
  };

  // Initialize the schema with color schemes - immediate approach
  useEffect(() => {
    // This demonstrates one approach - immediate load on component mount
    fetchColorSchemes().then((schemes) => {
      if (schemes.length > 0) {
        console.log(
          "Example: Initializing schema with color schemes:",
          schemes.length
        );
        const colorSchemeSetting = exampleSchema.settings?.find(
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
            "Example: Updated colorScheme options:",
            colorSchemeSetting.options
          );
        }
      }
    });
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Color Scheme Utilities Demo</h1>

      {/* Example 0: Debug Info */}
      <section className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
        <div className="text-sm">
          <p>Available Color Schemes: {colorSchemes.length}</p>
          <p>Current Selection: {selectedScheme || "(none)"}</p>
          <p>Loading State: {isLoading ? "Loading..." : "Loaded"}</p>
        </div>
      </section>

      {/* Example 1: Using the useColorScheme hook */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Example 1: Using useColorScheme hook
        </h2>
        {isLoading ? (
          <p>Loading color schemes...</p>
        ) : (
          <>
            <select
              className="border p-2 rounded mb-4"
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
            >
              <option value="">Select a color scheme</option>
              {colorSchemes.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name || `Scheme ${scheme.id}`}
                </option>
              ))}
            </select>

            <div className="p-6 rounded-lg" style={styles.background}>
              <h3 className="text-lg font-medium mb-2" style={styles.text}>
                Content with Applied Color Scheme
              </h3>
              <p style={styles.text}>
                This text and background are styled using the useColorScheme
                hook.
              </p>
            </div>
          </>
        )}
      </section>

      {/* Example 2: Using the getColorSchemeStyles utility */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Example 2: Using getColorSchemeStyles directly
        </h2>
        <select
          className="border p-2 rounded mb-4"
          value={directSchemeId}
          onChange={(e) => setDirectSchemeId(e.target.value)}
        >
          <option value="">Select a color scheme</option>
          {colorSchemes.map((scheme) => (
            <option key={scheme.id} value={scheme.id}>
              {scheme.name || `Scheme ${scheme.id}`}
            </option>
          ))}
        </select>

        <div className="p-6 rounded-lg" style={directStyles.background}>
          <h3 className="text-lg font-medium mb-2" style={directStyles.text}>
            Direct Style Application
          </h3>
          <p style={directStyles.text}>
            This content is styled using the getColorSchemeStyles utility
            function directly.
          </p>
        </div>
      </section>

      {/* Example 3: Schema initialization */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Example 3: Schema Initialization
        </h2>
        <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap overflow-auto max-h-96">
          {JSON.stringify(exampleSchema, null, 2)}
        </pre>
        <p className="mt-2 text-gray-600">
          The schema's colorScheme options are populated automatically by using
          fetchColorSchemes. This can be done at component definition time or
          during component initialization.
        </p>

        <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-2">
            Recommended Approach
          </h3>
          <p className="text-sm text-blue-700">
            1. Define your schema with empty colorScheme options
            <br />
            2. Initialize options immediately on module load using
            fetchColorSchemes
            <br />
            3. Use addColorSchemesToSchema as a fallback for notification
            <br />
            4. Use the useColorScheme hook in your component
            <br />
          </p>
        </div>
      </section>
    </div>
  );
};

export default ColorSchemeExample;
