"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Section, ViewportSize, ActiveSidebar } from "@/app/builder/types";
import { useDndHandlers } from "@/app/builder/hooks/useDndHandlers";
import { useUndoRedo } from "@/app/builder/hooks/useUndoRedo";
import { useIframeMessages } from "@/app/builder/hooks/useIframeMessages";
import { useBuilder } from "./contexts/BuilderContext";
import { FeedbackMessage } from "./components/common/FeedbackMessage";

import {
  PageBuilderLayout,
  SidebarLeft,
  IframeContent,
  TopBar,
  HeaderLayoutBuilder,
} from "./components/BuilderLayout";

import {
  GlobalSettings,
  defaultSettings,
  saveSettings,
  loadSettings,
  loadSettingsSync,
} from "./utils/settingsStorage";

export default function PageBuilder() {
  const contentRef = useRef<HTMLIFrameElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const {
    backgroundColor,
    setBackgroundColor,
    logoUrl,
    setLogoUrl,
    logoWidth,
    setLogoWidth,
    faviconUrl,
    setFaviconUrl,
    headingColor,
    setHeadingColor,
    customCSS,
    setCustomCSS,
    headingFont,
    setHeadingFont,
    bodyFont,
    setBodyFont,
    headingSizeScale,
    setHeadingSizeScale,
    bodySizeScale,
    setBodySizeScale,
  } = useBuilder();

  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [viewportSize, setViewportSize] = useState<ViewportSize>("desktop");
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [activeNarrowSidebar, setActiveNarrowSidebar] =
    useState<ActiveSidebar | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] =
    useState<GlobalSettings>(defaultSettings);
  const [headerSettings, setHeaderSettings] = useState(
    defaultSettings.headerSettings
  );
  const [footerSettings, setFooterSettings] = useState(
    defaultSettings.footerSettings
  );

  const toggleNarrowSidebar = useCallback(
    (newState: React.SetStateAction<ActiveSidebar>) => {
      setActiveNarrowSidebar((prevState) => {
        const nextState =
          typeof newState === "function" ? newState(prevState) : newState;
        if (nextState !== "header-settings") {
          setActiveSubmenu(null);
          setShowLayoutPanel(false);
        }
        return nextState;
      });
    },
    []
  );

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [showHeaderPresets, setShowHeaderPresets] = useState(false);
  const [currentHeaderPreset, setCurrentHeaderPreset] =
    useState<string>("preset1");

  const { handleUndo, handleRedo } = useUndoRedo({ sections, setSections });
  const {
    isDragging,
    restrictAxis,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDndHandlers({ contentRef, setSections });

  // Load settings on initial render
  // Initialize with sync version first for immediate UI rendering
  useEffect(() => {
    const initialSettings = loadSettingsSync();
    setGlobalSettings(initialSettings);

    // Apply loaded settings to state
    if (initialSettings.sections.length > 0) {
      setSections(initialSettings.sections);
    }

    setHeaderSettings(initialSettings.headerSettings);
    // Set the current header preset if available in the settings
    if (initialSettings.headerSettings?.layout?.currentPreset) {
      setCurrentHeaderPreset(
        initialSettings.headerSettings.layout.currentPreset
      );
    }
    setFooterSettings(initialSettings.footerSettings);

    // Apply global styles
    setBackgroundColor(initialSettings.globalStyles.branding.backgroundColor);
    setLogoUrl(initialSettings.globalStyles.branding.logoUrl);
    setLogoWidth(initialSettings.globalStyles.branding.logoWidth);
    setFaviconUrl(initialSettings.globalStyles.branding.faviconUrl);
    setHeadingColor(initialSettings.globalStyles.typography.headingColor);
    setCustomCSS(initialSettings.globalStyles.customCSS);
    setHeadingFont(initialSettings.globalStyles.typography.headingFont);
    setBodyFont(initialSettings.globalStyles.typography.bodyFont);
    setHeadingSizeScale(
      initialSettings.globalStyles.typography.headingSizeScale
    );
    setBodySizeScale(initialSettings.globalStyles.typography.bodySizeScale);

    // Then try to load from file asynchronously
    const loadSettingsFromFile = async () => {
      try {
        const loadedSettings = await loadSettings();
        setGlobalSettings(loadedSettings);

        // Apply loaded settings to state
        if (loadedSettings.sections.length > 0) {
          setSections(loadedSettings.sections);
        }

        setHeaderSettings(loadedSettings.headerSettings);
        // Set the current header preset if available in the settings
        if (loadedSettings.headerSettings?.layout?.currentPreset) {
          setCurrentHeaderPreset(
            loadedSettings.headerSettings.layout.currentPreset
          );
        }
        setFooterSettings(loadedSettings.footerSettings);

        // Apply global styles
        setBackgroundColor(
          loadedSettings.globalStyles.branding.backgroundColor
        );
        setLogoUrl(loadedSettings.globalStyles.branding.logoUrl);
        setLogoWidth(loadedSettings.globalStyles.branding.logoWidth);
        setFaviconUrl(loadedSettings.globalStyles.branding.faviconUrl);
        setHeadingColor(loadedSettings.globalStyles.typography.headingColor);
        setCustomCSS(loadedSettings.globalStyles.customCSS);
        setHeadingFont(loadedSettings.globalStyles.typography.headingFont);
        setBodyFont(loadedSettings.globalStyles.typography.bodyFont);
        setHeadingSizeScale(
          loadedSettings.globalStyles.typography.headingSizeScale
        );
        setBodySizeScale(loadedSettings.globalStyles.typography.bodySizeScale);
      } catch (error) {
        console.error("Failed to load settings from file:", error);
      }
    };

    loadSettingsFromFile();
  }, [
    setBackgroundColor,
    setLogoUrl,
    setLogoWidth,
    setFaviconUrl,
    setHeadingColor,
    setCustomCSS,
    setHeadingFont,
    setBodyFont,
    setHeadingSizeScale,
    setBodySizeScale,
  ]);

  useEffect(() => {
    contentRef.current?.contentWindow?.postMessage(
      { type: "UPDATE_BACKGROUND_COLOR", backgroundColor },
      "*"
    );
  }, [backgroundColor]);

  // Send the settings to the iframe when the page loads
  useEffect(() => {
    const sendSettingsToIframe = () => {
      if (contentRef.current?.contentWindow) {
        console.log("Sending settings to iframe:", {
          sections,
          headerSettings,
          footerSettings,
          globalStyles: globalSettings.globalStyles,
        });

        contentRef.current.contentWindow.postMessage(
          {
            type: "LOAD_SETTINGS",
            settings: {
              sections,
              headerSettings,
              footerSettings,
              globalStyles: globalSettings.globalStyles,
              version: globalSettings.version,
            },
          },
          "*"
        );
      }
    };

    // Wait for iframe to load
    const handleIframeLoad = () => {
      sendSettingsToIframe();
    };

    if (contentRef.current) {
      contentRef.current.addEventListener("load", handleIframeLoad);

      // Also try to send immediately in case iframe is already loaded
      sendSettingsToIframe();
    }

    return () => {
      contentRef.current?.removeEventListener("load", handleIframeLoad);
    };
  }, [sections, headerSettings, footerSettings, globalSettings]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "HEADER_SETTING_SELECTED") {
        setActiveNarrowSidebar("header-settings");
        setActiveSubmenu("HTML");
      } else if (event.data.type === "SECTIONS_UPDATED") {
        // Update the sections state when receiving updates from the iframe
        if (Array.isArray(event.data.sections)) {
          setSections(event.data.sections);
        }
      } else if (event.data.type === "SECTION_SELECTED") {
        // Update the selected section ID and open the settings panel
        setSelectedSectionId(event.data.sectionId);
        setActiveNarrowSidebar("settings");
      } else if (event.data.type === "HEADER_SETTINGS_UPDATED") {
        // Update header settings
        setHeaderSettings(event.data.settings);
      } else if (event.data.type === "FOOTER_SETTINGS_UPDATED") {
        // Update footer settings
        setFooterSettings(event.data.settings);
      } else if (event.data.type === "SELECT_SECTION") {
        // This is the key handler for section selection from the iframe
        setSelectedSectionId(event.data.sectionId);
        setActiveNarrowSidebar("settings");

        // Dispatch event to switch to section settings tab
        window.dispatchEvent(
          new CustomEvent("switchTab", {
            detail: { targetTab: "Section Settings" },
          })
        );
      }
    };

    const handleSwitchTab = (event: CustomEvent) => {
      const { targetTab, targetSubmenu } = event.detail;
      console.log("Switch tab event received:", { targetTab, targetSubmenu });

      if (targetTab === "Header") {
        setActiveNarrowSidebar("header-settings");
        setActiveSubmenu(targetSubmenu);
      } else if (targetTab === "Section Settings") {
        setActiveNarrowSidebar("settings");
      }
    };

    // Handle header layout updates from the HeaderLayoutBuilder
    const handleHeaderLayoutUpdate = (event: CustomEvent) => {
      console.log("Header layout update event received:", event.detail);
      const { layout, presetId } = event.detail;
      if (layout) {
        // Create the updated settings object
        const updatedHeaderSettings = {
          ...headerSettings,
          layout: {
            ...headerSettings?.layout,
            currentPreset: presetId,
            containers: layout,
          },
        };

        // Update the header settings state
        setHeaderSettings(updatedHeaderSettings);

        // Update the current header preset state if provided
        if (presetId) {
          setCurrentHeaderPreset(presetId);
        }

        // Send the updated settings to the iframe
        contentRef.current?.contentWindow?.postMessage(
          {
            type: "LOAD_SETTINGS",
            settings: {
              sections,
              headerSettings: updatedHeaderSettings,
              footerSettings,
              globalStyles: globalSettings.globalStyles,
              version: globalSettings.version,
            },
          },
          "*"
        );

        // Save the updated settings to ensure they persist on reload
        const updatedSettings = {
          ...globalSettings,
          sections,
          headerSettings: updatedHeaderSettings,
          footerSettings,
          globalStyles: globalSettings.globalStyles,
        };

        // Save settings asynchronously without waiting
        saveSettings(updatedSettings).catch((err) => {
          console.error("Failed to auto-save header layout changes:", err);
        });

        console.log(
          "Sent updated header settings to iframe and saved:",
          updatedHeaderSettings
        );
      }
    };

    // Handler for requestHeaderSettings event from HeaderLayoutBuilder
    const handleRequestHeaderSettings = () => {
      console.log("Received request for current header settings:", {
        currentHeaderPreset,
        hasHeaderSettings: !!headerSettings,
        hasLayoutInSettings: !!headerSettings?.layout,
        containersList: headerSettings?.layout?.containers
          ? Object.keys(headerSettings.layout.containers)
          : "none",
      });

      // Send current header settings back to the requester
      window.dispatchEvent(
        new CustomEvent("provideHeaderSettings", {
          detail: {
            headerSettings: headerSettings,
            currentPreset: currentHeaderPreset,
          },
        })
      );
    };

    // Handler for saving preset changes from the HeaderLayoutsPanel
    // Handler for saving color scheme changes
    const handleColorSchemeUpdated = (event: CustomEvent) => {
      console.log("🎨 [PAGE] Received colorSchemeUpdated event:", event);
      const { schemes } = event.detail;
      console.log("🎨 [PAGE] Schemes from event:", {
        schemeCount: schemes?.length,
        isArray: Array.isArray(schemes),
        firstScheme: schemes?.[0],
      });

      if (schemes && Array.isArray(schemes)) {
        // First, create a complete copy of the current globalSettings
        const updatedSettings = JSON.parse(
          JSON.stringify({
            sections,
            headerSettings,
            footerSettings,
            globalStyles: globalSettings.globalStyles,
            version: globalSettings.version || "1.0.0",
          })
        );

        // Make sure the colors object exists and has a schemes array
        if (!updatedSettings.globalStyles.colors) {
          updatedSettings.globalStyles.colors = {};
        }

        // Update the schemes array
        updatedSettings.globalStyles.colors.schemes = schemes;

        // Log the current state of the settings
        console.log("🎨 [PAGE] Current globalSettings.globalStyles:", {
          before: {
            hasColors: !!globalSettings.globalStyles?.colors,
            hasSchemes: !!globalSettings.globalStyles?.colors?.schemes,
            schemesType: typeof globalSettings.globalStyles?.colors?.schemes,
            schemeCount: Array.isArray(
              globalSettings.globalStyles?.colors?.schemes
            )
              ? globalSettings.globalStyles.colors.schemes.length
              : 0,
          },
        });

        console.log("🎨 [PAGE] Updated settings object:", {
          hasGlobalStyles: !!updatedSettings.globalStyles,
          hasColors: !!updatedSettings.globalStyles?.colors,
          schemesType: typeof updatedSettings.globalStyles?.colors?.schemes,
          hasSchemes: !!updatedSettings.globalStyles?.colors?.schemes,
          schemeCount: updatedSettings.globalStyles?.colors?.schemes?.length,
          schemes: updatedSettings.globalStyles?.colors?.schemes,
        });

        // Update the global settings state
        setGlobalSettings(updatedSettings);

        // Save settings to file
        console.log("🎨 [PAGE] Calling saveSettings with updated settings...");
        saveSettings(updatedSettings)
          .then(() => {
            console.log(
              "🎨 [PAGE] Color schemes saved to settings file successfully"
            );
          })
          .catch((err) => {
            console.error(
              "🚨 [PAGE] Failed to save updated color schemes:",
              err
            );
          });
      } else {
        console.warn("🚨 [PAGE] Invalid schemes data received:", schemes);
      }
    };

    const handleSaveHeaderPresetChange = (event: CustomEvent) => {
      const { presetId, layout } = event.detail;
      console.log("🔄 Received saveHeaderPresetChange event:", {
        presetId,
        hasLayout: !!layout,
      });

      if (presetId && layout) {
        // Create the updated settings object
        const updatedHeaderSettings = {
          ...headerSettings,
          layout: {
            ...headerSettings?.layout,
            currentPreset: presetId,
            containers: layout,
          },
        };

        // Update the header settings state
        setHeaderSettings(updatedHeaderSettings);
        setCurrentHeaderPreset(presetId);

        // Save the updated settings to ensure they persist on reload
        const updatedSettings = {
          ...globalSettings,
          sections,
          headerSettings: updatedHeaderSettings,
          footerSettings,
          globalStyles: globalSettings.globalStyles,
        };

        // Save settings asynchronously without waiting
        saveSettings(updatedSettings).catch((err) => {
          console.error("Failed to auto-save header preset change:", err);
        });

        console.log("💾 Auto-saved header preset change:", presetId);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener(
      "updateHeaderLayout",
      handleHeaderLayoutUpdate as EventListener
    );
    window.addEventListener(
      "requestHeaderSettings",
      handleRequestHeaderSettings as EventListener
    );
    window.addEventListener(
      "saveHeaderPresetChange",
      handleSaveHeaderPresetChange as EventListener
    );
    window.addEventListener(
      "colorSchemeUpdated",
      handleColorSchemeUpdated as EventListener
    );

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener(
        "updateHeaderLayout",
        handleHeaderLayoutUpdate as EventListener
      );
      window.removeEventListener(
        "requestHeaderSettings",
        handleRequestHeaderSettings as EventListener
      );
      window.removeEventListener(
        "saveHeaderPresetChange",
        handleSaveHeaderPresetChange as EventListener
      );
      window.removeEventListener(
        "colorSchemeUpdated",
        handleColorSchemeUpdated as EventListener
      );
    };
  }, [headerSettings]);

  const handleUpdateSection = useCallback(
    (sectionId: string, updates: Partial<Section>) => {
      setSections((prevSections) => {
        const updatedSections = prevSections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        );

        contentRef.current?.contentWindow?.postMessage(
          { type: "UPDATE_SECTION", sectionId, updates },
          "*"
        );

        return updatedSections;
      });
    },
    []
  );

  useIframeMessages({
    contentRef,
    sections,
    setSections,
    handleUpdateSection,
    setSelectedSectionId,
    toggleNarrowSidebar,
  });

  const handleSelectSection = useCallback((id: string | null) => {
    setSelectedSectionId(id);
    setActiveNarrowSidebar("settings");

    // Notify iframe about the selected section
    contentRef.current?.contentWindow?.postMessage(
      {
        type: "SECTION_SELECTED",
        sectionId: id,
        action: "OPEN_SETTINGS",
      },
      "*"
    );

    // Scroll to the section in the iframe
    if (id) {
      contentRef.current?.contentWindow?.postMessage(
        { type: "SCROLL_TO_SECTION", sectionId: id },
        "*"
      );
    }

    // Dispatch event to switch to section settings tab
    window.dispatchEvent(
      new CustomEvent("switchTab", {
        detail: { targetTab: "Section Settings" },
      })
    );
  }, []);

  const handleHoverSection = useCallback((id: string | null) => {
    if (id) {
      contentRef.current?.contentWindow?.postMessage(
        { type: "HOVER_SECTION", sectionId: id },
        "*"
      );
    }
  }, []);

  const handleViewportChange = useCallback((size: ViewportSize) => {
    setViewportSize(size);
    setIsLeftSidebarOpen(size !== "fullscreen");
    setActiveNarrowSidebar(size === "fullscreen" ? null : "layers");
    contentRef.current?.contentWindow?.postMessage(
      { type: "VIEWPORT_CHANGE", viewport: size },
      "*"
    );
  }, []);

  const handleHeaderSettingSelect = useCallback((settingId: string | null) => {
    setActiveNarrowSidebar("header-settings");
    window.postMessage({ type: "HEADER_SETTING_SELECTED", settingId }, "*");
  }, []);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      console.log("Selecting preset:", presetId);
      setCurrentHeaderPreset(presetId);
      setShowLayoutPanel(false);
      setActiveSubmenu(null);

      // Import the preset layouts to update the headerSettings
      import("./components/BuilderLayout/data/headerPresets")
        .then(({ presetLayouts }) => {
          if (presetLayouts[presetId]) {
            // Create updated header settings
            const updatedHeaderSettings = {
              ...headerSettings,
              layout: {
                ...headerSettings?.layout,
                currentPreset: presetId,
                containers: presetLayouts[presetId],
              },
            };

            // Update the headerSettings state
            setHeaderSettings(updatedHeaderSettings);

            // Send the updated settings to the iframe
            contentRef.current?.contentWindow?.postMessage(
              {
                type: "LOAD_SETTINGS",
                settings: {
                  sections,
                  headerSettings: updatedHeaderSettings,
                  footerSettings,
                  globalStyles: globalSettings.globalStyles,
                  version: globalSettings.version,
                },
              },
              "*"
            );

            console.log(
              "Sent updated header settings to iframe after preset selection:",
              updatedHeaderSettings
            );
          }
        })
        .catch((error) => {
          console.error("Error loading preset layouts:", error);
        });
    },
    [headerSettings, sections, footerSettings, globalSettings, contentRef]
  );

  const handleHeaderClose = useCallback(() => {
    setActiveNarrowSidebar("layers");
    setShowLayoutPanel(false);
    setActiveSubmenu(null);

    window.dispatchEvent(
      new CustomEvent("switchTab", {
        detail: { targetTab: "Design" },
      })
    );
  }, []);

  const handleOpenLayoutPanel = useCallback(() => {
    setActiveNarrowSidebar("header-settings");
    setActiveSubmenu("Layout");
    setShowLayoutPanel(false);
  }, []);

  // Feedback message state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "success" | "error" | "info"
  >("success");

  const handleSave = useCallback((): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Update global settings with current state
        const updatedSettings: GlobalSettings = {
          ...globalSettings,
          sections,
          headerSettings,
          footerSettings,
          globalStyles: {
            ...globalSettings.globalStyles,
            branding: {
              logoUrl,
              logoWidth,
              faviconUrl,
              backgroundColor,
            },
            typography: {
              headingFont,
              bodyFont,
              headingSizeScale,
              bodySizeScale,
              headingColor,
            },
            customCSS,
            // Make sure we preserve any color schemes from globalSettings
            colors: globalSettings.globalStyles?.colors || { schemes: [] },
          },
        };

        // Save to localStorage and file
        await saveSettings(updatedSettings);
        setGlobalSettings(updatedSettings);

        // Show success feedback
        setFeedbackMessage("Settings saved successfully");
        setFeedbackType("success");
        setShowFeedback(true);

        console.log("Settings saved successfully", {
          hasColors: !!updatedSettings.globalStyles?.colors,
          hasSchemes: !!updatedSettings.globalStyles?.colors?.schemes,
          schemeCount: updatedSettings.globalStyles?.colors?.schemes?.length,
          schemes: updatedSettings.globalStyles?.colors?.schemes,
        });
        resolve();
      } catch (error) {
        console.error("Error saving settings:", error);

        // Show error feedback
        setFeedbackMessage("Failed to save settings");
        setFeedbackType("error");
        setShowFeedback(true);

        reject(error);
      }
    });
  }, [
    sections,
    headerSettings,
    footerSettings,
    logoUrl,
    logoWidth,
    faviconUrl,
    backgroundColor,
    headingFont,
    bodyFont,
    headingSizeScale,
    bodySizeScale,
    headingColor,
    customCSS,
    globalSettings,
  ]);

  const handleImportSettings = useCallback(
    (importedSettings: GlobalSettings) => {
      // Apply imported settings
      setGlobalSettings(importedSettings);
      setSections(importedSettings.sections);
      setHeaderSettings(importedSettings.headerSettings);
      setFooterSettings(importedSettings.footerSettings);

      // Apply global styles
      setBackgroundColor(
        importedSettings.globalStyles.branding.backgroundColor
      );
      setLogoUrl(importedSettings.globalStyles.branding.logoUrl);
      setLogoWidth(importedSettings.globalStyles.branding.logoWidth);
      setFaviconUrl(importedSettings.globalStyles.branding.faviconUrl);
      setHeadingColor(importedSettings.globalStyles.typography.headingColor);
      setCustomCSS(importedSettings.globalStyles.customCSS);
      setHeadingFont(importedSettings.globalStyles.typography.headingFont);
      setBodyFont(importedSettings.globalStyles.typography.bodyFont);
      setHeadingSizeScale(
        importedSettings.globalStyles.typography.headingSizeScale
      );
      setBodySizeScale(importedSettings.globalStyles.typography.bodySizeScale);

      // Update iframe with new settings
      contentRef.current?.contentWindow?.postMessage(
        { type: "LOAD_SETTINGS", settings: importedSettings },
        "*"
      );

      console.log("Settings imported successfully", importedSettings);
    },
    [
      setBackgroundColor,
      setLogoUrl,
      setLogoWidth,
      setFaviconUrl,
      setHeadingColor,
      setCustomCSS,
      setHeadingFont,
      setBodyFont,
      setHeadingSizeScale,
      setBodySizeScale,
    ]
  );

  // Handle importing just sections
  const handleImportSections = useCallback((importedSections: Section[]) => {
    // Update sections
    setSections(importedSections);

    // Update iframe with new sections
    contentRef.current?.contentWindow?.postMessage(
      { type: "SECTIONS_UPDATED", sections: importedSections },
      "*"
    );

    console.log("Sections imported successfully", importedSections);
  }, []);

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col">
        <FeedbackMessage
          message={feedbackMessage}
          type={feedbackType}
          show={showFeedback}
          onClose={() => setShowFeedback(false)}
        />
        <TopBar
          viewportSize={viewportSize}
          onViewportChange={handleViewportChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          handleSave={handleSave}
          sections={sections}
          onImportSections={handleImportSections}
        />
        <div className="flex flex-grow overflow-hidden">
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[restrictAxis]}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <PageBuilderLayout
                leftSidebar={
                  <SidebarLeft
                    sections={sections}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={handleSelectSection}
                    contentRef={contentRef}
                    toggleNarrowSidebar={toggleNarrowSidebar}
                    settingsPanelRef={settingsPanelRef}
                    onHoverSection={handleHoverSection}
                    activeSubmenu={activeSubmenu}
                    headerSettings={headerSettings}
                  />
                }
                content={
                  <>
                    <IframeContent
                      isDragging={isDragging}
                      viewportSize={viewportSize}
                      iframeRef={contentRef}
                    />
                    {activeNarrowSidebar === "header-settings" && (
                      <HeaderLayoutBuilder
                        contentRef={contentRef}
                        isOpen={!showLayoutPanel}
                        onClose={handleHeaderClose}
                        onShowPresets={() => setShowLayoutPanel(true)}
                        currentPreset={currentHeaderPreset}
                        onSettingSelect={handleHeaderSettingSelect}
                        onOpenLayoutPanel={handleOpenLayoutPanel}
                        onSelectPreset={handleSelectPreset}
                      />
                    )}
                  </>
                }
                isLeftSidebarOpen={isLeftSidebarOpen}
              />
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </TooltipProvider>
  );
}
