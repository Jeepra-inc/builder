"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';
import type { ViewportSizeControlsProps, ViewportConfig } from '@/app/builder/types';

const VIEWPORT_CONFIGS: ViewportConfig[] = [
  { size: 'mobile', icon: Smartphone, tooltip: 'Mobile View' },
  { size: 'tablet', icon: Tablet, tooltip: 'Tablet View' },
  { size: 'desktop', icon: Monitor, tooltip: 'Desktop View' },
  { size: 'fullscreen', icon: Maximize2, tooltip: 'Fullscreen View' },
];

function ViewportButton({ 
  config, 
  isActive, 
  onClick 
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
          variant={isActive ? 'default' : 'outline'}
          size="icon"
          className="w-8 h-8"
          onClick={onClick}
        >
          <Icon className="w-4 h-4" />
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
    <div className="flex items-center space-x-1">
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
