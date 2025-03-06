import React, { useState } from 'react';
import { SettingSection } from './SettingSection';
import RangeSlider from './RangeSlider';

export function MediaSettings() {
  const [borderThickness, setBorderThickness] = useState(1);
  const [borderOpacity, setBorderOpacity] = useState(5);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(5);

  return (
    <div className="space-y-6">
      <SettingSection title="Border" description="Customize media borders">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thickness</label>
            <RangeSlider
              value={borderThickness}
              onInput={(e) => setBorderThickness(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={10}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Opacity</label>
            <RangeSlider
              value={borderOpacity}
              onInput={(e) => setBorderOpacity(parseFloat(e.target.value))}
              unit="%"
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Corner radius</label>
            <RangeSlider
              value={cornerRadius}
              onInput={(e) => setCornerRadius(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={30}
              step={1}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Shadow" description="Adjust media shadow properties">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Opacity</label>
            <RangeSlider
              value={shadowOpacity}
              onInput={(e) => setShadowOpacity(parseFloat(e.target.value))}
              unit="%"
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horizontal offset</label>
            <RangeSlider
              value={horizontalOffset}
              onInput={(e) => setHorizontalOffset(parseFloat(e.target.value))}
              unit="px"
              min={-30}
              max={30}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vertical offset</label>
            <RangeSlider
              value={verticalOffset}
              onInput={(e) => setVerticalOffset(parseFloat(e.target.value))}
              unit="px"
              min={-30}
              max={30}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Blur</label>
            <RangeSlider
              value={shadowBlur}
              onInput={(e) => setShadowBlur(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={30}
              step={1}
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}