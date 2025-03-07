"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Label } from "@/components/ui/label";
import RangeSlider from "../../GlobalSettings/settings/RangeSlider";
import { CaseLower, CaseSensitive, CaseUpper, Palette } from "lucide-react";
import RadioButtonGroup from "./RadioButtonGroup";
import { ColorSchemeSelector } from "@/app/builder/components/ColorSchemeSelector";

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

      {/* Color Scheme Selection */}
      <SettingSection
        title="Color Scheme"
        description="Choose a color scheme for the top bar"
        className="pt-4"
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label>Visual Theme</Label>
          </div>
          <ColorSchemeSelector
            value={settings.topBarColorScheme || ""}
            onChange={(value) => {
              console.log("TopBar: Selected color scheme:", value);
              handleSettingUpdate("topBarColorScheme")(value);
            }}
            width="w-full"
          />
        </div>
      </SettingSection>

      {/* Navigation Settings */}
      <SettingSection>
        <div className="space-y-6 mt-4">
          <div className="mt-4">
            <Label>Height</Label>
            <RangeSlider value={settings.topBarHeight} />
          </div>
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
        </div>
      </SettingSection>
    </>
  );
}
