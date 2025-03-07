import React from "react";
import {
  InputComponentProps,
  SelectProps,
  RangeProps,
  FieldWrapperProps,
  SETTINGS_CONSTANTS,
} from "@/app/builder/types";
import { Input } from "@/components/ui/input";
import { getCustomSettingInput } from "./CustomSettingsInputs";

interface LocalInputComponentProps<T> {
  value: T;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  id,
  label,
  children,
}) => (
  <div key={id}>
    <label className={SETTINGS_CONSTANTS.INPUT_STYLES.LABEL}>{label}</label>
    {children}
  </div>
);

export const TextInput: React.FC<LocalInputComponentProps<string>> = ({
  value,
  onChange,
  ...props
}) => (
  <Input
    type="text"
    value={value ?? ""}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const TextArea: React.FC<LocalInputComponentProps<string>> = ({
  value,
  onChange,
  ...props
}) => (
  <textarea
    value={value ?? ""}
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const NumberInput: React.FC<LocalInputComponentProps<number>> = ({
  value,
  onChange,
  ...props
}) => (
  <Input
    type="number"
    value={value ?? ""}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const SelectInput: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  ...props
}) => (
  <select
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  >
    {options?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export const ColorInput: React.FC<LocalInputComponentProps<string>> = ({
  value,
  onChange,
  ...props
}) => (
  <Input
    type="color"
    value={value ?? ""}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const RangeInput: React.FC<RangeProps> = ({
  value,
  onChange,
  min,
  max,
  step,
  ...props
}) => (
  <div>
    <input
      type="range"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="block w-full"
      {...props}
    />
    <div className="text-sm text-gray-500 mt-1">Value: {value ?? 0}</div>
  </div>
);

export const InputComponent: React.FC<InputComponentProps<any>> = ({
  id,
  type,
  value,
  onChange,
  options,
  min,
  max,
  step,
  setting,
  ...props
}) => {
  // First, check for custom input based on setting
  const customInput = getCustomSettingInput(
    setting,
    id,
    value,
    onChange,
    props.disabled
  );

  // If we have a custom input for this setting, use it
  if (customInput) {
    return customInput;
  }

  // Otherwise, use standard inputs based on type
  switch (type) {
    case "text":
    case "email":
    case "url":
    case "password":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <TextInput
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
        </FieldWrapper>
      );
    case "textarea":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <TextArea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
        </FieldWrapper>
      );
    case "number":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <NumberInput
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            {...props}
          />
        </FieldWrapper>
      );
    case "select":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <SelectInput
            value={value as string}
            onChange={onChange}
            options={options}
            {...props}
          />
        </FieldWrapper>
      );
    case "color":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <ColorInput
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
        </FieldWrapper>
      );
    case "range":
      return (
        <FieldWrapper id={id} label={setting.label}>
          <RangeInput
            value={value as number}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            {...props}
          />
        </FieldWrapper>
      );
    default:
      return (
        <FieldWrapper id={id} label={setting.label}>
          <TextInput
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
        </FieldWrapper>
      );
  }
};
