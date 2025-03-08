import React from "react";
import {
  OutlineBoxProps,
  OutlineLabelProps,
  OUTLINE_CONSTANTS,
  OUTLINE_LABEL_STYLE,
} from "@/app/builder/types";

export const OutlineLabel: React.FC<OutlineLabelProps> = ({
  sectionType,
  isSelected,
  style,
}) => (
  <div
    style={{
      ...OUTLINE_LABEL_STYLE,
      backgroundColor: isSelected
        ? OUTLINE_CONSTANTS.SELECTED_LABEL_BG
        : OUTLINE_CONSTANTS.HOVER_LABEL_BG,
      ...style,
    }}
  >
    {sectionType}
  </div>
);

export const OutlineBox: React.FC<OutlineBoxProps> = ({
  rect,
  isSelected,
  children,
}) => {
  if (!rect) return null;

  // Get values for styling based on selection state
  const shadowWidth = isSelected ? "0px 0px 0px 2px" : "0px 0px 0px 1px";
  const shadowColor = isSelected ? "rgb(0, 112, 243)" : "rgb(74, 144, 226)";
  // Make background color lighter for active state
  const bgColor = isSelected ? "rgba(74, 144, 226, 0.05)" : "transparent";

  // Adjust width by deducting 4px and center it by adding 2px to left
  const adjustedWidth = rect.width - 4;
  const adjustedLeft = rect.left + 2;

  // Calculate precise label position based on the element position
  const labelTop = rect.top < 40 ? rect.top + 4 : rect.top - 0;

  return (
    <>
      {/* Outline box with exact fixed positioning */}
      <div
        style={{
          position: "fixed",
          top: rect.top,
          left: adjustedLeft,
          width: adjustedWidth,
          height: rect.height,
          backgroundColor: bgColor,
          boxShadow: `${shadowColor} ${shadowWidth}`,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      {/* Label with exact fixed positioning to match the element */}
      <div
        style={{
          position: "fixed",
          top: labelTop,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        {children}
      </div>
    </>
  );
};
