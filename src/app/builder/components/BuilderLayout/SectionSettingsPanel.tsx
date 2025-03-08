"use client";
import React, { useEffect } from "react";
import { SectionSettingsRenderer } from "@/app/builder/components/IframeContent/section-settings-renderer";
import { SectionSettingsPanelProps, SectionUpdate } from "@/app/builder/types";

function sendSectionUpdate(
  contentRef: React.RefObject<HTMLIFrameElement | null>,
  sectionId: string,
  updates: SectionUpdate
) {
  contentRef.current?.contentWindow?.postMessage(
    {
      type: "UPDATE_SECTION",
      sectionId,
      updates,
    },
    "*"
  );
}

export function SectionSettingsPanel({
  selectedSectionId,
  sections,
  contentRef,
}: SectionSettingsPanelProps) {
  useEffect(() => {
    // When the section settings panel is mounted or updated with a new selectedSectionId,
    // notify the iframe to highlight the selected section
    if (selectedSectionId) {
      contentRef.current?.contentWindow?.postMessage(
        {
          type: "SECTION_SELECTED",
          sectionId: selectedSectionId,
        },
        "*"
      );
    }
  }, [selectedSectionId, contentRef]);

  if (!selectedSectionId) return null;

  const section = sections.find((s) => s.id === selectedSectionId);
  if (!section) return null;

  return (
    <div className="h-full w-full overflow-y-auto">
      {/* Main Panel Heading - Always visible */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-lg font-semibold text-gray-800">
          Section Settings
        </h2>
      </div>

      <div className="p-4">
        <SectionSettingsRenderer
          section={section}
          onUpdateSection={(updates: SectionUpdate) =>
            sendSectionUpdate(contentRef, selectedSectionId, updates)
          }
        />
      </div>
    </div>
  );
}
