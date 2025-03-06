import React from 'react';
import { SettingSection } from './SettingSection';

export function StarterSettings() {
  return (
    <div className="space-y-6">
      <SettingSection
        title="Custom CSS"
        description="Add your own custom CSS styles"
      >
        Starter Settings
      </SettingSection>
    </div>
  );
}
