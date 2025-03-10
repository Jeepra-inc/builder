import React, { useEffect } from "react";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { ColSection } from "./colSection";
import { MediaPreviewSelector } from "@/app/builder/components/common/MediaPreviewSelector";
import RangeSlider from "./RangeSlider";

export function BrandingSettings() {
  const {
    logoUrl,
    setLogoUrl,
    logoWidth,
    setLogoWidth,
    faviconUrl,
    setFaviconUrl,
  } = useBuilder();

  // Update iframe whenever logo settings change
  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_LOGO",
          logoUrl,
          logoWidth,
        },
        "*"
      );
    }
  }, [logoUrl, logoWidth]);

  return (
    <>
      {/* Logo Section */}
      <ColSection title="Logo">
        <MediaPreviewSelector
          imageUrl={logoUrl}
          onImageSelect={setLogoUrl}
          onImageRemove={() => setLogoUrl("")}
          height="h-[80px]"
          mediaLibraryLabel="Select"
        />
      </ColSection>

      {/* Logo Dark Mode Section */}
      <ColSection title="Light Logo">
        <MediaPreviewSelector
          imageUrl={logoUrl}
          onImageSelect={setLogoUrl}
          onImageRemove={() => setLogoUrl("")}
          height="h-[80px]"
          mediaLibraryLabel="Select"
        />
      </ColSection>

      {/* Logo Width Setting */}
      <ColSection title="Height">
        <RangeSlider
          min={50}
          max={250}
          value={logoWidth}
          onValueChange={(value) => setLogoWidth(value)}
        />
      </ColSection>

      {/* Favicon Section */}
      <ColSection title="Favicon" divider={false}>
        <MediaPreviewSelector
          imageUrl={faviconUrl}
          onImageSelect={setFaviconUrl}
          onImageRemove={() => setFaviconUrl("")}
          height="h-[80px]"
          mediaLibraryLabel="Select"
        />
        <p className="text-xs text-gray-500">
          For best results, use a square image at least 32x32 pixels
        </p>
      </ColSection>
    </>
  );
}
