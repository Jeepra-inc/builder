import { HeaderSettings } from "./types";
import DOMPurify from "dompurify";

// Default search settings
export const defaultSearchSettings = {
  show: true,
  type: "form",
  placeholder: "Search...",
  rounded: 4,
  showText: true,
  behavior: "inline",
  design: "standard",
  style: "minimal",
  shape: "rounded",
  showIcon: true,
  iconPosition: "left",
  iconColor: "#666666",
  iconSize: "16px",
  fontSize: "14px",
  textColor: "#333333",
  width: "250px",
  showButton: false,
  buttonText: "Search",
  buttonColor: "#4a90e2",
  buttonTextColor: "#ffffff",
};

// Handle search settings updates
export const handleSearchSettingsMessage = (
  data: any,
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>,
  currentHeaderSettings: HeaderSettings
) => {
  console.log("SEARCH DEBUG: Received search settings update:", data.settings);

  // Extract the type from the update if present
  const updatedType = data.settings?.type || currentHeaderSettings.search?.type;
  console.log("SEARCH DEBUG: Extracted type from update:", updatedType);

  // First, update the header settings with the new search settings
  setHeaderSettings((prev) => {
    // Create a new updated settings object
    const updatedSettings = {
      ...prev,
      search: {
        ...prev.search,
        ...data.settings,
        type: updatedType, // Ensure type is explicitly set if provided
      },
    };

    console.log(
      "SEARCH DEBUG: New header settings search object:",
      JSON.stringify(updatedSettings.search)
    );

    // IMPORTANT: Force immediate DOM regeneration of search components
    try {
      // Find all search containers in the DOM
      const searchContainers = document.querySelectorAll(
        '[data-item-id="search"]'
      );

      if (searchContainers.length > 0) {
        console.log(
          "SEARCH DEBUG: Found search containers to update:",
          searchContainers.length
        );

        // Regenerate search HTML for each container
        searchContainers.forEach((container) => {
          // Generate the new HTML with the updated settings
          const freshHtml = DOMPurify.sanitize(
            generateSearchHTML(updatedSettings)
          );

          console.log(
            `SEARCH DEBUG: New HTML type attribute check: ${
              freshHtml.includes('data-search-type="icon"')
                ? "ICON"
                : freshHtml.includes('data-search-type="expandable"')
                ? "EXPANDABLE"
                : "FORM"
            }`
          );

          // Add a class to trigger animation
          container.classList.add("search-updated");

          // Update the HTML content
          container.innerHTML = freshHtml;

          // Remove animation class after animation completes
          setTimeout(() => {
            container.classList.remove("search-updated");
          }, 500);
        });

        console.log(
          "SEARCH DEBUG: Regenerated search component with new settings"
        );
      } else {
        console.log("SEARCH DEBUG: No search containers found in the DOM");
      }
    } catch (error) {
      console.error("SEARCH DEBUG: Error refreshing search components:", error);
    }

    return updatedSettings;
  });
};

// Add a function to generate search HTML based on settings
export const generateSearchHTML = (settings: HeaderSettings): string => {
  // Add detailed debugging information
  console.log("SEARCH HTML GEN: Settings received:", {
    type: settings.search?.type,
    show: settings.search?.show,
    style: settings.search?.style,
    design: settings.search?.design,
  });

  // DIRECTLY force updates to DOM if search components exist
  const existingComponents = document.querySelectorAll(
    '[data-item-id="search"]'
  );
  if (existingComponents.length > 0) {
    console.log(
      `SEARCH HTML GEN: Found ${existingComponents.length} existing components to update`
    );
  }

  // Get search settings with defaults - ensure type is preserved
  const searchSettings = settings.search || defaultSearchSettings;

  // Create a unique key to force re-render when settings change
  const timestamp = Date.now();

  // Return empty if search is disabled
  if (searchSettings.show === false) {
    console.log("SEARCH HTML GEN: Search is disabled, returning empty");
    return "";
  }

  // Important: Log the actual search type and settings being used
  console.log("SEARCH HTML GEN: *** USING TYPE:", searchSettings.type, "***");

  // Force type to be lowercase string for safety
  let searchType = String(searchSettings.type || "form").toLowerCase();
  console.log(`SEARCH HTML GEN: Normalized type = "${searchType}"`);

  // Get style classes based on settings
  const styleClass = searchSettings.style || searchSettings.design || "minimal";
  const shapeClass = searchSettings.shape || "rounded";

  // Determine container classes based on the actual type, style, shape, and behavior
  const containerClasses = [
    searchType === "form" ? "search-box" : "search-container",
    `search-${styleClass}`,
    `search-${shapeClass}`,
    `search-type-${searchType}`,
    searchSettings.behavior === "popout" ? "search-popout" : "search-inline",
  ]
    .filter(Boolean)
    .join(" ");

  console.log("SEARCH HTML GEN: Container classes:", containerClasses);

  // Create border radius styles based on shape and rounded settings
  const borderRadiusStyle =
    shapeClass === "rounded"
      ? "border-radius: 9999px;"
      : searchSettings.rounded
      ? `border-radius: ${searchSettings.rounded}px;`
      : "";

  // Get placeholder text based on showText setting
  const placeholder =
    searchSettings.showText !== false
      ? searchSettings.placeholder || "Search..."
      : "";

  // Generate search icon HTML based on settings
  let searchIconHTML = "";
  if (searchSettings.showIcon !== false) {
    // Use provided colors and sizes or defaults
    const iconColor = searchSettings.iconColor || "#666666";
    const iconSize = searchSettings.iconSize || "16px";

    searchIconHTML = `
      <div class="search-icon-button" style="padding: 0 8px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    `;
  }

  // Generate button HTML if enabled
  let buttonHTML = "";
  if (searchSettings.showButton === true) {
    const buttonText = searchSettings.buttonText || "Search";
    const buttonColor = searchSettings.buttonColor || "#4a90e2";
    const buttonTextColor = searchSettings.buttonTextColor || "#ffffff";

    buttonHTML = `
      <button class="search-button" style="background-color: ${buttonColor}; color: ${buttonTextColor}; border: none; padding: 6px 12px; margin-left: 8px; border-radius: 4px; cursor: pointer;">
        ${buttonText}
      </button>
    `;
  }

  // Determine search box position for icon
  const iconPosition = searchSettings.iconPosition || "left";

  // Generate HTML based on search type using specific type checking
  let searchHTML = "";

  if (searchType === "icon") {
    console.log("SEARCH HTML GEN: Generating ICON type search");
    // Icon-only search
    searchHTML = `
      <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="icon">
        <button class="search-icon-button p-2 hover:bg-gray-200 transition-colors" style="${borderRadiusStyle}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${
            searchSettings.iconSize || "18px"
          }" height="${
      searchSettings.iconSize || "18px"
    }" viewBox="0 0 24 24" fill="none" stroke="${
      searchSettings.iconColor || "currentColor"
    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    `;
  } else if (searchType === "expandable") {
    console.log("SEARCH HTML GEN: Generating EXPANDABLE type search");
    // Expandable search
    searchHTML = `
      <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="expandable">
        <button class="search-icon-button p-2 hover:bg-gray-200 transition-colors" style="${borderRadiusStyle}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${
            searchSettings.iconSize || "18px"
          }" height="${
      searchSettings.iconSize || "18px"
    }" viewBox="0 0 24 24" fill="none" stroke="${
      searchSettings.iconColor || "currentColor"
    }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <div class="search-form hidden">
          <div class="flex items-center" style="${borderRadiusStyle}">
            <input type="text" placeholder="${placeholder}" class="px-3 py-2 bg-transparent focus:outline-none w-full" style="font-size: ${
      searchSettings.fontSize || "14px"
    }; color: ${searchSettings.textColor || "#333333"};" />
          </div>
        </div>
      </div>
    `;
  } else {
    console.log("SEARCH HTML GEN: Generating FORM type search (default)");
    // Default form type
    searchHTML = `
      <div class="${containerClasses} search-wrapper" data-timestamp="${timestamp}" data-search-type="form">
        <form class="search-type-form" style="display: flex; align-items: center;">
          <div class="flex items-center" style="padding: 6px; ${borderRadiusStyle} ${
      searchSettings.width ? `width: ${searchSettings.width};` : ""
    }">
            ${iconPosition === "left" ? searchIconHTML : ""}
            <input type="text" placeholder="${placeholder}" style="width: 100%; font-size: ${
      searchSettings.fontSize || "14px"
    }; color: ${
      searchSettings.textColor || "#333333"
    };" class="bg-transparent border-none outline-none" />
            ${iconPosition === "right" ? searchIconHTML : ""}
            ${buttonHTML}
          </div>
        </form>
      </div>
    `;
  }

  return searchHTML;
};
