'use client';

import React from 'react';
import { Section, SettingField } from '@/app/builder/types';
import { sections } from '@/app/builder/elements/sections';
import { SectionSettingsRendererProps } from '@/app/builder/types';
import { useSettingsManager } from '../../hooks/useSettingsManager';
import {
  FieldWrapper,
  TextInput,
  TextArea,
  NumberInput,
  SelectInput,
  ColorInput,
  RangeInput,
} from './SettingsInputs';

const InputComponents = {
  text: TextInput,
  textarea: TextArea,
  number: NumberInput,
  select: SelectInput,
  color: ColorInput,
  range: RangeInput,
};

export function SectionSettingsRenderer({ section, onUpdateSection }: SectionSettingsRendererProps) {
  const {
    localSettings,
    padding,
    handleSettingChange,
    handlePaddingChange,
  } = useSettingsManager(section, onUpdateSection);

  const getCorrectSectionConfig = () => sections.sections[section.type] || null;
  const correctSectionConfig = getCorrectSectionConfig();

  if (!correctSectionConfig) {
    return <div>No settings schema available for this section type: {section.type}</div>;
  }

  const schemaFields = correctSectionConfig.settings || [];

  return (
    <div className="space-y-4">
      <FieldWrapper id="paddingTop" label="Top Padding">
        <NumberInput
          value={padding.top}
          onChange={(value) => handlePaddingChange('top', value)}
        />
      </FieldWrapper>

      <FieldWrapper id="paddingBottom" label="Bottom Padding">
        <NumberInput
          value={padding.bottom}
          onChange={(value) => handlePaddingChange('bottom', value)}
        />
      </FieldWrapper>

      {schemaFields.map((field: SettingField) => {
        const currentValue = localSettings?.[field.id];
        const Component = InputComponents[field.type as keyof typeof InputComponents];

        if (!Component) {
          return <div key={field.id}>Unsupported field type: {field.type}</div>;
        }

        const fieldProps = {
          value: currentValue ?? field.default ?? '',
          onChange: (val: any) => handleSettingChange(field.id, val),
          ...field,
        };

        return (
          <FieldWrapper key={field.id} id={field.id} label={field.label}>
            <Component {...fieldProps} />
          </FieldWrapper>
        );
      })}
    </div>
  );
}
