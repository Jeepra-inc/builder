import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import RangeSlider from "./RangeSlider";
import { ColSection } from "./colSection";

export function BlogCardSettings() {
  const [style, setStyle] = useState<"standard" | "card">("card");
  const [imagePadding, setImagePadding] = useState(0);
  const [textAlignment, setTextAlignment] = useState<
    "left" | "center" | "right"
  >("left");
  const [colorScheme, setColorScheme] = useState("scheme-2");
  const [borderThickness, setBorderThickness] = useState(0);
  const [borderOpacity, setBorderOpacity] = useState(10);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(5);

  return (
    <>
      <ColSection title="Style" divider={false} className="pb-0">
        <ButtonGroup>
          <Button
            variant={style === "standard" ? "default" : "outline"}
            onClick={() => setStyle("standard")}
          >
            Standard
          </Button>
          <Button
            variant={style === "card" ? "default" : "outline"}
            onClick={() => setStyle("card")}
          >
            Card
          </Button>
        </ButtonGroup>
      </ColSection>

      <ColSection title="Image Padding" divider={false} className="pb-0">
        <RangeSlider
          value={imagePadding}
          onValueChange={setImagePadding}
          min={0}
          max={50}
          step={1}
        />
      </ColSection>

      <ColSection title="Text Alignment" divider={false} className="pb-0">
        <ButtonGroup>
          <Button
            variant={textAlignment === "left" ? "default" : "outline"}
            onClick={() => setTextAlignment("left")}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlignment === "center" ? "default" : "outline"}
            onClick={() => setTextAlignment("center")}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={textAlignment === "right" ? "default" : "outline"}
            onClick={() => setTextAlignment("right")}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </ColSection>

      <ColSection title="Color Scheme">
        <Select value={colorScheme} onValueChange={setColorScheme}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select scheme" />
          </SelectTrigger>
          <SelectContent>
            {["scheme-1", "scheme-2", "scheme-3"].map((scheme) => (
              <SelectItem key={scheme} value={scheme}>
                <div className="flex items-center gap-2">
                  {colorScheme === scheme && <Check className="h-4 w-4" />}
                  {scheme.replace("scheme-", "Scheme ")}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ColSection>

      <div className="p-3 pb-0">
        <h3 className="font-semibold">Border</h3>
        <p className="text-xs">Customize card borders</p>
      </div>
      <ColSection title="Thickness" divider={false} className="pb-0">
        <RangeSlider
          value={borderThickness}
          onValueChange={setBorderThickness}
          min={0}
          max={20}
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
          min={-50}
          max={50}
          step={1}
        />
      </ColSection>

      <ColSection title="Vertical offset" divider={false} className="pb-0">
        <RangeSlider
          value={verticalOffset}
          onValueChange={setVerticalOffset}
          min={-50}
          max={50}
          step={1}
        />
      </ColSection>

      <ColSection title="Blur">
        <RangeSlider
          value={shadowBlur}
          onValueChange={setShadowBlur}
          min={0}
          max={50}
          step={1}
        />
      </ColSection>
    </>
  );
}
