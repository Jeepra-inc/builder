import { useEffect, useRef, useCallback } from "react";
import { HeaderSettings, FooterSettings, Section } from "../types";
import { sendMessageToParent } from "../utils/messageUtils";

// Helper function to load Google fonts
export const loadGoogleFont = (fontFamily: string, weight = "400") => {
  const fontId = `${fontFamily}-${weight}`;
  const loadingFonts = new Set<string>();

  if (
    !document.getElementById(`google-font-${fontId}`) &&
    !loadingFonts.has(fontId)
  ) {
    try {
      loadingFonts.add(fontId);
      const link = document.createElement("link");
      link.id = `google-font-${fontId}`;
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
        / /g,
        "+"
      )}:wght@${weight}&display=swap`;
      link.rel = "stylesheet";

      link.onload = () => {
        console.log(
          `Successfully loaded Google Font: ${fontFamily} (weight: ${weight})`
        );
        loadingFonts.delete(fontId);

        // Force a repaint to ensure the font is applied
        document.body.style.opacity = "0.99";
        setTimeout(() => {
          document.body.style.opacity = "1";
        }, 50);
      };

      link.onerror = () => {
        console.error(
          `Failed to load Google Font: ${fontFamily} (weight: ${weight})`
        );
        loadingFonts.delete(fontId);
      };

      // Add the link to the document head
      document.head.appendChild(link);
      console.log(`Loading Google Font: ${fontFamily} (weight: ${weight})`);
    } catch (error) {
      console.error(`Error loading font ${fontFamily}:`, error);
      loadingFonts.delete(fontId);
    }
  }
};

/**
 * Custom hook to manage all iframe effects
 *
 * @param params Object containing all necessary state and functions
 * @returns Object with any additional handlers or state needed
 */
export const useIframeEffects = ({
  headerSettings,
  setHeaderSettings,
  footerSettings,
  setFooterSettings,
  sections,
  setLocalSections,
  dispatch,
  processingParentSettings,
  initializeAllSettingsFromJson,
}: {
  headerSettings: HeaderSettings;
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>;
  footerSettings: FooterSettings;
  setFooterSettings: React.Dispatch<React.SetStateAction<FooterSettings>>;
  sections: Section[];
  setLocalSections: React.Dispatch<React.SetStateAction<Section[]>>;
  dispatch: any; // Replace with proper type from sectionReducer
  processingParentSettings: React.MutableRefObject<boolean>;
  initializeAllSettingsFromJson: () => void;
}) => {
  // Track if initial settings have been loaded
  const initialSettingsLoaded = useRef(false);
  const headerSettingsChecked = useRef(false);
  const headerSettingsStringified = useRef("");
  const sendingToParent = useRef(false);
  const lastSentHeaderSettings = useRef<string>("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Create a safe message sender with debounce
  const sendHeaderSettingsToParent = useCallback(() => {
    // Skip if already sending or processing parent settings
    if (sendingToParent.current || processingParentSettings.current) {
      return;
    }

    // Stringify current settings for comparison
    const currentSettingsString = JSON.stringify(headerSettings);

    // Only send if settings have actually changed since last send
    if (lastSentHeaderSettings.current === currentSettingsString) {
      console.log("Skipping header settings update - no changes detected");
      return;
    }

    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a debounce timer to prevent rapid updates
    debounceTimer.current = setTimeout(() => {
      // Update the last sent settings
      lastSentHeaderSettings.current = currentSettingsString;

      // Send the message
      sendMessageToParent(
        {
          type: "HEADER_SETTINGS_UPDATED",
          settings: headerSettings,
        },
        sendingToParent
      );

      debounceTimer.current = null;
    }, 300);
  }, [headerSettings, processingParentSettings]);

  // Effect to load initial fonts from CSS variables
  useEffect(() => {
    // There might be CSS variables already set in the document
    // from the initial CSS load, so let's check for them
    const computedStyle = getComputedStyle(document.documentElement);
    const headingFontFamily = computedStyle.getPropertyValue("--heading-font");
    const bodyFontFamily = computedStyle.getPropertyValue("--body-font");

    // Extract font family from the CSS value format "'Font Name', sans-serif"
    const extractFontFamily = (fontValue: string) => {
      const match = fontValue.match(/'([^']+)'/);
      return match ? match[1] : null;
    };

    const headingFont = extractFontFamily(headingFontFamily);
    const bodyFont = extractFontFamily(bodyFontFamily);

    // Load the fonts if they exist
    if (headingFont) {
      loadGoogleFont(headingFont);
      console.log(`Loaded initial heading font: ${headingFont}`);
    }

    if (bodyFont) {
      loadGoogleFont(bodyFont);
      console.log(`Loaded initial body font: ${bodyFont}`);
    }
  }, []); // Empty dependency array - only run once on mount

  // Effect to initialize settings from settings.json on first load
  useEffect(() => {
    if (!initialSettingsLoaded.current) {
      console.log("Initial load - fetching settings from settings.json");
      initializeAllSettingsFromJson();
      initialSettingsLoaded.current = true;
    }
  }, [initializeAllSettingsFromJson]);

  // Effect to log headerSettings changes for debugging
  // Only log when headerSettings actually change to prevent infinite loops
  useEffect(() => {
    const currentHeaderSettingsString = JSON.stringify(headerSettings);

    // Only log if the settings have actually changed
    if (headerSettingsStringified.current !== currentHeaderSettingsString) {
      headerSettingsStringified.current = currentHeaderSettingsString;

      console.log("Current headerSettings state:", headerSettings);
      // Check if layout and containers are properly set
      if (headerSettings.layout) {
        console.log("Current header layout:", headerSettings.layout);
        if (headerSettings.layout.containers) {
          console.log(
            "Current header containers:",
            headerSettings.layout.containers
          );
        } else {
          console.log("No containers in current header layout");
        }
      } else {
        console.log("No layout in current headerSettings");
      }
    }
  }, [headerSettings]);

  // Effect to check if the header settings are properly applied after a delay
  // Only run this check once
  useEffect(() => {
    if (!headerSettingsChecked.current) {
      // Check after a delay to ensure all settings are applied
      const checkTimer = setTimeout(() => {
        console.log("Checking if header settings are properly applied...");

        // Check if header settings have layout and containers
        if (!headerSettings.layout || !headerSettings.layout.containers) {
          console.warn(
            "Header settings are missing layout or containers after initialization"
          );

          // Try to reload settings from settings.json
          console.log("Attempting to reload settings from settings.json...");
          initializeAllSettingsFromJson();
        } else {
          console.log(
            "Header settings are properly applied with layout and containers"
          );
        }

        headerSettingsChecked.current = true;
      }, 1000);

      return () => clearTimeout(checkTimer);
    }
  }, [headerSettings, initializeAllSettingsFromJson]);

  // Effect to sync sections state with reducer state
  useEffect(() => {
    if (!processingParentSettings.current) {
      setLocalSections(sections);
    }
  }, [sections, setLocalSections, processingParentSettings]);

  return {
    sendHeaderSettingsToParent,
    sendingToParent,
  };
};
