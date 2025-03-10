"use client";
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import RadioButtonGroup from "./RadioButtonGroup";
import RangeSlider from "../../GlobalSettings/settings/RangeSlider";
import { CaseLower, CaseSensitive, CaseUpper } from "lucide-react";
import { ColorSchemeSelector } from "@/app/builder/components/ColorSchemeSelector";

interface HeaderBottomSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function HeaderBottomSettings({
  settings = {},
  onUpdateSettings,
}: HeaderBottomSettingsProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }

    // Send message to iframe
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_HEADER_SETTINGS",
          settings: { [field]: value },
        },
        "*"
      );
    }
  };

  // Send the bottom section enabled state to the iframe when it changes
  useEffect(() => {
    // When component mounts or when bottomEnabled changes, send current state to iframe
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_HEADER_SETTINGS",
          settings: { bottomEnabled: settings.bottomEnabled },
        },
        "*"
      );
    }
  }, [settings.bottomEnabled]); // Re-run when enabled state changes

  return (
    <div className="space-y-6">
      {/* Layout Settings */}
      <SettingSection
        title="Layout"
        description="Configure bottom header section layout"
      >
        <div className="space-y-6">
          {/* Enable Bottom Section */}
          <div className="flex items-center justify-between">
            <Label>Enable Bottom Section</Label>
            <Switch
              checked={settings.bottomEnabled}
              onCheckedChange={(checked) =>
                handleUpdate("bottomEnabled", checked)
              }
            />
          </div>

          {/* Only show other settings if bottom section is enabled */}
          {settings.bottomEnabled && (
            <>
              {/* Height Slider */}
              <div className="space-y-2">
                <Label>Height</Label>
                <RangeSlider
                  value={settings.bottomHeight || 80}
                  onValueChange={(value) => handleUpdate("bottomHeight", value)}
                />
              </div>

              {/* Color Scheme */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Color Scheme</Label>
                </div>
                <ColorSchemeSelector
                  value={settings.bottomColorScheme || ""}
                  onChange={(value) => handleUpdate("bottomColorScheme", value)}
                  width="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a color scheme for the bottom header section
                </p>
              </div>

              {/* Header Width */}
              <div className="space-y-4">
                <Label>Header Width</Label>
                <RadioButtonGroup
                  options={[
                    { id: "boxed", value: "boxed", label: "Boxed" },
                    {
                      id: "full-width",
                      value: "full-width",
                      label: "Full Width",
                    },
                  ]}
                  name="textTransform"
                  required
                />
              </div>

              {/* Background Image */}
              <div className="space-y-4">
                <Label>Background Image</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      value={settings.backgroundImage}
                      onChange={(value) =>
                        handleUpdate("backgroundImage", value)
                      }
                      type="file"
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Shadow Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Shadow</Label>
                  <Switch
                    checked={settings.bottomEnableShadow}
                    onCheckedChange={(checked) =>
                      handleUpdate("bottomEnableShadow", checked)
                    }
                  />
                </div>

                {settings.bottomEnableShadow && (
                  <div className="space-y-4">
                    <Label>Shadow Type</Label>
                    <RadioGroup
                      defaultValue={settings.bottomShadowType || "small"}
                      onValueChange={(value) =>
                        handleUpdate("bottomShadowType", value)
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="small"
                          id="bottom-shadow-small"
                        />
                        <Label htmlFor="bottom-shadow-small">Small</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="large"
                          id="bottom-shadow-large"
                        />
                        <Label htmlFor="bottom-shadow-large">Large</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="xxl" id="bottom-shadow-xxl" />
                        <Label htmlFor="bottom-shadow-xxl">XXL</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Divider Settings */}
              <div className="flex items-center justify-between">
                <Label>Enable Divider</Label>
                <Switch
                  checked={settings.bottomEnableDivider}
                  onCheckedChange={(checked) =>
                    handleUpdate("bottomEnableDivider", checked)
                  }
                />
              </div>
            </>
          )}
        </div>
      </SettingSection>

      {/* Only show Navigation Settings if bottom section is enabled */}
      {settings.bottomEnabled && (
        <SettingSection
          title="Navigation"
          description="Configure bottom header navigation settings"
        >
          <div className="space-y-6">
            {/* Navigation Style */}
            <div className="space-y-4">
              <Label>Navigation Style</Label>
              <RadioButtonGroup
                options={[
                  { id: "default", value: "default", label: "Default" },
                  { id: "bordered", value: "bordered", label: "Bordered" },
                  { id: "shadow", value: "shadow", label: "Shadow" },
                ]}
                name="bottomNavStyle"
                required
              />
            </div>

            {/* Nav Size */}
            <div className="space-y-4">
              <Label>Nav Size</Label>
              <RadioButtonGroup
                options={[
                  { id: "xs", value: "xs", label: "XS" },
                  { id: "s", value: "s", label: "S" },
                  { id: "default", value: "default", label: "Default" },
                  { id: "m", value: "m", label: "M" },
                  { id: "l", value: "l", label: "L" },
                  { id: "xl", value: "xl", label: "XXL" },
                ]}
                name="navSize"
                required
              />
            </div>

            {/* Nav Alignment */}
            <div className="space-y-4">
              <Label>Nav Alignment</Label>
              <RadioButtonGroup
                options={[
                  { id: "left", value: "left", label: "Left" },
                  { id: "center", value: "center", label: "Center" },
                  { id: "right", value: "right", label: "Right" },
                ]}
                name="bottomNavAlignment"
                required
              />
            </div>

            {/* Text Transform */}
            <div className="space-y-4">
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
                name="bottomTextTransform"
                required
              />
            </div>
          </div>
        </SettingSection>
      )}
      <SettingSection
        title="Additional HTML"
        description="Add additional HTML to the header"
      >
        {/* Additional HTML */}
        <CodeEditor
          className="border rounded mt-4"
          value={settings.additionalHtml || ""}
          language="html"
          minHeight={200}
          onChange={(e) => handleUpdate("additionalHtml", e.target.value)}
          placeholder="Please enter HTML code."
          padding={15}
          style={{
            backgroundColor: "#f5f5f5",
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </SettingSection>
    </div>
  );
}
