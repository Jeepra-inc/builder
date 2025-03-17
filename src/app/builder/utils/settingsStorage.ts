import { Section } from "../types";

// Define the structure of our global settings
export interface GlobalSettings {
  sections: Section[];
  headerSettings: any;
  footerSettings: any;
  globalLayout?: {
    pageWidth: string;
    [key: string]: any;
  };
  globalStyles: {
    colors: any;
    typography: {
      headingFont: string;
      bodyFont: string;
      headingSizeScale: number;
      bodySizeScale: number;
      headingColor: string;
    };
    customCSS: string;
    branding: {
      logoUrl: string;
      logoWidth: number;
      faviconUrl: string;
      backgroundColor: string;
    };
  };
  version: string;
}

// Default settings
export const defaultSettings: GlobalSettings = {
  sections: [],
  headerSettings: {
    logo: {
      text: "Your Brand",
      showText: true,
    },
    navigation: {
      items: [
        { text: "Home", url: "#", isButton: false },
        { text: "About", url: "#", isButton: false },
        { text: "Contact", url: "#", isButton: true },
      ],
    },
    layout: {
      sticky: true,
      maxWidth: "1200px",
    },
  },
  globalLayout: {
    pageWidth: "1200px",
  },
  footerSettings: {
    content: {
      copyright: " 2024 Your Company. All rights reserved.",
      description: "Building amazing websites with ease",
    },
    links: {
      items: [
        { text: "About Us", url: "#" },
        { text: "Contact", url: "#" },
        { text: "Privacy Policy", url: "#" },
      ],
    },
    layout: {
      maxWidth: "1200px",
      showSocials: true,
      multiColumn: true,
    },
  },
  globalStyles: {
    colors: {
      schemes: [],
    },
    typography: {
      headingFont: "Assistant",
      bodyFont: "Assistant",
      headingSizeScale: 100,
      bodySizeScale: 100,
      headingColor: "#1a1a1a",
    },
    customCSS: "",
    branding: {
      logoUrl: "",
      logoWidth: 90,
      faviconUrl: "",
      backgroundColor: "#ffffff",
    },
  },
  version: "1.0.0",
};

// Storage key for localStorage
const STORAGE_KEY = "visual-builder-settings";

// Flag to track when settings are being saved explicitly
let isExplicitSave = false;

// Save settings to localStorage and file
export const saveSettings = async (
  settings: GlobalSettings,
  options?: { skipCSSUpdate?: boolean }
): Promise<void> => {
  try {
    // Mark that we're in an explicit save operation
    isExplicitSave = true;

    // Make sure we have the proper structure for color schemes
    if (!settings.globalStyles) {
      settings.globalStyles = {
        colors: {
          schemes: [],
        },
        typography: {
          headingFont: "Assistant",
          bodyFont: "Assistant",
          headingSizeScale: 100,
          bodySizeScale: 100,
          headingColor: "#1a1a1a",
        },
        customCSS: "",
        branding: {
          logoUrl: "",
          logoWidth: 90,
          faviconUrl: "",
          backgroundColor: "#ffffff",
        },
      };
    }

    if (!settings.globalStyles.colors) {
      settings.globalStyles.colors = {
        schemes: [],
      };
    }

    if (!settings.globalStyles.colors.schemes) {
      settings.globalStyles.colors.schemes = [];
    }

    // Added detailed logging for header settings
    console.log(" [saveSettings] Starting to save settings...", {
      hasGlobalStyles: !!settings.globalStyles,
      hasColors: !!settings.globalStyles?.colors,
      hasSchemes: !!settings.globalStyles?.colors?.schemes,
      schemeCount: settings.globalStyles?.colors?.schemes?.length,
      headerSettings: {
        ...settings.headerSettings,
        topBarVisible: settings.headerSettings?.topBarVisible,
      },
    });

    // Ensure topBarVisible is properly set in headerSettings
    if (
      settings.headerSettings &&
      typeof settings.headerSettings.topBarVisible !== "boolean"
    ) {
      // Try to convert to boolean if it's a string
      if (typeof settings.headerSettings.topBarVisible === "string") {
        settings.headerSettings.topBarVisible =
          settings.headerSettings.topBarVisible === "true" ? true : false;
      } else {
        // Use default value if it's not set
        settings.headerSettings.topBarVisible =
          settings.headerSettings.topBarVisible === undefined
            ? true
            : !!settings.headerSettings.topBarVisible;
      }
      console.log(
        " [saveSettings] Fixed topBarVisible type:",
        settings.headerSettings.topBarVisible
      );
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    console.log(" [saveSettings] Settings saved to localStorage successfully", {
      headerTopBarVisible: settings.headerSettings?.topBarVisible,
    });

    // Also save to public directory as JSON file
    console.log(" [saveSettings] Calling saveSettingsToFile...", {
      headerTopBarVisible: settings.headerSettings?.topBarVisible,
    });
    await saveSettingsToFile(settings);
    console.log(" [saveSettings] Settings saved to file successfully");

    // Update CSS variables ONLY during explicit save operations and if not skipped
    if (!options?.skipCSSUpdate) {
      console.log(
        " [saveSettings] Updating CSS variables during explicit save..."
      );
      await updateCSSVariables(settings);
      console.log(" [saveSettings] CSS variables updated successfully");
    } else {
      console.log(" [saveSettings] Skipping CSS variables update as requested");
    }

    return Promise.resolve();
  } catch (error) {
    console.error(" [saveSettings] Failed to save settings:", error);
    return Promise.reject(error);
  } finally {
    // Reset the explicit save flag
    isExplicitSave = false;
  }
};

// Save settings to a JSON file in the public directory
export const saveSettingsToFile = async (
  settings: GlobalSettings
): Promise<void> => {
  try {
    console.log(" [saveSettingsToFile] Starting API call to save settings...");

    // Log information about the data being saved
    console.log(" [saveSettingsToFile] Settings prepared:", {
      hasGlobalStyles: !!settings.globalStyles,
      hasColors: !!settings.globalStyles?.colors,
      hasSchemes: !!settings.globalStyles?.colors?.schemes?.length,
      schemeCount: settings.globalStyles?.colors?.schemes?.length,
      headerSettings: {
        hasTopBarVisible: settings.headerSettings?.topBarVisible !== undefined,
        topBarVisible: settings.headerSettings?.topBarVisible,
        topBarVisibleType: typeof settings.headerSettings?.topBarVisible,
      },
    });

    // Ensure all important properties are properly set before saving
    if (settings.headerSettings) {
      console.log(
        " [saveSettingsToFile] Validating headerSettings before save"
      );

      // Ensure topBarVisible is a boolean - use strict equality check
      const topBarVisibleOriginal = settings.headerSettings.topBarVisible;
      settings.headerSettings.topBarVisible = topBarVisibleOriginal === true;

      console.log(
        ` [saveSettingsToFile] Set topBarVisible: ${
          settings.headerSettings.topBarVisible
        } (${typeof settings.headerSettings.topBarVisible})`
      );
    }

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(" [saveSettingsToFile] API response not OK:", {
        status: response.status,
        statusText: response.statusText,
        responseText: errorText,
      });
      throw new Error(
        `Failed to save settings file: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log(" [saveSettingsToFile] Settings saved to file successfully:", {
      responseData,
      savedTopBarVisible: settings.headerSettings?.topBarVisible,
    });

    // Show success message
    // alert('Settings have been saved successfully to the public/settings.json file!');
  } catch (error) {
    console.error(
      " [saveSettingsToFile] Failed to save settings to file:",
      error
    );
    throw error;
  }
};

// Load settings from localStorage or file
export const loadSettings = async (): Promise<GlobalSettings> => {
  try {
    // First try to load from localStorage for current session data
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }

    // If not in localStorage, try to load from the saved file
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const fileSettings = await response.json();
        // Save to localStorage for future use
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fileSettings));
        return fileSettings;
      }
    } catch (fileError) {
      console.error("Failed to load settings from file:", fileError);
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return defaultSettings;
};

// Synchronous version for components that can't use async
export const loadSettingsSync = (): GlobalSettings => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Failed to load settings synchronously:", error);
  }
  return defaultSettings;
};

// Export settings as a JSON file for download
export const exportSettings = (settings: GlobalSettings): void => {
  try {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "global-settings.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error("Failed to export settings:", error);
  }
};

// Import settings from a JSON file
export const importSettings = (file: File): Promise<GlobalSettings> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result as string);
        // Validate the imported settings
        if (!settings.version) {
          reject(new Error("Invalid settings file: missing version"));
          return;
        }
        resolve(settings);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

// Load settings from a URL (for loading from public folder)
export const loadSettingsFromUrl = async (
  url: string
): Promise<GlobalSettings> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load settings from ${url}: ${response.statusText}`
      );
    }
    const settings = await response.json();

    // Validate the settings
    if (!settings.version) {
      throw new Error("Invalid settings file: missing version");
    }

    return settings;
  } catch (error) {
    console.error("Failed to load settings from URL:", error);
    return defaultSettings;
  }
};

// Get available settings files from public folder
export const getAvailableSettingsFiles = async (): Promise<string[]> => {
  try {
    // In a real application, you would have an API endpoint to list files
    // For this demo, we'll return hardcoded values
    return ["default", "modern-theme", "dark-theme"];
  } catch (error) {
    console.error("Failed to get available settings files:", error);
    return ["default"];
  }
};

// Validate imported settings
export const validateSettings = (settings: any): settings is GlobalSettings => {
  // Basic validation
  if (!settings || typeof settings !== "object") {
    return false;
  }

  // Check required top-level properties
  const requiredProps = [
    "version",
    "sections",
    "headerSettings",
    "footerSettings",
    "globalStyles",
  ];
  for (const prop of requiredProps) {
    if (!(prop in settings)) {
      return false;
    }
  }

  // Check globalStyles structure
  const globalStyles = settings.globalStyles;
  if (!globalStyles || typeof globalStyles !== "object") {
    return false;
  }

  // Check typography
  const typography = globalStyles.typography;
  if (!typography || typeof typography !== "object") {
    return false;
  }

  // Check branding
  const branding = globalStyles.branding;
  if (!branding || typeof branding !== "object") {
    return false;
  }

  return true;
};

// Update CSS variables in main.css file
export const updateCSSVariables = async (
  settings: GlobalSettings
): Promise<void> => {
  // Only allow updates during explicit save operations
  if (!isExplicitSave) {
    console.log(
      " [updateCSSVariables] Skipping - not an explicit save operation"
    );
    return Promise.resolve();
  }

  try {
    console.log(
      " [updateCSSVariables] Starting API call to update CSS variables..."
    );

    const response = await fetch("/api/css-variables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(" [updateCSSVariables] API response not OK:", {
        status: response.status,
        statusText: response.statusText,
        responseText: errorText,
      });
      throw new Error(
        `Failed to update CSS variables: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log(
      " [updateCSSVariables] CSS variables updated successfully:",
      responseData
    );
  } catch (error) {
    console.error(
      " [updateCSSVariables] Failed to update CSS variables:",
      error
    );
    throw error;
  }
};
