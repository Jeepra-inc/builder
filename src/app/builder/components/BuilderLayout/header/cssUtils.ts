import { HeaderSettings, LayoutSettings } from "./types";

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

// // Function to apply CSS variables from settings
// export const applyCSSVariables = (settings: HeaderSettings): void => {};

// // Function to handle color scheme selection from messages
// export const handleColorSchemeSelection = (
//   event: MessageEvent,
//   setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>,
//   forceRepaint: () => void
// ): void => {
//   if (!event.data || typeof event.data !== "object") return;

//   if (event.data.type === "COLOR_SCHEME_SELECTED") {
//     const { section, schemeId } = event.data;

//     // Update the appropriate section's color scheme
//     if (section === "top" || section === "topBar") {
//       setHeaderSettings((prev) => ({
//         ...prev,
//         topBarColorScheme: schemeId,
//       }));
//     } else if (section === "main" || section === "mainBar") {
//       setHeaderSettings((prev) => ({
//         ...prev,
//         mainBarColorScheme: schemeId,
//       }));
//     } else if (section === "bottom" || section === "bottomBar") {
//       setHeaderSettings((prev) => ({
//         ...prev,
//         bottomBarColorScheme: schemeId,
//       }));
//     }

//     // Ensure the update is reflected
//     setTimeout(forceRepaint, 50);
//   }
// };

// Helper function to create section style object based on color scheme
// SectionStyles type and getColorSchemeStyles function moved to styleUtils.ts
