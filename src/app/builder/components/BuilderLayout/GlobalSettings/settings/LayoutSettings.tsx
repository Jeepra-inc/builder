import React, { useState, useEffect } from "react";
import RangeSlider from "./RangeSlider";
import { ColSection } from "./colSection";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { Input } from "@/components/ui/input";

// Simple debounce hook implementation
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
  const debouncedPageWidth = useDebounce(pageWidth, 100);

  // Load page width from localStorage on mount
  useEffect(() => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("visual-builder-settings") || "{}"
      );
      if (settings.globalLayout?.pageWidth) {
        const match = settings.globalLayout.pageWidth.match(/(\d+)/);
        if (match) {
          const savedWidth = parseInt(match[0]);
          setPageWidth(savedWidth);
          setPageWidthText(settings.globalLayout.pageWidth);
        }
      }
    } catch (error) {
      console.error("Failed to load page width from settings:", error);
    }
  }, []);

  // Send updates to the iframe for live preview
  const sendPageWidthToIframe = (width: number) => {
    // Update parent document CSS variables
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
      console.log("Sent live preview update:", message);
    } catch (error) {
      console.error("Failed to send live preview update:", error);
    }
  };

  // Update CSS variables when page width changes (visual feedback)
  useEffect(() => {
    // Update the text field
    setPageWidthText(`${debouncedPageWidth}px`);

    // Send update to iframe for live preview
    sendPageWidthToIframe(debouncedPageWidth);

    // Store the current value in localStorage so it can be retrieved by the save function
    const key = "pageWidth_temp";
    localStorage.setItem(key, `${debouncedPageWidth}px`);
  }, [debouncedPageWidth, contentRef]);

  // Listen for the save event from the topbar save button
  useEffect(() => {
    const handleSaveSettings = () => {
      try {
        // Get current width value
        const currentWidthPx = `${debouncedPageWidth}px`;

        // Get current settings
        const settings = JSON.parse(
          localStorage.getItem("visual-builder-settings") || "{}"
        );

        // Ensure globalLayout exists
        if (!settings.globalLayout) {
          settings.globalLayout = {};
        }

        // Update the page width
        settings.globalLayout.pageWidth = currentWidthPx;

        // Save back to localStorage (this will be picked up by the actual save function)
        localStorage.setItem(
          "visual-builder-settings",
          JSON.stringify(settings)
        );

        console.log("Page width prepared for saving:", currentWidthPx);
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
  }, [debouncedPageWidth]);

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
    setPageWidth(newValue);
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
              Changes saved when you click the save button in the top bar
            </div>
          </div>
        </div>
      </ColSection>
      <ColSection title="Space between sections">
        <RangeSlider unit="px" min={0} max={100} step={1} />
      </ColSection>
      <h4 className="px-4 pt-3">Grid Mode</h4>
      <ColSection title="Horizontal space">
        <RangeSlider unit="px" min={0} max={100} step={1} />
      </ColSection>
      <ColSection title="Vertical space" divider={false}>
        <RangeSlider unit="px" min={0} max={100} step={1} />
      </ColSection>
    </>
  );
}
