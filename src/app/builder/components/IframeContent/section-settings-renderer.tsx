"use client";

import React, { useEffect } from "react";
import { SettingField } from "@/app/builder/types";
import { sections } from "@/app/builder/elements/sections";
import { SectionSettingsRendererProps } from "@/app/builder/types";
import { useSettingsManager } from "../../hooks/useSettingsManager";
import { FieldWrapper, NumberInput, InputComponent } from "./SettingsInputs";

export function SectionSettingsRenderer({
  section,
  onUpdateSection,
}: SectionSettingsRendererProps) {
  const { localSettings, padding, handleSettingChange, handlePaddingChange } =
    useSettingsManager(section, onUpdateSection);

  const getCorrectSectionConfig = () => sections.sections[section.type] || null;
  const correctSectionConfig = getCorrectSectionConfig();

  // Debug log when the renderer is mounted or section changes
  useEffect(() => {
    console.log(
      "🛠️ SectionSettingsRenderer mounted for section type:",
      section.type
    );
    console.log("🛠️ Section config:", correctSectionConfig);
    console.log("🛠️ Current section settings:", localSettings);
  }, [section.type]);

  if (!correctSectionConfig) {
    return (
      <div>
        No settings schema available for this section type: {section.type}
      </div>
    );
  }

  const schemaFields = correctSectionConfig.settings || [];

  // Debug log the schema fields
  console.log("🛠️ Schema fields:", schemaFields);
  // Check specifically for colorScheme fields
  const colorSchemeFields = schemaFields.filter(
    (field: SettingField) => field.id === "colorScheme"
  );
  console.log("🛠️ ColorScheme fields found:", colorSchemeFields);

  return (
    <div className="space-y-4">
      <FieldWrapper id="paddingTop" label="Top Padding">
        <NumberInput
          value={padding.top}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            const value = target.valueAsNumber;
            handlePaddingChange("top", value);
          }}
        />
      </FieldWrapper>

      <FieldWrapper id="paddingBottom" label="Bottom Padding">
        <NumberInput
          value={padding.bottom}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            const value = target.valueAsNumber;
            handlePaddingChange("bottom", value);
          }}
        />
      </FieldWrapper>

      {schemaFields.map((field: SettingField) => {
        const currentValue = localSettings?.[field.id];

        // Debug log for each field being rendered
        console.log(
          `🛠️ Rendering field: ${field.id}, type: ${field.type}, value:`,
          currentValue
        );

        // Use our InputComponent which handles custom input types
        return (
          <InputComponent
            key={field.id}
            id={field.id}
            type={field.type}
            value={currentValue !== undefined ? currentValue : field.default}
            onChange={(val: any) => handleSettingChange(field.id, val)}
            options={field.options}
            min={field.min}
            max={field.max}
            step={field.step}
            setting={field}
          />
        );
      })}
    </div>
  );
}
