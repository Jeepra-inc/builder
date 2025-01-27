"use client";
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { SortableItemProps, ExtendedSortableArguments, ActionButtonProps } from '@/app/builder/types';

// Reusable action button component
const ActionButton = ({
  icon: Icon,
  tooltip,
  onClick,
  className = "",
}: ActionButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={`w-6 h-4 ${className}`}
        onClick={onClick}
      >
        <Icon className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

export function SortableItem({
  section,
  onHover,
  onSelectSection,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  isOverlay = false,
  isDragging = false,
  className = "",
}: SortableItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Outer DnD for the entire section
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: section.id,
    disabled: isOverlay,
    activationConstraint: {
      type: "pointer",
      activationMethod: "pointer",
    },
  } as ExtendedSortableArguments);

  const style = {
    transform: transform
      ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 })
      : undefined,
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: "move",
  };

  const dragHandleAttributes = { ...attributes, ...listeners };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover(section.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(null);
  };

  const handleSectionClick = () => {
    const event = new CustomEvent("open-section-settings", {
      detail: { sectionId: section.id },
    });
    window.dispatchEvent(event);
    onSelectSection?.(section.id);
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`p-2 rounded-md cursor-pointer transition-colors duration-200 ${
          isOverlay ? "" : isHovered ? "bg-blue-50" : "bg-gray-100/50"
        } ${className}`}
        onClick={handleSectionClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 flex-grow">
            <div
              {...dragHandleAttributes}
              className="cursor-move w-4 h-4 text-gray-400 mr-2"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium flex-grow">{section.type}</span>
          </div>

          {!isOverlay && isHovered && (
            <div className="flex space-x-2 ml-auto">
              <ActionButton
                icon={section.isVisible ? Eye : EyeOff}
                tooltip={section.isVisible ? "Hide" : "Show"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(section);
                }}
              />
              <ActionButton
                icon={Copy}
                tooltip="Duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.();
                }}
              />
              <ActionButton
                icon={Trash2}
                tooltip="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-red-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
