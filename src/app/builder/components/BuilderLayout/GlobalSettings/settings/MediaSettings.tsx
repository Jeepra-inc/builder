import React, { useState } from "react";
import RangeSlider from "./RangeSlider";
import { ColSection } from "./colSection";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

export function MediaSettings() {
  const [borderThickness, setBorderThickness] = useState(1);
  const [borderOpacity, setBorderOpacity] = useState(5);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(5);

  const handleFullscreen = () => {
    // Implementation for fullscreen functionality can be added here
    console.log("Fullscreen mode requested");
  };

  return (
    <>
      <div className="p-3 pb-0">
        <h3 className="font-semibold">Border</h3>
        <p className="text-xs">Customize media borders</p>
      </div>
      <ColSection title="Thickness" divider={false} className="pb-0">
        <RangeSlider
          value={borderThickness}
          onValueChange={setBorderThickness}
          min={0}
          max={10}
          step={1}
        />
      </ColSection>

      <ColSection title="Opacity" divider={false} className="pb-0">
        <RangeSlider
          value={borderOpacity}
          onValueChange={setBorderOpacity}
          min={0}
          max={100}
          step={1}
        />
      </ColSection>

      <ColSection title="Corner radius">
        <RangeSlider
          value={cornerRadius}
          onValueChange={setCornerRadius}
          min={0}
          max={30}
          step={1}
        />
      </ColSection>

      <div className="p-3 pb-0">
        <h3 className="font-semibold">Shadow</h3>
        <p className="text-xs">Adjust media shadow properties</p>
      </div>
      <ColSection title="Opacity" divider={false} className="pb-0">
        <RangeSlider
          value={shadowOpacity}
          onValueChange={setShadowOpacity}
          min={0}
          max={100}
          step={1}
        />
      </ColSection>

      <ColSection title="Horizontal offset" divider={false} className="pb-0">
        <RangeSlider
          value={horizontalOffset}
          onValueChange={setHorizontalOffset}
          min={-30}
          max={30}
          step={1}
        />
      </ColSection>

      <ColSection title="Vertical offset" divider={false} className="pb-0">
        <RangeSlider
          value={verticalOffset}
          onValueChange={setVerticalOffset}
          min={-30}
          max={30}
          step={1}
        />
      </ColSection>

      <ColSection title="Blur">
        <RangeSlider
          value={shadowBlur}
          onValueChange={setShadowBlur}
          min={0}
          max={30}
          step={1}
        />
      </ColSection>

      <div className="mt-6 px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFullscreen}
          className="flex items-center gap-1 text-xs w-full justify-center"
        >
          <Maximize2 className="h-3.5 w-3.5 mr-1" />
          Fullscreen Editor
        </Button>
      </div>
    </>
  );
}
