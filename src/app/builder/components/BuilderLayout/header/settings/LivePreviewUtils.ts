/**
 * Utility functions for live preview of color schemes in the builder
 */

// Define the color schemes available in the application
export interface SchemeStyle {
  backgroundColor: string;
  color: string;
  borderColor?: string;
}

export const colorSchemes: Record<string, SchemeStyle> = {
  light: {
    backgroundColor: "#ffffff",
    color: "#333333",
    borderColor: "#e5e5e5",
  },
  dark: {
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    borderColor: "#444444",
  },
  "scheme-1": {
    backgroundColor: "#f8f9fa",
    color: "#212529",
    borderColor: "#dee2e6",
  },
  "scheme-2": {
    backgroundColor: "#212529",
    color: "#f8f9fa",
    borderColor: "#495057",
  },
  "scheme-3": {
    backgroundColor: "#6c757d",
    color: "#ffffff",
    borderColor: "#adb5bd",
  },
  "scheme-4": {
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    borderColor: "#cbd5e1",
  },
};

/**
 * Apply a color scheme to an HTML element
 */
export const applyColorSchemeToElement = (
  element: HTMLElement,
  scheme: string
): void => {
  // Get the styles for the selected scheme (default to light if not found)
  const styles = colorSchemes[scheme] || colorSchemes["light"];

  // Apply the styles directly to the element
  element.style.backgroundColor = styles.backgroundColor;
  element.style.color = styles.color;
  if (styles.borderColor) {
    element.style.borderColor = styles.borderColor;
  }

  console.log(`Applied ${scheme} scheme to element:`, styles);
};

/**
 * Apply a color scheme to the iframe document
 */
export const applyColorSchemeToIframe = (
  iframe: HTMLIFrameElement,
  section: string,
  scheme: string
): void => {
  if (!iframe.contentDocument) return;

  // Apply to document CSS variables
  iframe.contentDocument.documentElement.style.setProperty(
    `--${section}-bar-color-scheme`,
    scheme,
    "important"
  );

  // Update header attribute
  const header = iframe.contentDocument.querySelector("header");
  if (header) {
    header.setAttribute(`data-${section}-scheme`, scheme);

    // Apply to the specific section element
    const sectionElement = header.querySelector(`[data-section="${section}"]`);
    if (sectionElement instanceof HTMLElement) {
      applyColorSchemeToElement(sectionElement, scheme);
    }
  }

  // Force a repaint for immediate visual update
  iframe.contentDocument.body.offsetHeight;

  console.log(`Applied ${scheme} scheme to ${section} section in iframe`);
};

/**
 * Save a color scheme selection to localStorage for persistence
 */
export const saveColorSchemeToStorage = (
  section: string,
  scheme: string
): void => {
  try {
    const storageKey = `${section}_bar_color_scheme_preview`;
    localStorage.setItem(storageKey, scheme);
    console.log(
      `Saved ${scheme} color scheme for ${section} to localStorage with key: ${storageKey}`
    );

    // Also save with alternate key format for compatibility
    const altKey = `${section}bar_color_scheme_preview`;
    if (storageKey !== altKey) {
      localStorage.setItem(altKey, scheme);
      console.log(`Also saved to alternate key: ${altKey}`);
    }
  } catch (error) {
    console.error("Error saving color scheme to localStorage:", error);
  }
};

/**
 * Send a color scheme update message to the iframe
 */
export const sendColorSchemeUpdateToIframe = (
  iframe: HTMLIFrameElement,
  section: string,
  scheme: string
): void => {
  if (!iframe.contentWindow) {
    console.error("No contentWindow found on iframe");
    return;
  }

  try {
    // Send the update message
    iframe.contentWindow.postMessage(
      {
        type: "DIRECT_COLOR_SCHEME_UPDATE",
        section,
        scheme,
        timestamp: Date.now(),
      },
      "*"
    );

    // Also send a refresh message to ensure all components are updated
    iframe.contentWindow.postMessage(
      {
        type: "REFRESH_COLOR_SCHEMES",
        timestamp: Date.now(),
      },
      "*"
    );

    console.log(`Sent color scheme update to iframe: ${section} -> ${scheme}`);
  } catch (error) {
    console.error("Error sending color scheme update to iframe:", error);
  }
};
