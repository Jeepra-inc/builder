import { useEffect, useRef } from "react";
import { HeaderLayout, HeaderSettings } from "../types";
import { sendMessageToParent } from "../notifications";

/**
 * Custom hook to initialize header layout items based on settings
 */
export const useLayoutInitialization = (
  headerSettings: HeaderSettings,
  setLayoutItems: React.Dispatch<React.SetStateAction<HeaderLayout>>
): void => {
  // Use a ref to track if we've already initialized the layout
  const initialized = useRef(false);
  // Use a ref to track the last layout we processed to prevent unnecessary updates
  const lastProcessedLayout = useRef<string>("");

  useEffect(() => {
    // Skip if we've already processed this exact layout
    const layoutString = JSON.stringify(headerSettings.layout);
    if (layoutString === lastProcessedLayout.current) {
      return;
    }

    // Update the last processed layout
    lastProcessedLayout.current = layoutString;

    console.log("useEffect: initializing layout items from headerSettings");
    console.log("Current headerSettings:", headerSettings);
    console.log("headerSettings.layout:", headerSettings.layout);

    // Check if we have containers defined in the layout settings
    if (headerSettings.layout && headerSettings.layout.containers) {
      const containers = headerSettings.layout.containers;
      console.log("Containers found in settings:", containers);

      // Ensure all container arrays are valid arrays
      const validatedContainers = {
        top_left: Array.isArray(containers.top_left) ? containers.top_left : [],
        top_center: Array.isArray(containers.top_center)
          ? containers.top_center
          : [],
        top_right: Array.isArray(containers.top_right)
          ? containers.top_right
          : [],
        middle_left: Array.isArray(containers.middle_left)
          ? containers.middle_left
          : [],
        middle_center: Array.isArray(containers.middle_center)
          ? containers.middle_center
          : [],
        middle_right: Array.isArray(containers.middle_right)
          ? containers.middle_right
          : [],
        bottom_left: Array.isArray(containers.bottom_left)
          ? containers.bottom_left
          : [],
        bottom_center: Array.isArray(containers.bottom_center)
          ? containers.bottom_center
          : [],
        bottom_right: Array.isArray(containers.bottom_right)
          ? containers.bottom_right
          : [],
        available: Array.isArray(containers.available)
          ? containers.available
          : [],
      };

      console.log("Validated containers:", validatedContainers);

      // Create new layout items based on containers or use default
      const newLayoutItems = {
        top_left: validatedContainers.top_left,
        top_center: validatedContainers.top_center,
        top_right: validatedContainers.top_right,
        middle_left: validatedContainers.middle_left,
        middle_center: validatedContainers.middle_center,
        middle_right: validatedContainers.middle_right,
        bottom_left: validatedContainers.bottom_left,
        bottom_center: validatedContainers.bottom_center,
        bottom_right: validatedContainers.bottom_right,
        available: validatedContainers.available,
      };

      // Make sure contact is included in the top_right section if it's not already included elsewhere
      const allSections = [
        ...newLayoutItems.top_left,
        ...newLayoutItems.top_center,
        ...newLayoutItems.top_right,
        ...newLayoutItems.middle_left,
        ...newLayoutItems.middle_center,
        ...newLayoutItems.middle_right,
        ...newLayoutItems.bottom_left,
        ...newLayoutItems.bottom_center,
        ...newLayoutItems.bottom_right,
      ];

      // Add contact to top_right if it's not included elsewhere
      if (!allSections.includes("contact")) {
        console.log("Adding contact to top_right section");
        newLayoutItems.top_right.push("contact");
      }

      // Update layout items
      console.log("Setting layout items to:", newLayoutItems);
      setLayoutItems(newLayoutItems);
      initialized.current = true;

      // If we have a currentPreset in the settings, notify the parent
      if (headerSettings.layout.currentPreset) {
        console.log(
          "Current preset found:",
          headerSettings.layout.currentPreset
        );
        sendMessageToParent({
          type: "HEADER_PRESET_LOADED",
          presetId: headerSettings.layout.currentPreset,
        });
      }
    } else if (!initialized.current) {
      // Set default layout items if no containers in settings and we haven't initialized yet
      console.log("No layout containers found in settings, using defaults");

      // Apply the default layout if no valid preset is found
      const defaultLayout: HeaderLayout = {
        top_left: [],
        top_center: [],
        top_right: ["contact"],
        middle_left: ["logo"],
        middle_center: ["mainMenu"],
        middle_right: ["account", "cart"],
        bottom_left: [],
        bottom_center: [],
        bottom_right: [],
        available: [],
      };

      setLayoutItems(defaultLayout);
      initialized.current = true;
    }
  }, [headerSettings.layout, setLayoutItems]);
};
