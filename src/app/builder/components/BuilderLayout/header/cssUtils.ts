import { HeaderSettings, LayoutSettings } from "./types";
import { SectionStyles, getColorSchemeStyles } from "./styleUtils";

// Header item hover effects CSS
export const headerItemStyles = `
  .header-item-wrapper {
    position: relative;
  }
  
  .header-item-wrapper:hover {
    outline: 1px dashed #3b82f6;
    outline-offset: 2px;
  }
  
  .header-item {
    height: 100%;
    width: 100%;
  }
`;

// Function to apply CSS variables from settings
export const applyCSSVariables = (settings: HeaderSettings): void => {
  const layout = (settings?.layout as LayoutSettings) || {};

  // Apply header layout settings
  if (layout && layout.maxWidth) {
    document.documentElement.style.setProperty(
      "--header-max-width",
      layout.maxWidth
    );
  }

  if (layout && typeof layout.sticky === "boolean") {
    document.documentElement.style.setProperty(
      "--header-sticky",
      layout.sticky ? "true" : "false"
    );
  }

  // Apply color schemes
  if (settings.topBarColorScheme) {
    document.documentElement.style.setProperty(
      "--top-bar-color-scheme",
      settings.topBarColorScheme
    );
  }

  if (settings.mainBarColorScheme) {
    document.documentElement.style.setProperty(
      "--main-bar-color-scheme",
      settings.mainBarColorScheme
    );
  }

  if (settings.bottomBarColorScheme) {
    document.documentElement.style.setProperty(
      "--bottom-bar-color-scheme",
      settings.bottomBarColorScheme
    );
  }

  // Apply visibility settings
  document.documentElement.style.setProperty(
    "--top-bar-visible",
    settings.topBarVisible ? "flex" : "none"
  );
  document.documentElement.style.setProperty(
    "--bottom-bar-visible",
    settings.bottomEnabled ? "flex" : "none"
  );

  // Apply height settings
  if (settings.topBarHeight) {
    document.documentElement.style.setProperty(
      "--top-bar-height",
      `${settings.topBarHeight}px`
    );
  }
};

// Function to handle color scheme selection from messages
export const handleColorSchemeSelection = (
  event: MessageEvent,
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>,
  forceRepaint: () => void
): void => {
  if (!event.data || typeof event.data !== "object") return;

  if (event.data.type === "COLOR_SCHEME_SELECTED") {
    const { section, schemeId } = event.data;

    // Update the appropriate section's color scheme
    if (section === "top" || section === "topBar") {
      setHeaderSettings((prev) => ({
        ...prev,
        topBarColorScheme: schemeId,
      }));
    } else if (section === "main" || section === "mainBar") {
      setHeaderSettings((prev) => ({
        ...prev,
        mainBarColorScheme: schemeId,
      }));
    } else if (section === "bottom" || section === "bottomBar") {
      setHeaderSettings((prev) => ({
        ...prev,
        bottomBarColorScheme: schemeId,
      }));
    }

    // Ensure the update is reflected
    setTimeout(forceRepaint, 50);
  }
};

// Helper function to create section style object based on color scheme
// SectionStyles type and getColorSchemeStyles function moved to styleUtils.ts
