"use client";
import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { SortableItemProps, ActionButtonProps } from "@/app/builder/types";

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
  index,
  onHover,
  onSelectSection,
  onDuplicate,
  onDelete,
  onToggleVisibility,
  isDragging = false,
  selectedSectionId,
  className = "",
}: SortableItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced sortable setup with custom options
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingNow,
    isSorting,
    over,
  } = useSortable({
    id: section.id,
    data: {
      type: "section",
      section,
      index,
    },
    animateLayoutChanges: () => false, // Disable automatic layout animations
  });

  // Combined dragging state
  const isActive = isDragging || isDraggingNow;
  const isSelected = selectedSectionId === section.id;
  const isOver = over?.id === section.id;

  // Safely check if the section is visible (undefined should be treated as visible)
  const isVisible = section.isVisible !== false;

  // Enhanced style with better visual feedback
  const style = {
    transform: CSS.Transform.toString(
      transform || { x: 0, y: 0, scaleX: 1, scaleY: 1 }
    ),
    transition,
    zIndex: isActive ? 999 : isOver ? 100 : 1,
    opacity: isActive ? 0.8 : 1,
    position: isActive
      ? "relative"
      : ("static" as React.CSSProperties["position"]),
    pointerEvents: isActive
      ? "none"
      : ("auto" as React.CSSProperties["pointerEvents"]),
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(section.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  const handleSectionClick = () => {
    const event = new CustomEvent("open-section-settings", {
      detail: { sectionId: section.id },
    });
    window.dispatchEvent(event);
    onSelectSection?.(section.id);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleVisibility) {
      // Apply visibility toggle safely
      onToggleVisibility(section);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 rounded-md border border-zinc-200 cursor-pointer transition-all duration-200 
        ${isActive ? "bg-gray-200 shadow-lg" : ""}
        ${isHovered && !isActive ? "bg-blue-50" : "bg-gray-100/50"}
        ${isSelected ? "border-l-2 border-blue-500" : ""}
        ${isOver && !isActive ? "border border-blue-500 bg-blue-50" : ""}
        ${!isVisible ? "opacity-60" : ""} 
        ${className}
      `}
      onClick={handleSectionClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 flex-grow">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move w-6 h-6 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-100 flex items-center justify-center"
            data-drag-handle
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <span
            className={`text-sm font-medium flex-grow ${
              !isVisible ? "text-gray-400" : ""
            }`}
          >
            {section.type}
            {!isVisible && (
              <span className="ml-2 text-xs text-gray-400">(Hidden)</span>
            )}
          </span>
        </div>

        {isHovered && !isActive && (
          <div className="flex ml-auto">
            <ActionButton
              icon={isVisible ? Eye : EyeOff}
              tooltip={isVisible ? "Hide" : "Show"}
              onClick={handleToggleVisibility}
              className={!isVisible ? "text-gray-400" : ""}
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
  );
}
