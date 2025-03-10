import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColSection } from "./colSection";

export function AnimationSettings() {
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  return (
    <>
      <ColSection title="Animations" divider={false}>
        <Switch
          checked={animationsEnabled}
          onCheckedChange={setAnimationsEnabled}
        />
      </ColSection>

      {animationsEnabled && (
        <ColSection title="Hover Effects" className="pb-4 pt-0" divider={false}>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Animations</SelectLabel>
                <SelectItem value="apple">3D</SelectItem>
                <SelectItem value="banana">Vertical List</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </ColSection>
      )}
    </>
  );
}
