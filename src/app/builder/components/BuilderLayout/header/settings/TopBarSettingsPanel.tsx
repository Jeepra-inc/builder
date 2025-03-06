"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Label } from "@/components/ui/label";
import RangeSlider from "../../GlobalSettings/settings/RangeSlider";
import { CaseLower, CaseSensitive, CaseUpper } from "lucide-react";
import RadioButtonGroup from "./RadioButtonGroup";

interface TopBarSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function TopBarSettingsPanel({
  settings = {},
  onUpdateSettings,
}: TopBarSettingsPanelProps) {
  const { isTopBarVisible, setIsTopBarVisible } = useBuilder();

  const handleSettingUpdate = (key: string) => (value: string | number) => {
    onUpdateSettings?.({ [key]: value });
    sendIframeMessage({ [key]: value });
  };

  const sendIframeMessage = (settings: any) => {
    const iframe = document.querySelector("iframe");
    iframe?.contentWindow?.postMessage(
      { type: "UPDATE_HEADER_SETTINGS", settings },
      "*"
    );
  };

  return (
    <>
      {/* Enable Top Bar */}
      <SettingSection
        title="Top Bar Visibility"
        description="Toggle the visibility of the top bar section"
        className="flex gap-2 items-center justify-between"
      >
        <Switch
          checked={isTopBarVisible}
          onCheckedChange={(checked) => {
            setIsTopBarVisible(checked);
            handleSettingUpdate("topBarVisible")(`${checked}`);
          }}
          aria-label="Toggle top bar visibility"
        />
      </SettingSection>

      {/* Layout Settings */}
      <SettingSection
        title="Layout"
        description="Configure the top bar layout settings"
      >
        {/* Height Slider */}
        <div className="mt-4">
          <Label>Height</Label>
          <RangeSlider value={settings.topBarHeight} />
        </div>

        {/* Color Scheme */}
        <div className="space-y-2">
          <Label>Color Scheme</Label>
          <RadioButtonGroup
            options={[
              { id: "light", value: "light", label: "Light" },
              { id: "dark", value: "dark", label: "Dark" },
            ]}
            name="colorScheme"
            required
          />
        </div>
      </SettingSection>

      {/* Navigation Settings */}
      <SettingSection
        title="Navigation"
        description="Configure the top bar navigation settings"
      >
        <div className="space-y-6 mt-4">
          {/* Navigation Style */}
          <div className="space-y-2">
            <Label>Navigation Style</Label>
            <RadioButtonGroup
              options={Array.from({ length: 9 }, (_, i) => ({
                id: `style${i + 1}`,
                value: `style${i + 1}`,
                label: `${i + 1}`,
              }))}
              name="navStyle"
              required
            />
          </div>

          {/* Text Transform */}
          <div className="space-y-2">
            <Label>Text Transform</Label>
            <RadioButtonGroup
              options={[
                { id: "uppercase", value: "uppercase", label: <CaseUpper /> },
                {
                  id: "capitalize",
                  value: "capitalize",
                  label: <CaseSensitive />,
                },
                { id: "lowercase", value: "lowercase", label: <CaseLower /> },
              ]}
              name="textTransform"
              required
            />
          </div>

          {/* Navigation Height */}
          <div className="space-y-2">
            <Label>Navigation Height</Label>
            <RangeSlider
              value={settings.topBarNavHeight}
              onValueChange={(v) => handleSettingUpdate("topBarNavHeight")(v)}
            />
          </div>
        </div>
      </SettingSection>
    </>
  );
}