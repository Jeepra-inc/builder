"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { headerPresets, presetLayouts } from "../../data/headerPresets";

// Add preset name mapping for better display names
const presetNames: Record<string, string> = {
  preset1: "Preset 1",
  preset2: "Preset 2",
  preset3: "Preset 3",
  preset4: "Preset 4",
  preset5: "Preset 5",
  preset6: "Preset 6",
  preset7: "Preset 7",
  preset8: "Preset 8",
  preset9: "Preset 9",
  preset10: "Preset 10",
  blue_header: "Blue Header",
  white_header_blue_nav: "White Header with Blue Nav",
  mobile_simple: "Mobile Simple",
  mobile_centered: "Mobile Centered",
  simple_horizontal: "Simple Horizontal",
  top_account_cart: "Top Account & Cart",
};

interface HeaderLayoutsPanelProps {
  onBack?: () => void;
  onSelectPreset?: (preset: string) => void;
  currentPreset?: string;
}

export function HeaderLayoutsPanel({
  onBack,
  onSelectPreset,
  currentPreset,
}: HeaderLayoutsPanelProps) {
  // Use the currentPreset from props, or default to preset1
  const activePreset = currentPreset || "preset1";

  const handlePresetSelect = (presetId: string) => {
    console.log("HeaderLayoutsPanel: Selected preset:", presetId);

    // Dispatch a direct event to the HeaderLayoutBuilder component
    window.dispatchEvent(
      new CustomEvent("headerPresetChanged", {
        detail: {
          presetId,
        },
      })
    );

    if (onSelectPreset) {
      // Notify the parent component about the preset selection
      onSelectPreset(presetId);
    }
  };

  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div className="space-y-6 p-4">
        <p className="text-xs text-zinc-500 mb-4">
          Quickly switch header presets. Try new layouts without losing changes,
          but don't save if you want to discard the selected preset.
        </p>

        {/* Original Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Standard Presets</h3>
          <div className="grid grid-cols-2 gap-4">
            {headerPresets.slice(0, 10).map((preset) => (
              <div
                key={preset.id}
                className={cn(
                  "rounded-lg cursor-pointer transition-all border-2 hover:shadow-lg relative",
                  activePreset === preset.id
                    ? "shadow-lg border-blue-500 ring-2 ring-blue-500"
                    : "border-transparent"
                )}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <img
                  src={preset.image}
                  alt={`Preset ${preset.id}`}
                  className="w-full h-auto"
                />
                {activePreset === preset.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
                <p className="text-xs text-center py-1">
                  {presetNames[preset.id] || preset.id}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Presets */}
        <div>
          <h3 className="text-sm font-medium mb-3">Custom Presets</h3>
          <div className="grid grid-cols-2 gap-4">
            {headerPresets.slice(10).map((preset) => (
              <div
                key={preset.id}
                className={cn(
                  "rounded-lg cursor-pointer transition-all border-2 hover:shadow-lg relative",
                  activePreset === preset.id
                    ? "shadow-lg border-blue-500 ring-2 ring-blue-500"
                    : "border-transparent"
                )}
                onClick={() => handlePresetSelect(preset.id)}
              >
                <img
                  src={preset.image}
                  alt={`Preset ${preset.id}`}
                  className="w-full h-auto"
                />
                {activePreset === preset.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
                <p className="text-xs text-center py-1">
                  {presetNames[preset.id] || preset.id}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
