import React, { useEffect } from "react";
import { ColorSchemeSelector } from "../ColorSchemeSelector";

/**
 * Interface for setting field props
 */
interface SettingFieldProps {
  id: string;
  value: any;
  onChange: (value: any) => void;
  setting: any;
  disabled?: boolean;
}

/**
 * ColorScheme Field component
 * Renders a visual color scheme selector for the "colorScheme" field type
 */
export const ColorSchemeField: React.FC<SettingFieldProps> = ({
  id,
  value,
  onChange,
  setting,
  disabled = false,
}) => {
  // Add a debug log when this component renders
  useEffect(() => {
    console.log(
      "🎨 ColorSchemeField rendered for field:",
      id,
      "with value:",
      value
    );
  }, [id, value]);

  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {setting.label}
        </label>
        <ColorSchemeSelector
          value={value || ""}
          onChange={(newValue) => onChange(newValue)}
          disabled={disabled}
          width="w-full"
        />
      </div>
      {setting.description && (
        <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
      )}
    </div>
  );
};

/**
 * Returns appropriate component based on setting type
 * Use this to register custom setting input types
 */
export const getCustomSettingInput = (
  setting: any,
  id: string,
  value: any,
  onChange: (value: any) => void,
  disabled?: boolean
) => {
  // Debug log to track when this function is called
  console.log(
    "🔍 getCustomSettingInput called for:",
    id,
    "type:",
    setting?.type,
    "id:",
    setting?.id
  );

  // Check if this is a colorScheme field
  if (setting.id === "colorScheme") {
    console.log("✅ Found colorScheme field, using ColorSchemeField component");
    return (
      <ColorSchemeField
        key={id}
        id={id}
        value={value}
        onChange={onChange}
        setting={setting}
        disabled={disabled}
      />
    );
  }

  // Return null for other types (will fall back to default inputs)
  return null;
};
