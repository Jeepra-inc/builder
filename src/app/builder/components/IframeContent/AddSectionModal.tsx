'use client';

import * as React from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import NextImage from 'next/image';
import { sectionRegistry } from '@/app/builder/elements/sections/section-registry';
import '@/app/builder/elements/sections/section-auto-register';
import { AddSectionModalProps, SectionCardProps, GroupTabProps, SectionType } from '@/app/builder/types';

// Constants
const DEFAULT_PLACEHOLDER = 'https://ui.shadcn.com/placeholder.svg';
const INITIAL_GROUP = sectionRegistry.getGroups()[0];

// Reusable Components
const SectionCard: React.FC<SectionCardProps> = React.memo(({ 
  type, 
  name, 
  placeholderImage, 
  onClick 
}) => (
  <div 
    className="cursor-pointer hover:bg-accent/10 rounded-lg p-2 text-center"
    onClick={() => onClick(type)}
  >
    <div className="aspect-video relative mb-2">
      <NextImage 
        src={placeholderImage || DEFAULT_PLACEHOLDER} 
        alt={`${name} placeholder`} 
        fill 
        className="object-cover rounded-md" 
      />
    </div>
    <p className="text-sm font-medium">{name}</p>
  </div>
));

const GroupTab: React.FC<GroupTabProps> = React.memo(({ 
  group, 
  isActive, 
  onSelect 
}) => (
  <TabsTrigger 
    value={group} 
    className="py-2 px-4 justify-start text-left hover:bg-accent/50 data-[state=active]:bg-accent/80 group"
    onMouseEnter={() => onSelect(group)}
  >
    {group.charAt(0).toUpperCase() + group.slice(1)}
  </TabsTrigger>
));

// Main Component
export const AddSectionModal: React.FC<AddSectionModalProps> = ({ 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange, 
  onAddSection 
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(INITIAL_GROUP);

  const open = externalOpen ?? internalOpen;
  const onOpenChange = externalOnOpenChange ?? setInternalOpen;

  const handleAddSection = React.useCallback((sectionType: SectionType) => {
    onAddSection(sectionType);
    onOpenChange(false);
  }, [onAddSection, onOpenChange]);

  const groups = React.useMemo(() => sectionRegistry.getGroups(), []);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-4xl h-[80vh] flex p-0 overflow-hidden" side="right" align="start">
        <VisuallyHidden>
          {/* DialogTitle removed as it's not defined */}
        </VisuallyHidden>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full flex"
        >
          <div className="w-1/4 border-r bg-accent">
            <TabsList className="grid w-full grid-cols-1 gap-0 bg-accent">
              {groups.map(group => (
                <GroupTab
                  key={group}
                  group={group}
                  isActive={activeTab === group}
                  onSelect={setActiveTab}
                />
              ))}
            </TabsList>
          </div>
          <div className="w-3/4 py-2">
            {groups.map(group => (
              <TabsContent key={group} value={group}>
                <div className="grid grid-cols-2 gap-4 p-4">
                  {sectionRegistry.getSectionsByGroup(group).map(section => (
                    <SectionCard
                      key={section.type}
                      type={section.type}
                      name={section.name}
                      placeholderImage={section.placeholderImage}
                      onClick={handleAddSection}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
