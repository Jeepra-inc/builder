import React, { useEffect } from 'react';
import { useBuilder } from '../../../contexts/BuilderContext';
import { SettingSection } from '../SettingSection';
import Editor from "@monaco-editor/react";

export function CustomCSSSettings() {
  const { customCSS, setCustomCSS } = useBuilder();

  // Update iframe whenever custom CSS changes
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_CUSTOM_CSS',
        settings: {
          customCSS,
        }
      }, '*');
    }
  }, [customCSS]);

  const handleEditorChange = (value: string | undefined) => {
    setCustomCSS(value || '');
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Custom CSS"
        description="Add your own custom CSS styles"
      >
        <div className="h-[200px] border rounded-md overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="css"
            value={customCSS}
            onChange={handleEditorChange}
            theme="Dawn"
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineHeight: 18,
              padding: { top: 8, bottom: 8 },
              scrollBeyondLastLine: false,
              folding: false,
              lineNumbers: 'on',
              glyphMargin: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>
      </SettingSection>
    </div>
  );
}
