import React, { useState, useEffect, useRef } from "react";
import RangeSlider from "./RangeSlider";
import { ColSection } from "./colSection";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { Input } from "@/components/ui/input";

// Simple debounce hook implementation with longer delay
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function LayoutSettings() {
  // Get the builder context
  const { contentRef } = useBuilder();

  // Default page width value - use 1200px as default
  const defaultPageWidth = "1200px";
  const numericPageWidth = 1200;

  // State for page width
  const [pageWidth, setPageWidth] = useState(numericPageWidth);
  const [pageWidthText, setPageWidthText] = useState(defaultPageWidth);
  // Increase debounce delay to reduce update frequency
  const debouncedPageWidth = useDebounce(pageWidth, 500);

  // Add a ref to track the last sent width value to prevent duplicate updates
  const lastSentWidthRef = useRef<number>(numericPageWidth);
  // Add a ref to track if an update is in progress
  const updateInProgressRef = useRef<boolean>(false);
  // Track if component is mounted to prevent updates after unmount
  const isMountedRef = useRef<boolean>(true);
  // Store the latest width value in a ref instead of localStorage for efficiency
  const latestWidthRef = useRef<string>(`${numericPageWidth}px`);
  // Minimum time between updates (in ms)
  const UPDATE_THROTTLE = 300;

  // Load page width from API on mount
  useEffect(() => {
    const fetchPageWidth = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          console.error("Failed to fetch settings:", response.statusText);
          return;
        }

        const settings = await response.json();
        if (settings.globalLayout?.pageWidth) {
          const match = settings.globalLayout.pageWidth.match(/(\d+)/);
          if (match) {
            const savedWidth = parseInt(match[0]);
            setPageWidth(savedWidth);
            setPageWidthText(settings.globalLayout.pageWidth);
            // Initialize the last sent width
            lastSentWidthRef.current = savedWidth;
            // Initialize the latest width ref
            latestWidthRef.current = settings.globalLayout.pageWidth;
          }
        }
      } catch (error) {
        console.error("Failed to load page width from API:", error);
      }
    };

    fetchPageWidth();

    // Set mounted flag
    isMountedRef.current = true;

    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Send updates to the iframe for live preview - but only update DOM, not the API
  const updatePageWidth = (width: number) => {
    // Skip if this width was already sent or an update is in progress
    if (
      lastSentWidthRef.current === width ||
      updateInProgressRef.current ||
      !isMountedRef.current
    ) {
      return;
    }

    // Mark that an update is in progress
    updateInProgressRef.current = true;

    // Update the last sent width
    lastSentWidthRef.current = width;

    // Update the latest width ref for save operations
    latestWidthRef.current = `${width}px`;

    // Update parent document CSS variables (DOM only, no API call)
    document.documentElement.style.setProperty("--page-width", `${width}px`);

    // Send to iframe for live preview
    const message = {
      type: "UPDATE_CSS_VARIABLE",
      variable: "--page-width",
      value: `${width}px`,
    };

    // Try to send message to iframe
    try {
      // First try using the contentRef
      if (contentRef?.current?.contentWindow) {
        contentRef.current.contentWindow.postMessage(message, "*");
      } else {
        // Fallback to querying for iframe
        const iframe = document.querySelector("iframe");
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage(message, "*");
        }
      }
      console.log("Local CSS update: page-width =", width);
    } catch (error) {
      console.error("Failed to send live preview update:", error);
    } finally {
      // Clear the update flag with a small delay to prevent rapid updates
      setTimeout(() => {
        if (isMountedRef.current) {
          updateInProgressRef.current = false;
        }
      }, 100);
    }
  };

  // Update CSS variables when debounced page width changes (visual feedback only)
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Update the text field
    setPageWidthText(`${debouncedPageWidth}px`);

    // Update CSS variables in DOM only (no API call)
    updatePageWidth(debouncedPageWidth);
  }, [debouncedPageWidth]);

  // Listen for the save event from the topbar save button
  useEffect(() => {
    const handleSaveSettings = () => {
      if (!isMountedRef.current) return;

      try {
        // The current width value is stored in our ref
        // It will be saved when the global save button is clicked
        // No need to manually update localStorage here
        console.log("Page width prepared for saving:", latestWidthRef.current);
      } catch (error) {
        console.error("Failed to prepare page width for saving:", error);
      }
    };

    // Add event listener for the save button
    window.addEventListener("requestSaveSettings", handleSaveSettings);

    // Clean up
    return () => {
      window.removeEventListener("requestSaveSettings", handleSaveSettings);
    };
  }, []);

  // Handle manual text input
  const handlePageWidthTextChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setPageWidthText(newValue);

    // Apply the text input value immediately when input changes
    const match = newValue.match(/(\d+)/);
    if (match) {
      const newWidth = parseInt(match[0]);
      if (newWidth >= 800 && newWidth <= 2500) {
        setPageWidth(newWidth);
      }
    }
  };

  // Handle slider value change
  const handleSliderChange = (newValue: number) => {
    setPageWidth((newWidth) => {
      // Only update if the value has changed
      return newWidth !== newValue ? newValue : newWidth;
    });
  };

  return (
    <>
      <ColSection title="Page Width">
        <div className="flex flex-col gap-2">
          <RangeSlider
            value={pageWidth}
            onValueChange={handleSliderChange}
            unit="px"
            min={800}
            max={2500}
            step={10}
          />
          <div className="flex items-center gap-2 px-4">
            <Input
              value={pageWidthText}
              onChange={handlePageWidthTextChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              className="w-24"
            />
            <div className="text-xs text-gray-500 italic ml-2">
              Changes will be saved when you click the save button in the top
              bar
            </div>
          </div>
        </div>
      </ColSection>
      <h4 className="px-3 pt-3">Grid Mode</h4>
      <ColSection title="Horizontal space" className="pb-0" divider={false}>
        <RangeSlider unit="px" min={0} max={100} step={1} />
      </ColSection>
      <ColSection title="Vertical space" divider={false}>
        <RangeSlider unit="px" min={0} max={100} step={1} />
      </ColSection>
    </>
  );
}
