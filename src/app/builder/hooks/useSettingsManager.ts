import { useState, useEffect } from "react";
import { Section } from "@/app/builder/types";
import { SETTINGS_CONSTANTS } from "@/app/builder/types";

export const useSettingsManager = (
  section: Section,
  onUpdateSection: (updates: Record<string, any>) => void
) => {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(
    () => ({
      ...section.settings,
      paddingTop:
        section.settings.paddingTop || SETTINGS_CONSTANTS.DEFAULT_PADDING,
      paddingBottom:
        section.settings.paddingBottom || SETTINGS_CONSTANTS.DEFAULT_PADDING,
    })
  );

  const [padding, setPadding] = useState({
    top: localSettings.paddingTop || SETTINGS_CONSTANTS.DEFAULT_PADDING,
    bottom: localSettings.paddingBottom || SETTINGS_CONSTANTS.DEFAULT_PADDING,
  });

  useEffect(() => {
    setLocalSettings({
      ...section.settings,
      paddingTop:
        section.settings.paddingTop || SETTINGS_CONSTANTS.DEFAULT_PADDING,
      paddingBottom:
        section.settings.paddingBottom || SETTINGS_CONSTANTS.DEFAULT_PADDING,
    });
  }, [section.id, section.settings]);

  useEffect(() => {
    setPadding({
      top: localSettings.paddingTop || SETTINGS_CONSTANTS.DEFAULT_PADDING,
      bottom: localSettings.paddingBottom || SETTINGS_CONSTANTS.DEFAULT_PADDING,
    });
  }, [localSettings.paddingTop, localSettings.paddingBottom]);

  const handleSettingChange = (fieldId: string, value: any) => {
    const updatedSettings = { ...localSettings, [fieldId]: value };
    setLocalSettings(updatedSettings);

    window.parent.postMessage(
      {
        type: "UPDATE_SECTION",
        sectionId: section.id,
        updates: { settings: updatedSettings },
      },
      "*"
    );

    onUpdateSection?.({ settings: updatedSettings });
  };

  const handlePaddingChange = (type: "top" | "bottom", value: number) => {
    const fieldId = type === "top" ? "paddingTop" : "paddingBottom";
    setPadding((prev) => ({ ...prev, [type]: value }));
    handleSettingChange(fieldId, value);
  };

  return {
    localSettings,
    padding,
    handleSettingChange,
    handlePaddingChange,
  };
};
