import React from 'react';
import { OutlineBoxProps, OutlineLabelProps, OUTLINE_CONSTANTS, OUTLINE_LABEL_STYLE } from '@/app/builder/types';

export const OutlineLabel: React.FC<OutlineLabelProps> = ({ 
  sectionType, 
  isSelected, 
  style 
}) => (
  <div
    style={{
      ...OUTLINE_LABEL_STYLE,
      backgroundColor: isSelected ? OUTLINE_CONSTANTS.SELECTED_LABEL_BG : OUTLINE_CONSTANTS.HOVER_LABEL_BG,
      ...style,
    }}
  >
    {sectionType}{isSelected ? ' (Selected)' : ''}
  </div>
);

export const OutlineBox: React.FC<OutlineBoxProps> = ({ 
  rect, 
  isSelected, 
  children 
}) => {
  if (!rect) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    pointerEvents: 'none',
    zIndex: OUTLINE_CONSTANTS.Z_INDEX,
    boxSizing: 'border-box',
    border: isSelected ? OUTLINE_CONSTANTS.SELECTED_BORDER : OUTLINE_CONSTANTS.HOVER_BORDER,
    backgroundColor: isSelected ? OUTLINE_CONSTANTS.SELECTED_BG : OUTLINE_CONSTANTS.HOVER_BG,
    borderRadius: rect.top <= OUTLINE_CONSTANTS.TOP_THRESHOLD ? '8px 8px 0 0' : '0',
  };

  return <div style={style}>{children}</div>;
};
