'use client';
import React, { useEffect } from 'react';
import { ComponentOutlineProps } from '@/app/builder/types';
import { useOutlineManager } from '../../hooks/useOutlineManager';
import { OutlineBox, OutlineLabel } from './OutlineElements';

export const ComponentOutline: React.FC<ComponentOutlineProps> = ({ enabled = true }) => {
  const {
    hovered,
    selected,
    isTopComponent,
    handlers: {
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleScrollOrResize,
    },
  } = useOutlineManager(enabled);

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [
    enabled,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleScrollOrResize,
  ]);

  if (!enabled) return null;

  const getLabelPosition = (rect: DOMRect | null) => {
    if (!rect) return { top: '-24px', left: '0' };
    return isTopComponent(rect)
      ? { top: '4px', left: '4px' }
      : { top: '-24px', left: '0' };
  };

  return (
    <>
      {/* Hover Outline */}
      <OutlineBox rect={hovered.rect} isSelected={false}>
        <OutlineLabel
          sectionType={hovered.sectionType}
          isSelected={false}
          style={getLabelPosition(hovered.rect)}
        />
      </OutlineBox>

      {/* Selected Outline */}
      <OutlineBox rect={selected.rect} isSelected={true}>
        <OutlineLabel
          sectionType={selected.sectionType}
          isSelected={true}
          style={getLabelPosition(selected.rect)}
        />
      </OutlineBox>
    </>
  );
};

export default ComponentOutline;
