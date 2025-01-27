import React, { useEffect } from 'react';
import { useBuilder } from '../../../contexts/BuilderContext';
import { Input } from '@/components/ui/input';
import { SettingSection } from '../SettingSection';

export function TypographySettings() {
  const { headingColor, setHeadingColor } = useBuilder();

  // Update iframe whenever typography settings change
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_TYPOGRAPHY',
        settings: {
          headingColor,
        }
      }, '*');
    }
  }, [headingColor]);

  return (
    <div className="space-y-6">
      <SettingSection
        title="Heading Colors"
        description="Set the color for your headings"
      >
        <div>
          <label className="text-sm font-medium mb-2 block">H1 Color</label>
          <Input
            type="color"
            value={headingColor}
            onChange={(e) => setHeadingColor(e.target.value)}
            className="w-full"
          />
        </div>
      </SettingSection>
    </div>
  );
}
