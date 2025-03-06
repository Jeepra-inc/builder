"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Smartphone, Tablet, Monitor, Maximize2 } from "lucide-react";
import type {
  ViewportSizeControlsProps,
  ViewportConfig,
} from "@/app/builder/types";

const VIEWPORT_CONFIGS: ViewportConfig[] = [
  { size: "mobile", icon: Smartphone, tooltip: "Mobile View" },
  { size: "tablet", icon: Tablet, tooltip: "Tablet View" },
  { size: "desktop", icon: Monitor, tooltip: "Desktop View" },
  { size: "fullscreen", icon: Maximize2, tooltip: "Fullscreen View" },
];

function ViewportButton({
  config,
  isActive,
  onClick,
}: {
  config: ViewportConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isActive ? "default" : "ghost"}
          size="icon"
          className={
            isActive
              ? "bg-white shadow-md w-7 h-7 text-zinc-700 hover:bg-white"
              : "w-7 h-7 text-zinc-700"
          }
          onClick={onClick}
        >
          <Icon className="w-2 h-2" strokeWidth={2.5} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{config.tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ViewportSizeControls({
  currentSize,
  onChange,
}: ViewportSizeControlsProps) {
  return (
    <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-md">
      {VIEWPORT_CONFIGS.map((config) => (
        <ViewportButton
          key={config.size}
          config={config}
          isActive={currentSize === config.size}
          onClick={() => onChange(config.size)}
        />
      ))}
    </div>
  );
}
