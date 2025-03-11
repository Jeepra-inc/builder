import { Dispatch } from "react";

// Define the basic message handler type
export type MessageHandler = (event: MessageEvent) => void;

// Define types for our actions and state
export interface SectionAction {
  type: string;
  [key: string]: any;
}

export interface IframeSection {
  id: string;
  isVisible: boolean;
  settings?: any;
  [key: string]: any;
}

// Create a function to validate incoming messages
export const isValidMessage = (event: MessageEvent): boolean => {
  return !!(event.data && typeof event.data === "object");
};

// Create a function to log incoming messages with consistent format
export const logMessage = (event: MessageEvent): void => {
  const headers = event.data.headers || {};
  const messageType = event.data.type || "UNKNOWN";

  console.log(`IFRAME: Received message of type "${messageType}" from parent`, {
    origin: event.origin,
    headers,
    data: event.data,
  });
};

// Create reusable handlers for common message types
export const createBackgroundColorHandler = (event: MessageEvent): void => {
  if (event.data.type === "UPDATE_BACKGROUND_COLOR") {
    const { color } = event.data;
    document.body.style.backgroundColor = color;
  }
};

// Create a handler for section visibility updates
export const createToggleSectionVisibilityHandler =
  (
    dispatch: Dispatch<SectionAction>,
    localSections: IframeSection[],
    setLocalSections: (
      sections: IframeSection[] | ((prev: IframeSection[]) => IframeSection[])
    ) => void
  ) =>
  (event: MessageEvent): void => {
    if (event.data.type === "TOGGLE_SECTION_VISIBILITY") {
      const { sectionId, isVisible } = event.data;

      if (!sectionId) return;

      const existingSection = localSections.find((s) => s.id === sectionId);

      if (!existingSection || existingSection.isVisible !== isVisible) {
        setLocalSections((prevSections) =>
          prevSections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  isVisible: isVisible ?? section.isVisible,
                  settings: {
                    ...section.settings,
                    isVisible: isVisible ?? section.settings?.isVisible ?? true,
                  },
                }
              : section
          )
        );

        dispatch({
          type: "TOGGLE_SECTION_VISIBILITY",
          sectionId,
          isVisible,
        });
      }
    }
  };

// Create a handler for load settings messages
export const createLoadSettingsHandler =
  (
    dispatch: Dispatch<SectionAction>,
    setHeaderSettings: (settings: (prev: any) => any) => void,
    setLocalSections: (sections: IframeSection[]) => void,
    processingParentSettings?: React.MutableRefObject<boolean>
  ) =>
  (event: MessageEvent): void => {
    if (event.data.type === "LOAD_SETTINGS") {
      console.log("Received LOAD_SETTINGS message:", event.data.settings);

      // Set flag to prevent sending updates while processing parent settings
      if (processingParentSettings) {
        processingParentSettings.current = true;
      }

      try {
        // Process settings from parent
        const { settings } = event.data;

        if (settings) {
          // Update sections if they exist
          if (settings.sections) {
            console.log("Setting sections in iframe:", settings.sections);
            setLocalSections(settings.sections);
            dispatch({ type: "SET_SECTIONS", payload: settings.sections });
          }

          // Update header settings if they exist
          if (settings.headerSettings) {
            // Create updated header settings
            const updatedHeaderSettings = { ...settings.headerSettings };

            // Process additional branding information if needed
            if (settings.globalStyles?.branding) {
              // This would need to be expanded based on the actual implementation
              // Simplified for this example
              console.log("Processing branding information for header");
            }

            setHeaderSettings((prev) => ({
              ...prev,
              ...updatedHeaderSettings,
            }));
          }
        }
      } finally {
        // Reset processing flag after short delay
        if (processingParentSettings) {
          setTimeout(() => {
            processingParentSettings.current = false;
          }, 100);
        }
      }
    }
  };

// Create a utility to set up a message listener with multiple handlers
export const createMessageListener = (
  handlers: ((event: MessageEvent) => void)[]
): MessageHandler => {
  return (event: MessageEvent) => {
    if (!isValidMessage(event)) return;

    // Log all incoming messages
    logMessage(event);

    // Run all handlers
    handlers.forEach((handler) => handler(event));
  };
};
