import { HeaderSettings } from "./types";

/**
 * Send a message to the parent window
 * @param message The message object to send
 * @returns true if a parent window was found, false otherwise
 */
export const sendMessageToParent = (message: any): boolean => {
  // Log the message being sent for debugging
  console.log("Sending message to parent:", message);

  // Send the message to the parent window
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, "*");
    return true;
  } else {
    console.warn("No parent window found, sending to current window");
    window.postMessage(message, "*");
    return false;
  }
};

/**
 * Create a scheme notification handler
 * @returns A function to notify parent about scheme changes
 */
export const createSchemeNotifier = (
  headerSettings: HeaderSettings,
  lastNotifiedSchemesRef: React.MutableRefObject<{
    topBarColorScheme: string;
    mainBarColorScheme: string;
    bottomBarColorScheme: string;
  }>,
  notificationTimeoutRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>
) => {
  return (schemes: {
    topBarColorScheme?: string;
    mainBarColorScheme?: string;
    bottomBarColorScheme?: string;
    topBarVisible?: boolean;
    bottomEnabled?: boolean;
  }) => {
    // Create scheme object with defaults
    const notifySchemes = {
      topBarColorScheme:
        schemes.topBarColorScheme ||
        headerSettings.topBarColorScheme ||
        "light",
      mainBarColorScheme:
        schemes.mainBarColorScheme ||
        headerSettings.mainBarColorScheme ||
        "light",
      bottomBarColorScheme:
        schemes.bottomBarColorScheme ||
        headerSettings.bottomBarColorScheme ||
        "light",
      topBarVisible:
        schemes.topBarVisible !== undefined
          ? schemes.topBarVisible
          : headerSettings.topBarVisible !== false,
      bottomEnabled:
        schemes.bottomEnabled !== undefined
          ? schemes.bottomEnabled
          : headerSettings.bottomEnabled !== false,
    };

    // Create string representation for comparison
    const schemesString = JSON.stringify(notifySchemes);

    // Only notify if schemes have changed from last notification
    if (JSON.stringify(lastNotifiedSchemesRef.current) !== schemesString) {
      // Clear any pending notification
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      // Use a ref to track that we're about to send this notification
      lastNotifiedSchemesRef.current = notifySchemes;

      // Debounce the notification
      notificationTimeoutRef.current = setTimeout(() => {
        console.log("Sending debounced scheme notification:", notifySchemes);
        sendMessageToParent({
          type: "HEADER_SCHEMES_UPDATED",
          schemes: notifySchemes,
        });
        notificationTimeoutRef.current = null;
      }, 200);
    }
  };
};
