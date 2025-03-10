import React, { useState } from "react";
import RangeSlider from "./RangeSlider";
import { ColSection } from "./colSection";

export function ButtonSettings() {
  const [borderThickness, setBorderThickness] = useState(1);
  const [borderOpacity, setBorderOpacity] = useState(100);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(5);

  return (
    <>
      <div className="p-3 pb-0">
        <h3 className="font-semibold">Border</h3>
        <p className="text-xs">Customize button borders</p>
      </div>
      <ColSection title="Thickness" divider={false} className="pb-0">
        <RangeSlider
          value={borderThickness}
          onInput={(e) => setBorderThickness(parseFloat(e.target.value))}
          unit="px"
          min={0}
          max={20}
          step={1}
        />
      </ColSection>
      <ColSection title="Opacity" divider={false} className="pb-0">
        <RangeSlider
          value={borderOpacity}
          onInput={(e) => setBorderOpacity(parseFloat(e.target.value))}
          unit="%"
          min={0}
          max={100}
          step={1}
        />
      </ColSection>
      <ColSection title="Corner radius">
        <RangeSlider
          value={cornerRadius}
          onInput={(e) => setCornerRadius(parseFloat(e.target.value))}
          unit="px"
          min={0}
          max={50}
          step={1}
        />
      </ColSection>
      <div className="p-3 pb-0">
        <h3 className="font-semibold">Shadow</h3>
        <p className="text-xs">Adjust shadow properties</p>
      </div>
      <ColSection title="Opacity" divider={false} className="pb-0">
        <RangeSlider
          value={shadowOpacity}
          onInput={(e) => setShadowOpacity(parseFloat(e.target.value))}
          unit="%"
          min={0}
          max={100}
          step={1}
        />
      </ColSection>
      <ColSection title="Horizontal offset" divider={false} className="pb-0">
        <RangeSlider
          value={horizontalOffset}
          onInput={(e) => setHorizontalOffset(parseFloat(e.target.value))}
          unit="px"
          min={-50}
          max={50}
          step={1}
        />
      </ColSection>
      <ColSection title="Vertical offset" divider={false} className="pb-0">
        <RangeSlider
          value={verticalOffset}
          onInput={(e) => setVerticalOffset(parseFloat(e.target.value))}
          unit="px"
          min={-50}
          max={50}
          step={1}
        />
      </ColSection>
      <ColSection title="Blur" divider={false} className="pb-0">
        <RangeSlider
          value={shadowBlur}
          onInput={(e) => setShadowBlur(parseFloat(e.target.value))}
          unit="px"
          min={0}
          max={50}
          step={1}
        />
      </ColSection>
    </>
  );
}
