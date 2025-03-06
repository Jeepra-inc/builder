"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { headerPresets, presetLayouts } from "../../data/headerPresets";

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
  const activePreset = currentPreset || 'preset1';
  
  const handlePresetSelect = (presetId: string) => {
    if (onSelectPreset) {
      // Just notify the parent component about the preset selection
      // This will update the UI but won't apply the layout to the iframe yet
      console.log('HeaderLayoutsPanel: Selected preset:', presetId);
      onSelectPreset(presetId);
    }
  };
  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div className="space-y-4 p-4">
        <p className="text-xs text-zinc-500">
          Quickly switch header presets. Try new layouts without losing changes,
          but don't save if you want to discard the selected preset.
        </p>
        {headerPresets.map((preset) => (
          <div
            key={preset.id}
            className={cn(
              "rounded-lg cursor-pointer transition-all hover:shadow-lg",
              activePreset === preset.id && "shadow-lg"
            )}
            onClick={() => handlePresetSelect(preset.id)}
          >
            <img src={preset.image} alt={`Preset ${preset.id}`} className="w-full h-auto" />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}