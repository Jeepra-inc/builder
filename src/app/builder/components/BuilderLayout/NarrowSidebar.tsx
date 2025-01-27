"use client";
import { NarrowSidebarProps, NarrowSidebarButtonsProps, SidebarButton } from '@/app/builder/types';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, Settings } from 'lucide-react';

const sidebarButtons: SidebarButton[] = [
  {
    type: 'layers',
    icon: Layers,
    tooltip: 'Layers'
  },
  {
    type: 'global-settings',
    icon: Settings,
    tooltip: 'Global Settings'
  }
];

function SidebarButtonComponent({ button, active, onClick }: { 
  button: SidebarButton; 
  active: boolean; 
  onClick: () => void; 
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div role="button" tabIndex={0} onClick={onClick}>
          <Button
            variant={active ? 'default' : 'ghost'}
            size="icon"
            asChild
          >
            <div>
              <button.icon />
            </div>
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>{button.tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function NarrowSidebarButtons({ active, onToggle }: NarrowSidebarButtonsProps) {
  return (
    <div className="w-12 bg-gray-100 flex flex-col items-center py-4 border-r">
      {sidebarButtons.map((button) => (
        <SidebarButtonComponent
          key={button.type}
          button={button}
          active={button.type === 'layers' ? (active === 'layers' || active === 'settings') : active === button.type}
          onClick={() => onToggle(button.type)}
        />
      ))}
    </div>
  );
}

export function NarrowSidebar({
  screenWidth,
  viewportSize,
  activeNarrowSidebar,
  toggleNarrowSidebar,
  handleOpenGlobalSettings,
}: NarrowSidebarProps) {
  if (screenWidth <= 1612 && viewportSize !== 'fullscreen') {
    return (
      <NarrowSidebarButtons
        active={activeNarrowSidebar}
        onToggle={toggleNarrowSidebar}
        onOpenGlobalSettings={handleOpenGlobalSettings}
      />
    );
  }
  return null;
}
