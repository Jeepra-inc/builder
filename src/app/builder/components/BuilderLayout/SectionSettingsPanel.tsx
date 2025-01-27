// -- File: components/SectionSettingsPanel.tsx --

"use client";
import React, { useState, useEffect } from 'react';
import { SectionSettingsRenderer } from '@/app/builder/components/IframeContent/section-settings-renderer';
import { SectionSettingsPanelProps, SectionPadding, SectionUpdate } from '@/app/builder/types';
import 'range-slider-element';

function sendSectionUpdate(contentRef: React.RefObject<HTMLIFrameElement | null>, sectionId: string, updates: SectionUpdate) {
  contentRef.current?.contentWindow?.postMessage(
    {
      type: 'UPDATE_SECTION',
      sectionId,
      updates,
    },
    '*'
  );
}

export function SectionSettingsPanel({
  selectedSectionId,
  sections,
  contentRef,
  onToggleLayers,
}: SectionSettingsPanelProps) {
  const [localPadding, setLocalPadding] = useState<SectionPadding>({
    top: 0,
    bottom: 0,
  });

  useEffect(() => {
    if (selectedSectionId) {
      const section = sections.find((s) => s.id === selectedSectionId);
      if (section?.settings.padding) {
        setLocalPadding({
          top: section.settings.padding.top ?? 0,
          bottom: section.settings.padding.bottom ?? 0,
        });
      }
    }
  }, [selectedSectionId, sections]);

  if (!selectedSectionId) return null;

  const section = sections.find((s) => s.id === selectedSectionId);
  if (!section) return null;

  return (
    <div className="p-4 overflow-y-auto">
      <SectionSettingsRenderer
        section={section}
        onUpdateSection={(updates: SectionUpdate) => 
          sendSectionUpdate(contentRef, selectedSectionId, updates)
        }
      />
    </div>
  );
}
