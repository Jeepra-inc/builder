import React, { useState } from 'react';
import RangeSlider from './RangeSlider';

export function LayoutSettings() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Page Width</h3>
          </div>
          <RangeSlider unit="px" min={800} max={1200} step={1} />
        </div>
        <div className="flex items-center">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Space between template sections</h3>
          </div>
          <RangeSlider unit="px" min={0} max={100} step={1} />
        </div>
      </div>
      <div>
        <h4>Grid</h4>
        <div className="flex items-center">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Horizontal space</h3>
          </div>
          <RangeSlider unit="px" min={800} max={1200} step={1} />
        </div>
        <div className="flex items-center">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Vertical space</h3>
          </div>
          <RangeSlider unit="px" min={0} max={100} step={1} />
        </div>
      </div>
    </div>
  );
}