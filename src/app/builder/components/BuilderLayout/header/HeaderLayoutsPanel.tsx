"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { headerPresets, presetLayouts } from "../data/headerPresets";

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
  const handlePresetSelect = (presetId: string) => {
    console.log('🎯 HeaderLayoutsPanel: Preset selected:', {
      previousPreset: currentPreset,
      newPreset: presetId,
      hasLayoutData: !!presetLayouts[presetId]
    });
    
    if (onSelectPreset) {
      // Notify parent about preset change
      console.log('⬆️ Calling onSelectPreset with:', presetId);
      onSelectPreset(presetId);
      
      // Send message to iframe to update the header layout
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow && presetLayouts[presetId]) {
        console.log('📤 Sending UPDATE_HEADER_LAYOUT message to iframe for preset:', presetId);
        
        // Create a custom event to ensure layout is saved after preset change
        window.dispatchEvent(new CustomEvent('saveHeaderPresetChange', {
          detail: { presetId, layout: presetLayouts[presetId] }
        }));
        
        iframe.contentWindow.postMessage({
          type: "UPDATE_HEADER_LAYOUT",
          presetId,  // Include the presetId in the message
          ...presetLayouts[presetId]
        }, '*');
      }
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
              currentPreset === preset.id && "shadow-lg ring-2 ring-blue-500"
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