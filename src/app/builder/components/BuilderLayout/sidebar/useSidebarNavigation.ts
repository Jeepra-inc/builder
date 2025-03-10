import { useEffect } from "react";

export const useSidebarNavigation = (
  toggleNarrowSidebar: (panel: string) => void,
  setCurrentSubmenu: (submenu: string | null) => void,
  setSelectedHeaderSetting: (setting: string | null) => void
) => {
  useEffect(() => {
    const handleSwitchTab = (event: CustomEvent) => {
      const { targetTab, targetSubmenu, settingId, directNav, showTitle } =
        event.detail;

      if (targetTab === "Header") {
        if (directNav) {
          if (targetSubmenu) setCurrentSubmenu(targetSubmenu);
          if (settingId) setSelectedHeaderSetting(settingId);
        }
        toggleNarrowSidebar("header-settings");
        setCurrentSubmenu(
          targetSubmenu || (showTitle ? "Header Settings" : null)
        );
      } else if (targetTab === "Footer") {
        // Handle Footer tab clicks
        toggleNarrowSidebar("layers");
        setCurrentSubmenu(
          targetSubmenu || (showTitle ? "Footer Settings" : null)
        );
      } else if (targetTab === "Design") {
        setCurrentSubmenu(null);
        toggleNarrowSidebar("layers");
      } else if (targetTab === "Section Settings") {
        toggleNarrowSidebar("settings");
      }
    };

    const handleHeaderSettingsRequested = (event: CustomEvent) => {
      const { settingId, submenu } = event.detail;
      setSelectedHeaderSetting(settingId);
      toggleNarrowSidebar("header-settings");
      if (submenu) setCurrentSubmenu(submenu);
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    window.addEventListener(
      "headerSettingsRequested",
      handleHeaderSettingsRequested as EventListener
    );

    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
      window.removeEventListener(
        "headerSettingsRequested",
        handleHeaderSettingsRequested as EventListener
      );
    };
  }, [toggleNarrowSidebar, setCurrentSubmenu, setSelectedHeaderSetting]);
};
