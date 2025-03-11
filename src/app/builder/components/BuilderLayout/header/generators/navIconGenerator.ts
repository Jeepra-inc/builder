import { HeaderSettings } from "../types";

/**
 * Generate HTML for the navigation icon component based on settings
 */
export const generateNavIconHTML = (settings: HeaderSettings): string => {
  // Get nav icon settings with defaults
  const navIconSettings = settings.navIcon || {
    show: true,
    type: "hamburger",
    showText: true,
    text: "Menu",
    position: "right",
    drawerEffect: "slide",
    drawerDirection: "left",
    iconSize: "24px",
    iconColor: "#333333",
    textColor: "#333333",
  };

  // Return empty if nav icon is disabled
  if (navIconSettings.show === false) {
    return "";
  }

  // Generate different icon SVGs based on type
  let iconSvg = "";
  switch (navIconSettings.type) {
    case "chevron":
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l6-6-6-6"></path>
      </svg>`;
      break;
    case "dots":
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
      </svg>`;
      break;
    case "justify":
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>`;
      break;
    default: // hamburger
      iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${navIconSettings.iconSize}" height="${navIconSettings.iconSize}" viewBox="0 0 24 24" fill="none" stroke="${navIconSettings.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"></line>
        <line x1="4" y1="12" x2="20" y2="12"></line>
        <line x1="4" y1="18" x2="20" y2="18"></line>
      </svg>`;
  }

  // Create timestamp to force re-renders
  const timestamp = Date.now();

  // Generate text HTML if enabled
  const textHtml = navIconSettings.showText
    ? `<span style="color: ${
        navIconSettings.textColor || "#333333"
      };" class="nav-icon-text">${navIconSettings.text}</span>`
    : "";

  // Generate HTML for nav icon button with appropriate positioning
  let navIconHtml = "";
  if (navIconSettings.position === "left") {
    navIconHtml = `
      <div class="nav-icon-container" data-timestamp="${timestamp}" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;" data-drawer-effect="${navIconSettings.drawerEffect}" data-drawer-direction="${navIconSettings.drawerDirection}">
        <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
          ${iconSvg}
          ${textHtml}
        </div>
      </div>
    `;
  } else {
    navIconHtml = `
      <div class="nav-icon-container" data-timestamp="${timestamp}" data-item-id="nav_icon" style="display: flex; align-items: center; cursor: pointer;" data-drawer-effect="${navIconSettings.drawerEffect}" data-drawer-direction="${navIconSettings.drawerDirection}">
        <div class="nav-icon-button" style="display: flex; align-items: center; gap: 8px;">
          ${textHtml}
          ${iconSvg}
        </div>
      </div>
    `;
  }

  return navIconHtml;
};
