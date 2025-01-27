"use client";
import React from 'react';
import { ViewportSizeControls } from './ViewportSizeControls';
import { UndoRedoControls } from './UndoRedoControls';
import type { TopBarProps } from '../../types';

export function TopBar({
  viewportSize,
  onViewportChange,
  onUndo,
  onRedo,
}: TopBarProps ) {
  return (
    <div className="flex justify-between items-center p-2 border-b">
      <div className="flex items-center space-x-2">
      </div>
      <div className="flex items-center space-x-2">
        <ViewportSizeControls currentSize={viewportSize} onChange={onViewportChange} />
        <UndoRedoControls onUndo={onUndo} onRedo={onRedo} />
      </div>
    </div>
  );
}
