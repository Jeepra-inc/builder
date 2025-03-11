import { HeaderSettings } from "../types";

/**
 * Generate HTML for the account component based on settings
 */
export const generateAccountHTML = (settings: HeaderSettings): string => {
  const { account } = settings;

  // Default account settings
  const defaultAccount = {
    showText: true,
    text: "Account",
    showIcon: true,
    style: "default",
    iconSize: "medium",
    iconStyle: "default",
    dropdownEnabled: true,
    loginEnabled: true,
    registerEnabled: true,
    loginUrl: "/login",
    registerUrl: "/register",
  };

  // Merge default settings with user settings
  const accountSettings = { ...defaultAccount, ...(account || {}) };

  // Determine icon size
  let iconSize = "24";
  if (accountSettings.iconSize === "small") iconSize = "18";
  if (accountSettings.iconSize === "medium") iconSize = "24";
  if (accountSettings.iconSize === "large") iconSize = "30";
  if (accountSettings.iconSize === "xlarge") iconSize = "36";

  // Determine class based on style
  let containerClass = "account-icon flex items-center gap-2";
  if (accountSettings.style === "button") {
    containerClass +=
      " px-4 py-2 bg-primary text-primary-foreground rounded-md";
  } else if (accountSettings.style === "text") {
    containerClass += " text-only";
  }

  // Build the HTML
  let html = `<div class="${containerClass}">`;

  // Add icon if enabled AND not using text-only style
  if (accountSettings.showIcon && accountSettings.style !== "text") {
    // Base SVG path for the user icon
    const userIconPath = `
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    `;

    // Different icon styles
    switch (accountSettings.iconStyle) {
      case "plain":
        // Just the icon
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>`;
        break;
      case "circle":
        // Icon in blue circle
        html += `<div class="rounded-full bg-blue-400 p-1 flex items-center justify-center" style="width:${
          Number(iconSize) + 8
        }px;height:${Number(iconSize) + 8}px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                </div>`;
        break;
      case "square":
        // Icon in blue square
        html += `<div class="rounded-md bg-blue-400 p-1 flex items-center justify-center" style="width:${
          Number(iconSize) + 8
        }px;height:${Number(iconSize) + 8}px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                </div>`;
        break;
      case "outline-circle":
        // Icon with circular outline
        html += `<div class="rounded-full border-2 border-blue-400 p-1 flex items-center justify-center" style="width:${
          Number(iconSize) + 10
        }px;height:${Number(iconSize) + 10}px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                </div>`;
        break;
      case "outline-square":
        // Icon with square outline
        html += `<div class="rounded-md border-2 border-blue-400 p-1 flex items-center justify-center" style="width:${
          Number(iconSize) + 10
        }px;height:${Number(iconSize) + 10}px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                </div>`;
        break;
      case "solid-bg":
        // Icon with solid blue background (rectangle)
        html += `<div class="rounded-md bg-blue-400 p-2 flex items-center justify-center" style="width:${
          Number(iconSize) + 16
        }px;height:${Number(iconSize) + 12}px">
                  <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>
                </div>`;
        break;
      default:
        // Default plain icon
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${userIconPath}</svg>`;
    }
  }

  // Add text if enabled
  if (accountSettings.showText) {
    html += `<span>${accountSettings.text}</span>`;
  }

  html += "</div>";

  // Add dropdown if enabled
  if (accountSettings.dropdownEnabled) {
    html +=
      '<div class="account-dropdown absolute z-10 mt-2 w-48 py-1 bg-white rounded-md shadow-lg hidden group-hover:block">';

    if (accountSettings.loginEnabled) {
      html += `<a href="${accountSettings.loginUrl}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</a>`;
    }

    if (accountSettings.registerEnabled) {
      html += `<a href="${accountSettings.registerUrl}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</a>`;
    }

    html += "</div>";
  }

  return html;
};
