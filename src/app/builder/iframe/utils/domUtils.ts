// DOM utility functions to reduce duplication in the iframe page

// Font loading utilities
export const loadGoogleFont = (
  fontFamily: string,
  weight: string = "400"
): void => {
  // Skip if already loaded
  const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(
    / /g,
    "+"
  )}:wght@${weight}&display=swap`;

  // Check if this font is already loaded
  for (let i = 0; i < existingLinks.length; i++) {
    const link = existingLinks[i];
    if (link.getAttribute("href") === fontUrl) {
      return; // Font already loaded
    }
  }

  // Load the font
  const link = document.createElement("link");
  link.href = fontUrl;
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Logo size utilities
export const getLogoSizeFromWidth = (width: number): string => {
  if (width <= 50) return "small";
  if (width <= 100) return "medium";
  if (width <= 150) return "large";
  return "xlarge";
};

// Font extraction utility
export const extractFontFamily = (fontValue: string): string => {
  // Handle cases like "16px 'Arial'" or "'Roboto', sans-serif"
  const matches = fontValue.match(/'([^']+)'|"([^"]+)"/);
  if (matches) {
    return matches[1] || matches[2];
  }

  // Handle simple font name
  return fontValue.split(",")[0].trim();
};

// Create a drawer overlay
export const createDrawerOverlay = (): HTMLDivElement => {
  const overlay = document.createElement("div");
  overlay.className = "drawer-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "9998";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.3s ease";

  // Show it after a small delay to allow for transition
  setTimeout(() => {
    overlay.style.opacity = "1";
  }, 10);

  return overlay;
};

// Attach close functionality to drawer
export const attachDrawerCloseHandlers = (
  drawerElement: HTMLElement | null,
  overlayElement: HTMLElement | null
): void => {
  if (!drawerElement || !overlayElement) return;

  // Create close button if it doesn't exist
  let closeBtn = drawerElement.querySelector(
    ".drawer-close"
  ) as HTMLElement | null;
  if (!closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.className = "drawer-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    closeBtn.style.fontSize = "24px";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    drawerElement.appendChild(closeBtn);
  }

  // Define close function
  const closeDrawer = () => {
    if (drawerElement && overlayElement) {
      drawerElement.style.transform = "translateX(-100%)";
      overlayElement.style.opacity = "0";

      // Remove after transition completes
      setTimeout(() => {
        if (overlayElement.parentNode) {
          overlayElement.parentNode.removeChild(overlayElement);
        }
        drawerElement.style.display = "none";
      }, 300);
    }
  };

  // Attach event listeners
  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }

  overlayElement.addEventListener("click", closeDrawer);
};
