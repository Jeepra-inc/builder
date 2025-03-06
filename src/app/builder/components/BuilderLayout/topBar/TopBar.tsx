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
      // Call the handleSave function provided from the parent
      await handleSave();

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
    <div className="flex justify-between items-center px-4 py-2 border-b bg-white shadow-md">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-md"
        >
          <LogOut className="scale-[-1]" size={16} />
        </Button>
        <div className="border-l h-5 mx-1 border-gray-200"></div>
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
