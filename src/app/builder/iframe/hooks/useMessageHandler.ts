import { useEffect, useRef, useCallback } from "react";
import { HeaderSettings, FooterSettings, Section } from "../types";
import { loadGoogleFont } from "./useIframeEffects";
import {
  sendMessageToParent,
  shouldProcessMessage,
} from "../utils/messageUtils";

// Create a cache to track processed messages
const processedMessages = new Map<string, number>();

/**
 * Custom hook to handle messages from the parent window
 */
export const useMessageHandler = ({
  headerSettings,
  setHeaderSettings,
  footerSettings,
  setFooterSettings,
  sections,
  setLocalSections,
  dispatch,
  processingParentSettings,
  initializeAllSettingsFromJson,
}: {
  headerSettings: HeaderSettings;
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>;
  footerSettings: FooterSettings;
  setFooterSettings: React.Dispatch<React.SetStateAction<FooterSettings>>;
  sections: Section[];
  setLocalSections: React.Dispatch<React.SetStateAction<Section[]>>;
  dispatch: any; // Replace with proper type from sectionReducer
  processingParentSettings: React.MutableRefObject<boolean>;
  initializeAllSettingsFromJson: () => void;
}) => {
  // Add a flag to track if we're sending messages to parent
  const sendingToParent = useRef(false);
  // Add a flag to track the last message timestamp to prevent duplicate processing
  const lastMessageTimestamp = useRef(0);
  // Add a flag to track initialization
  const isInitialized = useRef(false);

  // Create a function to send messages to parent
  const sendParentMessage = useCallback((message: any) => {
    sendMessageToParent(message, sendingToParent);
  }, []);

  // Handle messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object" || !event.data.type) {
        return;
      }

      const { type, timestamp } = event.data;
      const headers = event.data.headers || {};

      // Create a unique key for this message type and content
      const messageKey = `${type}-${JSON.stringify(event.data).slice(0, 100)}`;
      const now = Date.now();

      // Check if we've processed this exact message recently (within 2 seconds)
      if (processedMessages.has(messageKey)) {
        const lastProcessed = processedMessages.get(messageKey) || 0;
        if (now - lastProcessed < 2000) {
          console.log(
            `Skipping duplicate message: ${type} (processed recently)`
          );
          return;
        }
      }

      // Update the processed messages cache
      processedMessages.set(messageKey, now);

      // Clean up old entries from the cache (older than 5 seconds)
      processedMessages.forEach((time, key) => {
        if (now - time > 5000) {
          processedMessages.delete(key);
        }
      });

      // Handle different message types
      switch (type) {
        case "LOAD_SETTINGS": {
          // Skip if we're already processing settings or if we've already initialized
          if (processingParentSettings.current) {
            console.log(
              "Skipping LOAD_SETTINGS while already processing settings"
            );
            return;
          }

          // Only process the first LOAD_SETTINGS message after initialization
          if (isInitialized.current) {
            // Check if we should process this message
            if (!shouldProcessMessage(timestamp, lastMessageTimestamp, 2000)) {
              console.log("Skipping duplicate LOAD_SETTINGS message");
              return;
            }
          } else {
            isInitialized.current = true;
          }

          const { settings } = event.data;
          console.log("Received LOAD_SETTINGS message:", settings);

          // Update our local state
          processingParentSettings.current = true;

          try {
            if (settings.sections) {
              dispatch({ type: "SET_SECTIONS", payload: settings.sections });
            }

            if (settings.headerSettings) {
              setHeaderSettings((prev) => ({
                ...prev,
                ...settings.headerSettings,
              }));
            }

            if (settings.footerSettings) {
              setFooterSettings((prev) => ({
                ...prev,
                ...settings.footerSettings,
              }));
            }

            // Directly handle typography settings to ensure fonts load
            if (settings.globalStyles?.typography) {
              console.log(
                "Typography initialized from LOAD_SETTINGS",
                settings.globalStyles.typography
              );
              const {
                headingFont,
                bodyFont,
                headingColor,
                headingSizeScale,
                bodySizeScale,
              } = settings.globalStyles.typography;

              // Apply CSS variables directly
              const root = document.documentElement;

              if (headingFont) {
                const [fontFamily, weight] = headingFont.split(":");
                root.style.setProperty(
                  "--heading-font",
                  `'${fontFamily}', sans-serif`
                );
                loadGoogleFont(fontFamily, weight || "400");
              }

              if (bodyFont) {
                const [fontFamily, weight] = bodyFont.split(":");
                root.style.setProperty(
                  "--body-font",
                  `'${fontFamily}', sans-serif`
                );
                loadGoogleFont(fontFamily, weight || "400");
              }

              if (headingColor) {
                root.style.setProperty("--heading-color", headingColor);
              }

              if (headingSizeScale) {
                root.style.setProperty(
                  "--heading-size-scale",
                  `${headingSizeScale / 100}`
                );
              }

              if (bodySizeScale) {
                root.style.setProperty(
                  "--body-size-scale",
                  `${bodySizeScale / 100}`
                );
              }
            }
          } finally {
            // Reset the flag after a short delay to ensure all state updates have been processed
            setTimeout(() => {
              processingParentSettings.current = false;
            }, 500);
          }
          break;
        }

        case "UPDATE_HEADER_SETTINGS": {
          const { settings } = event.data;

          // Check if we're already sending to parent to prevent loops
          if (sendingToParent.current) {
            console.log(
              "Skipping UPDATE_HEADER_SETTINGS while sending to parent"
            );
            return;
          }

          // Skip if we're processing parent settings
          if (processingParentSettings.current) {
            console.log(
              "Skipping UPDATE_HEADER_SETTINGS while processing parent settings"
            );
            return;
          }

          // Add debug for logo updates
          if (settings.logo) {
            console.log("IFRAME: Received logo settings:", settings.logo);
          }

          // Apply the settings
          setHeaderSettings((prev) => ({
            ...prev,
            ...settings,
          }));

          // Send updated settings to parent after a small delay to ensure state is updated
          // but only if we're not already sending to parent
          if (!sendingToParent.current) {
            setTimeout(() => {
              sendMessageToParent(
                {
                  type: "HEADER_SETTINGS_UPDATED",
                  settings: headerSettings,
                },
                sendingToParent
              );
            }, 100);
          }
          break;
        }

        case "UPDATE_TYPOGRAPHY": {
          const { settings } = event.data;
          const root = document.documentElement;

          // Apply typography settings to CSS variables
          if (settings.headingColor) {
            root.style.setProperty("--heading-color", settings.headingColor);
          }

          // Handle font updates
          if (settings.headingFont) {
            const [headingFontFamily, headingFontWeight] =
              settings.headingFont.split(":");
            root.style.setProperty(
              "--heading-font",
              `'${headingFontFamily}', sans-serif`
            );

            // Load the heading font if it's not a system font
            loadGoogleFont(headingFontFamily, headingFontWeight || "400");
          }

          if (settings.bodyFont) {
            const [bodyFontFamily, bodyFontWeight] =
              settings.bodyFont.split(":");
            root.style.setProperty(
              "--body-font",
              `'${bodyFontFamily}', sans-serif`
            );

            // Load the body font if it's not a system font
            loadGoogleFont(bodyFontFamily, bodyFontWeight || "400");
          }

          // Apply font size scales
          if (settings.headingSizeScale) {
            root.style.setProperty(
              "--heading-size-scale",
              `${settings.headingSizeScale / 100}`
            );
          }

          if (settings.bodySizeScale) {
            root.style.setProperty(
              "--body-size-scale",
              `${settings.bodySizeScale / 100}`
            );
          }
          break;
        }

        case "LOAD_GOOGLE_FONT": {
          const { fontFamily, fontWeight } = event.data;
          if (fontFamily) {
            loadGoogleFont(fontFamily, fontWeight || "400");
            console.log(
              `Loaded Google Font from parent request: ${fontFamily} (weight: ${
                fontWeight || "400"
              })`
            );
          }
          break;
        }

        case "UPDATE_FOOTER_SETTINGS": {
          const { settings } = event.data;
          setFooterSettings((prev) => ({ ...prev, ...settings }));
          break;
        }

        case "TOGGLE_SECTION_VISIBILITY": {
          const { sectionId, isVisible } = event.data;

          if (!sectionId) {
            return;
          }

          const existingSection = sections.find((s) => s.id === sectionId);

          if (!existingSection || existingSection.isVisible !== isVisible) {
            setLocalSections((prevSections) =>
              prevSections.map((section) =>
                section.id === sectionId
                  ? {
                      ...section,
                      isVisible: isVisible ?? section.isVisible,
                      settings: {
                        ...section.settings,
                        isVisible:
                          isVisible ?? section.settings?.isVisible ?? true,
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
          break;
        }

        case "UPDATE_SECTION": {
          dispatch({
            type: "UPDATE_SECTION",
            sectionId: event.data.sectionId,
            updates: event.data.updates.settings ?? {},
          });
          break;
        }

        case "SECTIONS_UPDATED": {
          dispatch({ type: "SET_SECTIONS", payload: event.data.sections });
          break;
        }

        case "DELETE_SECTION": {
          dispatch({
            type: "DELETE_SECTION",
            sectionId: event.data.sectionId,
          });
          break;
        }

        case "ADD_SECTION": {
          dispatch({
            type: "ADD_SECTION",
            payload: event.data.section,
            index: event.data.index,
          });
          break;
        }

        case "UNDO": {
          dispatch({ type: "UNDO" });
          break;
        }

        case "REDO": {
          dispatch({ type: "REDO" });
          break;
        }

        // Add more message handlers as needed
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Clean up
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    headerSettings,
    setHeaderSettings,
    footerSettings,
    setFooterSettings,
    sections,
    setLocalSections,
    dispatch,
    processingParentSettings,
    initializeAllSettingsFromJson,
  ]);

  return {
    sendingToParent,
    lastMessageTimestamp,
    sendMessageToParent: sendParentMessage,
  };
};
