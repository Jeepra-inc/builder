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
    const sectionElement = iframe.contentDocument.querySelector(
      `[data-section="${section}"]`
    );
    if (sectionElement instanceof HTMLElement) {
      applyColorSchemeToElement(sectionElement, scheme);
    }
  }

  // Force a more reliable repaint
  try {
    // Add a temporary style to force a repaint
    const styleId = "force-color-refresh";
    let styleEl = iframe.contentDocument.getElementById(
      styleId
    ) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement("style");
      styleEl.id = styleId;
      iframe.contentDocument.head.appendChild(styleEl);
    }

    // Add a blink animation to force repaint
    styleEl.textContent = `
      @keyframes forceRepaint {
        0% { opacity: 0.99999; }
        100% { opacity: 1; }
      }
      [data-section="${section}"] {
        animation: forceRepaint 0.1s;
      }
    `;

    // Remove animation after it has run
    setTimeout(() => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    }, 100);
  } catch (e) {
    console.error("Error forcing repaint:", e);
  }

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
    // Send the update message with high priority flag
    iframe.contentWindow.postMessage(
      {
        type: "PRIORITY_COLOR_SCHEME_UPDATE", // Use priority message type
        section,
        scheme,
        timestamp: Date.now(),
      },
      "*"
    );

    // Also send a direct update message as fallback
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

/**
 * Initialize the iframe with the saved color scheme settings from settings.json
 * This function should be called when the iframe loads or the builder initializes
 */
export const initializeIframeWithSavedScheme = async (): Promise<void> => {
  try {
    // Wait for iframe to be available
    const checkForIframe = () => {
      const iframe = document.querySelector(
        "iframe"
      ) as HTMLIFrameElement | null;
      if (!iframe) {
        // If iframe not ready, retry after a short delay
        console.log("Waiting for iframe to be available...");
        setTimeout(checkForIframe, 500);
        return;
      }

      if (!iframe.contentDocument) {
        console.log("Iframe content document not ready, retrying...");
        setTimeout(checkForIframe, 500);
        return;
      }

      // Iframe is ready, proceed with initialization
      initializeSchemes(iframe);
    };

    const initializeSchemes = async (iframe: HTMLIFrameElement) => {
      console.log("Initializing iframe with saved color scheme settings...");

      try {
        // Load settings.json to get saved color scheme
        const response = await fetch("/settings.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch settings.json: ${response.status}`);
        }

        const data = await response.json();
        const savedScheme = data.headerSettings?.topBarColorScheme || "light";
        console.log(`Found saved color scheme: ${savedScheme}`);

        // Apply the color scheme to the iframe
        applyColorSchemeToIframe(iframe, "topBar", savedScheme);
        sendColorSchemeUpdateToIframe(iframe, "topBar", savedScheme);

        // Set the CSS variable
        iframe.contentDocument?.documentElement.style.setProperty(
          "--top-bar-color-scheme",
          savedScheme,
          "important"
        );

        // Get scheme details from either settings or default mapping
        let schemeDetails;

        if (data.globalStyles?.colors?.schemes) {
          // Try to find the scheme in the global schemes
          schemeDetails = data.globalStyles.colors.schemes.find(
            (s: any) => s.id === savedScheme
          );
        }

        // If not found in global schemes, use default mapping
        if (!schemeDetails) {
          schemeDetails = colorSchemes[savedScheme] || colorSchemes.light;
        }

        // Apply the color values as CSS variables
        applySchemeColorsAsVariables(iframe, schemeDetails, savedScheme);

        console.log("Successfully initialized iframe with saved color scheme");
      } catch (error) {
        console.error("Error initializing iframe with saved scheme:", error);
      }
    };

    // Start the initialization process
    checkForIframe();
  } catch (error) {
    console.error("Error in initializeIframeWithSavedScheme:", error);
  }
};

/**
 * Apply scheme colors as CSS variables to the iframe
 */
const applySchemeColorsAsVariables = (
  iframe: HTMLIFrameElement,
  scheme: any,
  schemeId: string
): void => {
  if (!iframe.contentDocument) return;

  console.log("Applying scheme colors as variables:", scheme);

  // Get colors from the scheme, or use defaults
  const background = scheme.background || scheme.backgroundColor || "#ffffff";
  const text = scheme.text || scheme.color || "#333333";
  const borderColor = scheme.borderColor || "#e5e5e5";

  // Set CSS variables in the iframe
  const style = iframe.contentDocument.documentElement.style;
  style.setProperty("--topbar-bg", background, "important");
  style.setProperty("--topbar-color", text, "important");
  style.setProperty("--topbar-border-color", borderColor, "important");

  if (scheme.gradient) {
    style.setProperty("--topbar-gradient", scheme.gradient, "important");
  }

  // Apply styles directly to the top bar for immediate effect
  const topBar = iframe.contentDocument.querySelector("#topBar") as HTMLElement;
  if (topBar) {
    // Create and apply a style element
    let styleEl = iframe.contentDocument.getElementById(
      "topbar-colors-style"
    ) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement("style");
      styleEl.id = "topbar-colors-style";
      iframe.contentDocument.head.appendChild(styleEl);
    }

    const cssContent = `
      #topBar {
        background: var(--topbar-bg, ${background}) !important;
        color: var(--topbar-color, ${text}) !important;
        border-color: var(--topbar-border-color, ${borderColor}) !important;
        ${
          scheme.gradient
            ? `background: var(--topbar-gradient) !important;`
            : ""
        }
      }
      #topBar a {
        color: var(--topbar-color, ${text}) !important;
      }
    `;

    styleEl.textContent = cssContent;

    // Also notify the iframe via postMessage
    iframe.contentWindow?.postMessage(
      {
        type: "SET_TOPBAR_COLORS",
        colors: {
          background,
          text,
          borderColor,
          gradient: scheme.gradient,
        },
        timestamp: Date.now(),
      },
      "*"
    );
  }
};
