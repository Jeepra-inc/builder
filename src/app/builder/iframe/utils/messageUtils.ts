import React from "react";

// Track recently sent messages to prevent duplicates
const recentlySentMessages = new Map<string, number>();

/**
 * Helper function to safely send messages to parent window
 * This prevents infinite loops by adding flags and timeouts
 */
export const sendMessageToParent = (
  message: any,
  sendingFlag: React.MutableRefObject<boolean>,
  origin: string = "*"
) => {
  // Skip if already sending
  if (sendingFlag.current) {
    console.log(
      "Skipping message while already sending to parent:",
      message.type
    );
    return;
  }

  // Create a message key for tracking
  const messageKey = `${message.type}-${JSON.stringify(message).slice(0, 100)}`;
  const now = Date.now();

  // Check if we've sent this exact message recently (within 1 second)
  if (recentlySentMessages.has(messageKey)) {
    const lastSent = recentlySentMessages.get(messageKey) || 0;
    if (now - lastSent < 1000) {
      console.log(
        `Skipping duplicate message: ${message.type} (sent recently)`
      );
      return;
    }
  }

  // Update the sent messages cache
  recentlySentMessages.set(messageKey, now);

  // Clean up old entries from the cache (older than 5 seconds)
  recentlySentMessages.forEach((time, key) => {
    if (now - time > 5000) {
      recentlySentMessages.delete(key);
    }
  });

  if (window.parent) {
    sendingFlag.current = true;

    try {
      window.parent.postMessage(message, origin);
      console.log("Sent message to parent:", message.type);
    } catch (error) {
      console.error("Error sending message to parent:", error);
    } finally {
      // Reset the flag after a short delay
      setTimeout(() => {
        sendingFlag.current = false;
      }, 200);
    }
  }
};

/**
 * Helper function to check if a message has been processed recently
 * This prevents duplicate processing of the same message
 */
export const shouldProcessMessage = (
  timestamp: number,
  lastProcessedTimestamp: React.MutableRefObject<number>,
  threshold: number = 500
): boolean => {
  const now = Date.now();

  // If no timestamp provided, use current time
  const messageTime = timestamp || now;

  // Check if we've processed a message recently
  if (now - lastProcessedTimestamp.current < threshold) {
    return false;
  }

  // Update the last processed timestamp
  lastProcessedTimestamp.current = now;
  return true;
};
