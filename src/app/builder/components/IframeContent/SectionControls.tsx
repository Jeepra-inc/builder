// SectionControls.tsx

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { SectionControlsProps, ControlButtonProps } from '@/app/builder/types';

const ControlButton = ({ icon: Icon, onClick, tooltip, className = '' }: ControlButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        size="icon"
        variant="ghost"
        className={`w-6 h-6 text-zinc-100 ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <Icon className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

export function SectionControls({
  sectionId,
  index,
  totalSections,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  isVisible = true,
}: SectionControlsProps) {
  const controls = [
    {
      condition: true,
      props: {
        icon: isVisible ? EyeOff : Eye,
        onClick: onToggleVisibility,
        tooltip: isVisible ? 'Hide Section' : 'Show Section'
      }
    },
    {
      condition: index > 0,
      props: {
        icon: ArrowUp,
        onClick: onMoveUp,
        tooltip: 'Move Up'
      }
    },
    {
      condition: index < totalSections - 1,
      props: {
        icon: ArrowDown,
        onClick: onMoveDown,
        tooltip: 'Move Down'
      }
    },
    {
      condition: true,
      props: {
        icon: Copy,
        onClick: onDuplicate,
        tooltip: 'Duplicate'
      }
    },
    {
      condition: true,
      props: {
        icon: Trash2,
        onClick: onDelete,
        tooltip: 'Delete',
        className: 'text-red-400 hover:text-red-600'
      }
    }
  ];

  return (
    <TooltipProvider>
      <div className="absolute right-1 top-1 flex bg-zinc-800 p-1 rounded-md z-10">
        {controls.map((control, idx) => 
          control.condition && (
            <ControlButton key={idx} {...control.props} />
          )
        )}
      </div>
    </TooltipProvider>
  );
}
