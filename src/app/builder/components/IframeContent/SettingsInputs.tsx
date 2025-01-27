import React from 'react';
import { 
  InputComponentProps, 
  SelectProps, 
  RangeProps, 
  FieldWrapperProps,
  SETTINGS_CONSTANTS 
} from '@/app/builder/types';

export const FieldWrapper: React.FC<FieldWrapperProps> = ({ id, label, children }) => (
  <div key={id}>
    <label className={SETTINGS_CONSTANTS.INPUT_STYLES.LABEL}>{label}</label>
    {children}
  </div>
);

export const TextInput: React.FC<InputComponentProps<string>> = ({ value, onChange, ...props }) => (
  <input
    type="text"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const TextArea: React.FC<InputComponentProps<string>> = ({ value, onChange, ...props }) => (
  <textarea
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const NumberInput: React.FC<InputComponentProps<number>> = ({ value, onChange, ...props }) => (
  <input
    type="number"
    value={value ?? ''}
    onChange={(e) => onChange(Number(e.target.value))}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const SelectInput: React.FC<SelectProps> = ({ value, onChange, options, ...props }) => (
  <select
    value={value ?? ''}
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

export const ColorInput: React.FC<InputComponentProps<string>> = ({ value, onChange, ...props }) => (
  <input
    type="color"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    className={SETTINGS_CONSTANTS.INPUT_STYLES.BASE}
    {...props}
  />
);

export const RangeInput: React.FC<RangeProps> = ({ value, onChange, min, max, step, ...props }) => (
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
