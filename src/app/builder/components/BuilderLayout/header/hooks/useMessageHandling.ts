import { useEffect } from "react";
import { HeaderLayout, HeaderSettings } from "../types";
import DOMPurify from "dompurify";
import { handleSearchSettingsMessage } from "../searchSettings";
import { sendMessageToParent } from "../notifications";

/**
 * Custom hook for handling messages related to the header component
 */
export const useMessageHandling = (
  layoutItems: HeaderLayout,
  setLayoutItems: React.Dispatch<React.SetStateAction<HeaderLayout>>,
  headerSettings: HeaderSettings,
  setHeaderSettings: React.Dispatch<React.SetStateAction<HeaderSettings>>,
  setCustomHtml: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  debouncedSetLayoutItems: (items: HeaderLayout) => void
): void => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      const { type, data } = event.data;

      switch (type) {
        case "UPDATE_LAYOUT_ITEMS":
          try {
            console.log("Received UPDATE_LAYOUT_ITEMS:", event.data);
            const { source, destination, itemId } = event.data;

            // Clone the current layout items to avoid direct state mutation
            const newLayoutItems = { ...layoutItems };

            // Remove the item from its source container
            if (
              source &&
              source.containerId &&
              Array.isArray(
                newLayoutItems[source.containerId as keyof HeaderLayout]
              )
            ) {
              const sourceArray = newLayoutItems[
                source.containerId as keyof HeaderLayout
              ] as string[];
              const sourceIndex =
                source.index !== undefined
                  ? source.index
                  : sourceArray.indexOf(itemId);

              if (sourceIndex !== -1) {
                sourceArray.splice(sourceIndex, 1);
              }
            }

            // Add the item to its destination container
            if (
              destination &&
              destination.containerId &&
              Array.isArray(
                newLayoutItems[destination.containerId as keyof HeaderLayout]
              )
            ) {
              const destArray = newLayoutItems[
                destination.containerId as keyof HeaderLayout
              ] as string[];
              const destIndex =
                destination.index !== undefined
                  ? destination.index
                  : destArray.length;

              // Splice the item into the destination at the specified index
              destArray.splice(destIndex, 0, itemId);
            }

            // Update the layout items
            debouncedSetLayoutItems(newLayoutItems);

            // Notify parent of the updated layout
            sendMessageToParent({
              type: "LAYOUT_ITEMS_UPDATED",
              layoutItems: newLayoutItems,
            });
          } catch (error) {
            console.error("Error in UPDATE_LAYOUT_ITEMS:", error);
          }
          break;

        case "UPDATE_HEADER_LAYOUT":
          try {
            console.log("Received UPDATE_HEADER_LAYOUT:", event.data);
            const layoutData = event.data;

            if (layoutData) {
              // Create new layout items based on the received layout data
              const newLayoutItems: HeaderLayout = {
                top_left: layoutData.top_left || [],
                top_center: layoutData.top_center || [],
                top_right: layoutData.top_right || [],
                middle_left: layoutData.middle_left || [],
                middle_center: layoutData.middle_center || [],
                middle_right: layoutData.middle_right || [],
                bottom_left: layoutData.bottom_left || [],
                bottom_center: layoutData.bottom_center || [],
                bottom_right: layoutData.bottom_right || [],
                available: layoutData.available || [],
              };

              // Update the layout items
              setLayoutItems(newLayoutItems);

              // Also update headerSettings to keep containers in sync
              setHeaderSettings((prev) => ({
                ...prev,
                layout: {
                  ...(prev.layout || {
                    sticky: false,
                    maxWidth: "",
                    currentPreset: "",
                  }),
                  containers: newLayoutItems,
                },
              }));

              console.log(
                "Header layout updated with new layout items:",
                newLayoutItems
              );
            }
          } catch (error) {
            console.error("Error in UPDATE_HEADER_LAYOUT:", error);
          }
          break;

        case "UPDATE_HEADER_SETTINGS":
          // Update settings immediately
          setHeaderSettings((prev) => ({ ...prev, ...event.data.settings }));

          // Extract HTML block updates
          const htmlUpdates: Record<string, string> = {};
          let hasHtmlUpdates = false;

          for (const key in event.data.settings) {
            if (
              key &&
              typeof key === "string" &&
              key.startsWith("html_block_")
            ) {
              // Sanitize HTML content again when receiving it
              const rawHtml = event.data.settings[key];
              if (typeof rawHtml === "string") {
                htmlUpdates[key] = DOMPurify.sanitize(rawHtml);
                hasHtmlUpdates = true;
              }
            }
          }

          if (hasHtmlUpdates) {
            console.log("Updating HTML blocks:", htmlUpdates);
            setCustomHtml((prev) => ({
              ...prev,
              ...htmlUpdates,
            }));
          }

          // Handle search settings specifically if present
          if (event.data.settings && event.data.settings.search) {
            // Call the imported function
            handleSearchSettingsMessage(
              { settings: event.data.settings.search },
              setHeaderSettings,
              headerSettings
            );
          }

          // Update other header settings
          if (event.data.settings) {
            setHeaderSettings((prev) => ({ ...prev, ...event.data.settings }));
          }
          break;

        case "HEADER_GET_STATE":
          console.log("Received HEADER_GET_STATE request");
          sendMessageToParent({
            type: "HEADER_STATE",
            settings: headerSettings,
            layoutItems,
          });
          break;

        // More cases would be added here (truncated for brevity)
        // For a complete implementation, add all other case handlers

        default:
          // Unhandled message type
          break;
      }
    };

    // Add event listener
    window.addEventListener("message", handleMessage);

    // Clean up
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    layoutItems,
    setLayoutItems,
    headerSettings,
    setHeaderSettings,
    setCustomHtml,
    debouncedSetLayoutItems,
  ]);
};
