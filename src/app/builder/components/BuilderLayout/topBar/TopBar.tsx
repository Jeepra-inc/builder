"use client";
import React, { useState } from "react";
import { ViewportSizeControls } from "./ViewportSizeControls";
import { UndoRedoControls } from "./UndoRedoControls";
import { ExportTemplateButton } from "./ExportTemplateButton";
import { ImportTemplateButton } from "./ImportTemplateButton";
import { Button } from "@/components/ui/button";
import { Section } from "@/app/builder/types";
import type { TopBarProps } from "@/app/builder/types";
import { Check, Loader2, LogOut, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopBar({
  viewportSize,
  onViewportChange,
  onUndo,
  onRedo,
  handleSave,
  sections,
  onImportSections,
}: TopBarProps & {
  handleSave: () => void;
  sections: Section[];
  onImportSections: (sections: Section[]) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const handleSaveClick = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);

    try {
      console.log("TopBar - Starting save process");

      // Log any top bar settings before initiating the save
      let currentColorScheme = "light"; // Default value

      // First check the global variable that's set by updateSetting
      if (typeof window !== "undefined") {
        if ((window as any).__latestTopBarColorScheme) {
          currentColorScheme = (window as any).__latestTopBarColorScheme;
          console.log(
            `TopBar - Found color scheme in global variable: ${currentColorScheme}`
          );
        }
      }

      // Then check via the getter function
      if (typeof window !== "undefined" && (window as any)._getTopBarSettings) {
        const currentSettings = (window as any)._getTopBarSettings();
        console.log("TopBar - Current top bar settings before save:", {
          topBarColorScheme: currentSettings.topBarColorScheme,
          globalColorScheme: currentColorScheme,
          topBarHeight: currentSettings.topBarHeight,
          topBarVisible: currentSettings.topBarVisible,
        });

        // Use the getter value if available
        if (currentSettings.topBarColorScheme) {
          currentColorScheme = currentSettings.topBarColorScheme;
        }
      } else {
        console.log("TopBar - No _getTopBarSettings function available");
      }

      console.log(
        `TopBar - Will save with color scheme: ${currentColorScheme}`
      );

      // Create a promise to track when the topBarSettings save is complete
      const topBarSettingsSavePromise = new Promise<void>((resolve) => {
        // Create one-time event listener for completion
        const handleSaveComplete = (event: CustomEvent) => {
          console.log(
            "TopBar - Received saveTopBarSettings completion event",
            event.detail ? event.detail : "no details"
          );
          document.removeEventListener(
            "saveTopBarSettingsComplete",
            handleSaveComplete as EventListener
          );
          resolve();
        };

        // Listen for the completion event
        document.addEventListener(
          "saveTopBarSettingsComplete",
          handleSaveComplete as EventListener
        );

        // Dispatch the save event with a timestamp to identify this specific save request
        const saveTimestamp = Date.now();
        console.log(
          `TopBar - Dispatching saveTopBarSettings event (timestamp: ${saveTimestamp}, colorScheme: ${currentColorScheme})`
        );
        document.dispatchEvent(
          new CustomEvent("saveTopBarSettings", {
            detail: {
              timestamp: saveTimestamp,
              colorScheme: currentColorScheme,
            },
          })
        );

        // Set a timeout in case the completion event is never fired
        setTimeout(() => {
          console.log("TopBar - saveTopBarSettings timeout reached");
          document.removeEventListener(
            "saveTopBarSettingsComplete",
            handleSaveComplete as EventListener
          );
          resolve();
        }, 3000);
      });

      // Wait for the top bar settings to be saved
      await topBarSettingsSavePromise;
      console.log("TopBar - Top bar settings save completed");

      // Check if the color scheme was properly saved
      if (
        typeof window !== "undefined" &&
        (window as any).__FINAL_topBarColorScheme
      ) {
        console.log(
          `TopBar - Color scheme ${
            (window as any).__FINAL_topBarColorScheme
          } will be used in final save`
        );
      } else {
        // Force set the color scheme if not already set
        if (currentColorScheme && typeof window !== "undefined") {
          console.log(
            `TopBar - Setting __FINAL_topBarColorScheme to: ${currentColorScheme}`
          );
          (window as any).__FINAL_topBarColorScheme = currentColorScheme;
        }
      }

      // Add a small delay to ensure settings are saved before proceeding
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Call the handleSave function provided from the parent
      await handleSave();
      console.log("TopBar - Parent handleSave completed");

      // Show success state
      setSaveSuccess(true);

      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError(true);

      // Reset error state after 2 seconds
      setTimeout(() => {
        setSaveError(false);
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="flex justify-between items-center px-4 ps-2 py-2 border-b bg-white shadow-md">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-md"
        >
          <LogOut className="scale-[-1]" size={16} />
        </Button>
        <ExportTemplateButton sections={sections} />
        <ImportTemplateButton onImportSections={onImportSections} />
      </div>
      <div className="flex items-center space-x-3">
        <ViewportSizeControls
          currentSize={viewportSize}
          onChange={onViewportChange}
        />
        <UndoRedoControls onUndo={onUndo} onRedo={onRedo} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSaveClick}
              size={"sm"}
              disabled={isSaving}
              className={`h-8 px-4 font-medium rounded-md transition-colors shadow-sm ${
                saveSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : saveError
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : saveError ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Failed
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {saveSuccess
                ? "Settings saved successfully"
                : saveError
                ? "Error saving settings"
                : "Save settings to file"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
