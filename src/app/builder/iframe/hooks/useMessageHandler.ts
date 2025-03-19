import { useEffect, useRef, useCallback } from "react";
import { HeaderSettings, FooterSettings, Section } from "../types";
import { loadGoogleFont } from "./useIframeEffects";
import {
  sendMessageToParent,
  shouldProcessMessage,
} from "../utils/messageUtils";

// Helper function to force a repaint
const forceRepaint = (timeout = 10) => {
  document.body.classList.add("force-repaint");
  setTimeout(() => {
    document.body.classList.remove("force-repaint");
  }, timeout);
};

// Helper function to update typography settings
const updateTypography = (typography: any) => {
  const {
    headingFont,
    bodyFont,
    headingColor,
    headingSizeScale,
    bodySizeScale,
  } = typography;

  const root = document.documentElement;

  if (headingFont) {
    const [fontFamily, weight] = headingFont.split(":");
    root.style.setProperty("--heading-font", `'${fontFamily}', sans-serif`);
    loadGoogleFont(fontFamily, weight || "400");
  }

  if (bodyFont) {
    const [fontFamily, weight] = bodyFont.split(":");
    root.style.setProperty("--body-font", `'${fontFamily}', sans-serif`);
    loadGoogleFont(fontFamily, weight || "400");
  }

  if (headingColor) {
    root.style.setProperty("--heading-color", headingColor);
  }

  if (headingSizeScale) {
    root.style.setProperty("--heading-size-scale", `${headingSizeScale / 100}`);
  }

  if (bodySizeScale) {
    root.style.setProperty("--body-size-scale", `${bodySizeScale / 100}`);
  }
};

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

      // Create a unique key for this message type and content
      const messageKey = `${type}-${JSON.stringify(event.data).slice(0, 100)}`;
      const now = Date.now();

      // Check if we've processed this exact message recently (within 2 seconds)
      if (processedMessages.has(messageKey)) {
        const lastProcessed = processedMessages.get(messageKey) || 0;
        if (now - lastProcessed < 2000) {
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
            return;
          }

          // Only process the first LOAD_SETTINGS message after initialization
          if (isInitialized.current) {
            // Check if we should process this message
            if (!shouldProcessMessage(timestamp, lastMessageTimestamp, 2000)) {
              return;
            }
          } else {
            isInitialized.current = true;
          }

          const { settings } = event.data;

          // Update our local state
          processingParentSettings.current = true;

          try {
            if (settings) {
              // Initialize typography from settings
              if (settings.globalStyles?.typography) {
                updateTypography(settings.globalStyles.typography);
              }

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
          updateTypography(settings);
          break;
        }

        case "LOAD_GOOGLE_FONT": {
          const { fontFamily, fontWeight } = event.data;
          if (fontFamily) {
            loadGoogleFont(fontFamily, fontWeight || "400");
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

        case "UPDATE_TOP_BAR_VISIBILITY": {
          const { isVisible } = event.data;

          // Update CSS variable immediately
          document.documentElement.style.setProperty(
            "--top-bar-visible",
            isVisible ? "flex" : "none",
            "important"
          );

          forceRepaint();

          // Also update headerSettings state for consistency
          setHeaderSettings((prev) => ({
            ...prev,
            topBarVisible: isVisible,
          }));
          break;
        }

        case "UPDATE_TOP_BAR_HEIGHT": {
          const { height } = event.data;

          // Update CSS variable immediately
          document.documentElement.style.setProperty(
            "--top-bar-height",
            `${height}px`,
            "important"
          );

          forceRepaint();

          // Also update headerSettings state for consistency
          setHeaderSettings((prev) => ({
            ...prev,
            topBarHeight: height,
          }));
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
  ]);

  return { sendMessageToParent: sendParentMessage };
};
