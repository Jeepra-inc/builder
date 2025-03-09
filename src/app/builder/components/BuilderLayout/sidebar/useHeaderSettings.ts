import { useEffect } from "react";
import { PresetLayouts } from "./types";

export const useHeaderSettings = (
  contentRef: React.RefObject<HTMLIFrameElement>,
  setCurrentPreset: (preset: string) => void
) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;

      switch (event.data.type) {
        case "GET_PRESET_DATA":
          import("../data/headerPresets")
            .then(({ presetLayouts }: { presetLayouts: PresetLayouts }) => {
              const { presetId } = event.data;
              if (
                presetId &&
                presetLayouts[presetId as keyof typeof presetLayouts]
              ) {
                setCurrentPreset(presetId);
                contentRef.current?.contentWindow?.postMessage(
                  {
                    type: "UPDATE_HEADER_LAYOUT",
                    presetId,
                    ...presetLayouts[presetId as keyof typeof presetLayouts],
                  },
                  "*"
                );
              }
            })
            .catch((error) => {
              console.error("Error loading header presets:", error);
            });
          break;

        case "HEADER_PRESET_LOADED":
          if (event.data.presetId) setCurrentPreset(event.data.presetId);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [contentRef, setCurrentPreset]);
};
