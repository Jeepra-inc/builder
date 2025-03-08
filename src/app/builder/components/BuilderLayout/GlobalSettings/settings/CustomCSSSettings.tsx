import React, { useEffect, useState, useCallback } from "react";
import { useBuilder } from "@/app/builder/contexts/BuilderContext";
import { SettingSection } from "./SettingSection";
import Editor from "@monaco-editor/react";
import { CodeiumEditor } from "@codeium/react-code-editor";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, X } from "lucide-react";
import { useDrawerEscapeOutsideClick } from "@/app/builder/hooks/useDrawerEscapeOutsideClick";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomCSS {
  mobile: string;
  tablet: string;
  desktop: string;
}

export function CustomCSSSettings() {
  const { customCSS, setCustomCSS } = useBuilder();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  // Use our custom hook for Escape key and outside click
  useDrawerEscapeOutsideClick(
    isDrawerOpen,
    toggleDrawer,
    ".css-drawer-container"
  );

  // CSS Editor component that's used in both small and large views
  const cssEditor = (
    <>
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
      <div
        className={`border rounded-md overflow-hidden ${
          isDrawerOpen ? "h-[calc(100%-80px)]" : "h-[200px]"
        }`}
      >
        <Editor
          height="100%"
          defaultLanguage="css"
          value={breakpointCSS[activeBreakpoint]}
          onChange={handleEditorChange}
          theme="Dawn"
          options={{
            minimap: { enabled: isDrawerOpen },
            fontSize: 14,
            lineHeight: 20,
            padding: { top: 8, bottom: 8 },
            scrollBeyondLastLine: false,
            folding: true,
            lineNumbers: "on",
            glyphMargin: false,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </>
  );

  // Expanded drawer for CSS editing
  if (isDrawerOpen) {
    return (
      <div className="fixed top-0 left-0 h-full w-1/2 bg-white z-50 shadow-2xl border-r border-gray-200 overflow-hidden flex flex-col css-drawer-container">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-800">
            Custom CSS Editor
          </h3>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleDrawer}>
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Minimize Editor</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleDrawer}>
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Close Editor</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-hidden flex flex-col space-y-4">
          {cssEditor}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingSection
        title="Responsive CSS"
        description="Add custom CSS for different breakpoints"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDrawer}
                    className="flex items-center gap-1 text-xs mb-2"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Expand Editor
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expand Editor to Full Screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {cssEditor}
        </div>
      </SettingSection>
    </div>
  );
}
