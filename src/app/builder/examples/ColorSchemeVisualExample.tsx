"use client";

import React, { useState, useEffect } from "react";
import { ColorSchemeSelector } from "../components/ColorSchemeSelector";
import {
  ColorScheme,
  fetchColorSchemes,
  getColorSchemeStyles,
} from "../utils/colorSchemeUtils";

/**
 * Example component that demonstrates the visual color scheme selector
 */
const ColorSchemeVisualExample: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [styles, setStyles] = useState<{
    background: React.CSSProperties;
    text: React.CSSProperties;
  }>({
    background: { backgroundColor: "#ffffff" },
    text: { color: "#333333" },
  });

  // Load color schemes
  useEffect(() => {
    fetchColorSchemes()
      .then((schemes) => {
        setColorSchemes(schemes);
        setIsLoading(false);

        // Set default selected scheme if available
        if (schemes.length > 0 && !selectedScheme) {
          setSelectedScheme(schemes[0].id);
        }
      })
      .catch((error) => {
        console.error("Error loading color schemes:", error);
        setIsLoading(false);
      });
  }, []);

  // Update styles when selected scheme changes
  useEffect(() => {
    if (selectedScheme) {
      const newStyles = getColorSchemeStyles(selectedScheme);
      setStyles(newStyles);
    }
  }, [selectedScheme]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Visual Color Scheme Selector</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. Select a Color Scheme</h2>
        <div className="mb-6">
          <ColorSchemeSelector
            value={selectedScheme}
            onChange={setSelectedScheme}
            width="w-full md:w-[360px]"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. Preview Result</h2>
        <div className="p-6 rounded-lg shadow-md" style={styles.background}>
          <h3 className="text-2xl font-bold mb-4" style={styles.text}>
            Content Preview with Selected Scheme
          </h3>
          <p className="mb-4" style={styles.text}>
            This content automatically uses the selected color scheme. The
            background and text colors are applied based on the scheme you
            selected above.
          </p>
          <div
            className="p-4 rounded bg-opacity-10"
            style={{ backgroundColor: styles.text.color, opacity: 0.1 }}
          >
            <p style={styles.text}>
              You can see how different schemes affect the appearance of your
              content. Choose a scheme that matches your brand and creates good
              contrast for readability.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">
          3. Implementation Details
        </h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-2 text-sm">
            This example uses the new visual ColorSchemeSelector component which
            provides:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-1">
            <li>Visual previews of each color scheme</li>
            <li>Search functionality for finding schemes</li>
            <li>Preview of the selected scheme in the trigger button</li>
            <li>Better user experience than a standard select dropdown</li>
          </ul>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        <p className="font-medium">How to use in your components:</p>
        <p className="mt-2">
          1. Set the <code className="bg-blue-100 px-1 rounded">id</code> of the
          setting to{" "}
          <code className="bg-blue-100 px-1 rounded">"colorScheme"</code>
          <br />
          2. The custom input will automatically be used for that setting
          <br />
          3. Users will see this visual selector instead of a basic dropdown
        </p>
      </div>
    </div>
  );
};

export default ColorSchemeVisualExample;
