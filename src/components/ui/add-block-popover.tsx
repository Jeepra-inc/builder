import React, { useState, useRef, useEffect } from 'react';
import { BlockRegistry, createDefaultBlock } from '@/app/builder/elements/blocks/registry';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Card } from '@/components/ui/card';
import { cardSchema } from '@/app/builder/elements/sections/card/card-component';

export interface AddBlockPopoverProps {
  availableBlockTypes: Array<keyof typeof BlockRegistry>;
  onAddBlock: (blockType: keyof typeof BlockRegistry, index?: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  className?: string;
  setSections?: React.Dispatch<React.SetStateAction<any[]>>;
  sections?: any[];
}

export const AddBlockPopover: React.FC<AddBlockPopoverProps> = ({
  availableBlockTypes,
  onAddBlock,
  open,
  onOpenChange,
  index,
  className,
  setSections,
  sections
}) => {
  const [localOpen, setLocalOpen] = useState(open ?? false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open !== undefined) {
      setLocalOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpenState: boolean) => {
    setLocalOpen(newOpenState);
    onOpenChange?.(newOpenState);
  };

  const handleInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    e.stopPropagation();
  };

  const handleAddBlock = (blockType: keyof typeof BlockRegistry, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Add the block
    onAddBlock(blockType, index);

    // If the block is a card, automatically add a default block to the card
    if (blockType === 'card' && setSections && sections) {
      // Find the newly added card section
      const newCardSection = sections.find(section => section.type === 'card');
      
      if (newCardSection) {
        // Create a default block for the card
        const defaultBlock = createDefaultBlock('paragraph');
        
        // Update the card section with the default block
        const updatedSections = sections.map(section => 
          section.id === newCardSection.id 
            ? { 
                ...section, 
                blocks: section.blocks ? [...section.blocks, defaultBlock] : [defaultBlock] 
              } 
            : section
        );

        // Update sections with the new default block
        setSections(updatedSections);
      }
    }
  };

  return (
    <Popover 
      open={localOpen}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full shadow-sm bg-blue-600 text-white hover:bg-blue-700 h-6 w-6 relative z-20 ${className}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-1 1h-3a1 1 0 110-2h3V9a1 1 0 011-1V6a1 1 0 110-2z" clipRule="evenodd" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        ref={popoverRef}
        className="w-72 p-2"
        onMouseDown={handleInteraction}
        onFocus={handleInteraction}
        onClick={handleInteraction}
      >
        <div 
          className="grid grid-cols-3 gap-2"
          onMouseDown={handleInteraction}
          onFocus={handleInteraction}
          onClick={handleInteraction}
        >
          {availableBlockTypes.map(blockType => {
            const BlockIcon = BlockRegistry[blockType].icon;
            return (
              <Button 
                key={blockType} 
                variant="ghost"
                onClick={(e) => handleAddBlock(blockType, e)}
                className="flex flex-col items-center justify-center h-20 hover:bg-blue-50 space-y-2 p-2"
              >
                <BlockIcon className="h-6 w-6 text-gray-600" />
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {blockType}
                </span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddBlockPopover;
