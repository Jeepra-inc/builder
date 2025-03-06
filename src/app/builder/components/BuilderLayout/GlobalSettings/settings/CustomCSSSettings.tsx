import React, { useEffect, useState } from "react";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "./SettingSection";
import Editor from "@monaco-editor/react";
import { CodeiumEditor } from "@codeium/react-code-editor";

interface CustomCSS {
  mobile: string;
  tablet: string;
  desktop: string;
}

export function CustomCSSSettings() {
  const { customCSS, setCustomCSS } = useBuilder();

  const initialCSS: CustomCSS =
    typeof customCSS === "object" && customCSS !== null
      ? customCSS
      : { mobile: "", tablet: "", desktop: "" };
  const [activeBreakpoint, setActiveBreakpoint] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");

  // Initialize breakpoint CSS states
  const [breakpointCSS, setBreakpointCSS] = useState<CustomCSS>({
    mobile: initialCSS.mobile || "",
    tablet: initialCSS.tablet || "",
    desktop: initialCSS.desktop || "",
  });

  // Update parent CSS state when breakpoints change
  useEffect(() => {
    setCustomCSS(breakpointCSS[activeBreakpoint]);
  }, [breakpointCSS, setCustomCSS, activeBreakpoint]);

  // Update iframe whenever custom CSS changes
  useEffect(() => {
    const iframe = document.querySelector("iframe");
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "UPDATE_CUSTOM_CSS",
          settings: breakpointCSS,
        },
        "*"
      );
    }
  }, [breakpointCSS]);

  const handleEditorChange = (value: string | undefined) => {
    setBreakpointCSS((prev) => ({
      ...prev,
      [activeBreakpoint]: value || "",
    }));
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Responsive CSS"
        description="Add custom CSS for different breakpoints"
      >
        <div className="space-y-4">
          {/* Breakpoint Selector */}
          <div className="flex gap-2 border-b border-gray-200">
            {(["mobile", "tablet", "desktop"] as const).map((breakpoint) => (
              <button
                key={breakpoint}
                onClick={() => setActiveBreakpoint(breakpoint)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeBreakpoint === breakpoint
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
              </button>
            ))}
          </div>

          {/* Breakpoint Labels */}
          <div className="text-sm text-gray-500">
            {activeBreakpoint === "mobile" && "Mobile (≤640px)"}
            {activeBreakpoint === "tablet" && "Tablet (641px - 1024px)"}
            {activeBreakpoint === "desktop" && "Desktop (>1024px)"}
          </div>

          {/* CSS Editor */}
          <div className="h-[200px] border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="css"
              value={breakpointCSS[activeBreakpoint]}
              onChange={handleEditorChange}
              theme="Dawn"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineHeight: 18,
                padding: { top: 8, bottom: 8 },
                scrollBeyondLastLine: false,
                folding: false,
                lineNumbers: "on",
                glyphMargin: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
