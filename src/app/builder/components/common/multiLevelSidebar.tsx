// MultiLevelSidebar.tsx
"use client";
import React, { useState, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

type MenuItem = {
  title: string;
  subMenu?: MenuItem[];
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  hidden?: boolean;
  parent?: string;
};

type MenuStackItem = {
  title: string;
  items?: MenuItem[];
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
};

interface MultiLevelSidebarProps {
  initialMenu: MenuStackItem;
  onNavigate?: (item: MenuItem) => void;
  onBack?: () => void;
  direction?: "forward" | "backward";
  animationConfig?: {
    type: string;
    bounce: number;
    duration: number;
  };
  onMenuItemClick?: (item: MenuItem) => void;
  defaultSubmenu?: string | null;
  // Add any other props needed
}

const MenuItemList = ({
  items,
  onItemClick,
}: {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}) => (
  <div>
    <ul>
      {items.map((item, index) => (
        <li key={index} className="border-b">
          {item.subMenu || item.component ? (
            <Button
              className="w-full rounded-none justify-between text-sm font-semibold px-4 py-3 h-auto hover:bg-gray-50 text-gray-700 text-left"
              variant="ghost"
              onClick={() => onItemClick(item)}
            >
              <span className="flex items-center">
                <span>{item.title}</span>
              </span>
              <ChevronRight
                size={16}
                className="text-gray-400 ml-2 flex-shrink-0"
              />
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  </div>
);

const BackButtonOnly = ({ onBack }: { onBack: () => void }) => (
  <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
    <div className="flex h-11 items-center px-3">
      <Button
        onClick={onBack}
        variant="ghost"
        size="icon"
        className="rounded-md mr-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
      >
        <ChevronLeft size={18} />
      </Button>
    </div>
  </div>
);

const BackButtonWithTitle = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => (
  <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
    <div className="px-2 py-2 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-md h-7 w-7 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
        onClick={onBack}
      >
        <ChevronLeft size={18} />
      </Button>
      <h2 className="text-sm font-semibold text-gray-800 truncate">{title}</h2>
    </div>
  </div>
);

export default function MultiLevelSidebar({
  initialMenu,
  onNavigate,
  onBack,
  direction = "forward",
  animationConfig = { type: "spring", bounce: 0.2, duration: 0.6 },
  onMenuItemClick,
  defaultSubmenu,
}: MultiLevelSidebarProps) {
  const [menuStack, setMenuStack] = useState<MenuStackItem[]>([initialMenu]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(
    initialMenu.items?.[0]?.title || ""
  );

  // Add a state to track whether we should skip animations during direct navigation
  const [skipTransition, setSkipTransition] = useState(false);

  // Function to get the title based on active tab
  const getActiveTabTitle = () => {
    if (activeTab === "Header") return "Header Settings";
    if (activeTab === "Footer") return "Footer Settings";
    if (activeTab === "Global Settings") return "Global Settings";
    if (activeTab === "Section Settings") return "Section Settings";
    if (activeTab === "Design") return "Design";
    if (activeTab === "SEO") return "SEO Settings";
    if (activeTab === "Page Settings") return "Page Settings";
    return "";
  };

  // Add this function near the top of the component
  const getTitleForMenu = (
    menuTitle: string,
    submenu: string | null | undefined
  ) => {
    if (menuTitle === "Header" && submenu) {
      return submenu;
    }
    if (menuTitle === "Footer" && submenu) {
      return submenu;
    }
    return menuTitle;
  };

  // This effect runs only once on initial load to set up default submenu if provided
  useEffect(() => {
    if (defaultSubmenu && initialMenu.items) {
      const headerItem = initialMenu.items.find(
        (item) => item.title === "Header"
      );
      if (headerItem?.subMenu) {
        const submenuItem = headerItem.subMenu.find(
          (item) => item.title === defaultSubmenu
        );
        if (submenuItem) {
          // Directly set the menu stack to skip any visual transitions
          setSkipTransition(true);
          setMenuStack([
            initialMenu,
            {
              title: "Header",
              items: headerItem.subMenu,
            },
            {
              title: submenuItem.title,
              component: submenuItem.component,
              componentProps: submenuItem.componentProps,
            },
          ]);

          // Set the active tab to Header to ensure proper panel visibility
          setActiveTab("Header");

          // Reset the skip transition flag after rendering
          setTimeout(() => setSkipTransition(false), 50);
        }
      }
    }
  }, []);

  // This effect handles the switchTab event
  useEffect(() => {
    const handleSwitchTab = (
      e: CustomEvent<{
        targetTab: string;
        targetSubmenu?: string;
        settingId?: string;
      }>
    ) => {
      const targetTab = e.detail.targetTab;
      const targetSubmenu = e.detail.targetSubmenu;
      const settingId = e.detail.settingId;

      const menuItem = initialMenu.items?.find(
        (item) => item.title.toLowerCase() === targetTab.toLowerCase()
      );

      if (menuItem) {
        // If we have both a tab and submenu, directly navigate to the target
        // without intermediate steps to prevent flickering
        if (targetTab === "Header" && targetSubmenu) {
          setActiveTab(menuItem.title);

          if (menuItem.subMenu) {
            const submenuItem = menuItem.subMenu.find(
              (item) => item.title === targetSubmenu
            );

            if (submenuItem) {
              // Directly set the menu stack to the target state
              setSkipTransition(true);
              setMenuStack([
                initialMenu,
                {
                  title: "Header",
                  items: menuItem.subMenu,
                },
                {
                  title: submenuItem.title,
                  component: submenuItem.component,
                  componentProps: {
                    ...submenuItem.componentProps,
                    selectedSetting: settingId, // Pass the selected setting ID
                  },
                },
              ]);

              // Reset the skip transition flag after rendering
              setTimeout(() => setSkipTransition(false), 50);

              // Notify about the navigation
              if (submenuItem.onClick) {
                submenuItem.onClick();
              }
              onMenuItemClick?.(submenuItem);
              onNavigate?.(submenuItem);
              return; // Skip the normal navigation flow
            }
          }
        }

        // Default behavior for other cases
        handleTabChange(menuItem.title);

        // If there's a target submenu, navigate to it
        if (targetSubmenu && menuItem.subMenu) {
          const submenuItem = menuItem.subMenu.find(
            (item) => item.title === targetSubmenu
          );
          if (submenuItem) {
            setTimeout(() => {
              navigateTo(submenuItem);
            }, 100);
          }
        }
      }
    };

    window.addEventListener("switchTab", handleSwitchTab as EventListener);
    return () => {
      window.removeEventListener("switchTab", handleSwitchTab as EventListener);
    };
  }, [initialMenu.items]);

  // This effect updates the menu stack when defaultSubmenu changes
  useEffect(() => {
    if (defaultSubmenu && initialMenu.items) {
      const headerItem = initialMenu.items.find(
        (item) => item.title === "Header"
      );
      if (headerItem?.subMenu) {
        const submenuItem = headerItem.subMenu.find(
          (item) => item.title === defaultSubmenu
        );
        if (submenuItem) {
          // Directly set the full menu stack in one operation
          setSkipTransition(true);
          setMenuStack([
            initialMenu,
            {
              title: "Header",
              items: headerItem.subMenu,
            },
            {
              title: submenuItem.title,
              component: submenuItem.component,
              componentProps: submenuItem.componentProps,
            },
          ]);

          // Set the active tab correctly
          setActiveTab("Header");

          // Reset the skip transition flag after rendering
          setTimeout(() => setSkipTransition(false), 50);
        }
      }
    }
  }, [defaultSubmenu, initialMenu.items]);

  const navigateTo = (item: MenuItem) => {
    if (isInitialLoad) setIsInitialLoad(false);

    if (item.onClick) {
      item.onClick();
    }

    onMenuItemClick?.(item);

    if (item.subMenu) {
      setMenuStack((prev) => [
        ...prev,
        {
          title: item.title,
          items: item.subMenu,
          componentProps: item.componentProps,
        },
      ]);
    } else if (item.component) {
      setMenuStack((prev) => [
        ...prev,
        {
          title: item.title,
          component: item.component,
          componentProps: item.componentProps,
        },
      ]);
    }

    onNavigate?.(item);
  };

  const goBack = () => {
    if (isInitialLoad) setIsInitialLoad(false);

    // Store current menu for reference before updating state
    const currentMenu = menuStack[menuStack.length - 1];
    const previousMenu = menuStack[menuStack.length - 2];

    // Handle navigation back to main menu (Design panel)
    if (menuStack.length === 2) {
      // When going back from a first-level submenu to main menu
      setActiveTab("Design");
      setMenuStack([initialMenu]);

      // Also trigger the Design tab's onClick handler if it exists
      const designItem = initialMenu.items?.find(
        (item) => item.title === "Design"
      );
      if (designItem?.onClick) {
        designItem.onClick();
      }
    } else if (menuStack.length > 2) {
      // Going back from deeper levels
      if (previousMenu?.title === "Header") {
        setActiveTab("Header");
      } else if (previousMenu?.title === "Footer") {
        setActiveTab("Footer");
      }
    }

    setMenuStack((prev) => prev.slice(0, -1));
    onBack?.();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMenuStack([initialMenu]);

    const menuItem = initialMenu.items?.find((item) => item.title === tab);
    if (menuItem?.onClick) {
      menuItem.onClick();
    }
  };

  const currentMenu = menuStack[menuStack.length - 1];

  return (
    <div className="absolute top-0 left-0 w-full h-full flex">
      {/* Vertical Tabs with Tooltips */}
      <div className="w-14 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-2">
        <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
          {(initialMenu.items || [])
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon || Settings;
              return (
                <Tooltip.Root key={item.title}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-10 w-10 mb-1 rounded-md transition-all duration-200 ${
                        activeTab === item.title ||
                        (activeTab === "Section Settings" &&
                          item.title === "Design")
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                      onClick={() => handleTabChange(item.title)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={8}
                      className="radix-side-top:animate-slide-down-fade radix-side-right:animate-slide-left-fade radix-side-bottom:animate-slide-up-fade radix-side-left:animate-slide-right-fade inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium bg-gray-900 text-white shadow-md z-50"
                    >
                      {item.title}
                      <Tooltip.Arrow className="fill-gray-900" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
        </Tooltip.Provider>
      </div>

      {/* Content Area - Without animations */}
      <div className="flex-1 relative overflow-y-auto bg-white">
        <div
          className={`absolute top-0 left-0 w-full ${
            skipTransition ? "transition-none" : ""
          }`}
        >
          {/* Display header for top-level Header/Footer panels */}
          {(() => {
            console.log("Current menu stack:", menuStack);
            console.log("Current menu title:", currentMenu?.title);
            console.log(
              "Should show back button:",
              menuStack.length === 1 &&
                (currentMenu.title === "Header" ||
                  currentMenu.title === "Footer")
            );

            return menuStack.length === 1 &&
              (currentMenu.title === "Header" ||
                currentMenu.title === "Footer") ? (
              <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <div className="flex items-center gap-2 p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      console.log("Back button clicked");
                      // Go back to Design panel
                      setActiveTab("Design");
                      // Go back to the main menu
                      setMenuStack([initialMenu]);
                      // Find and click the Design tab
                      const designItem = initialMenu.items?.find(
                        (item) => item.title === "Design"
                      );
                      console.log("Found Design item:", designItem);
                      if (designItem?.onClick) {
                        designItem.onClick();
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-md font-medium">
                    {currentMenu.title} Settings
                  </span>
                </div>
              </div>
            ) : null;
          })()}

          {/* Display title based on menu level - we'll hide this if we're showing our custom header */}
          {menuStack.length === 1 &&
          currentMenu.title !== "Main Menu" &&
          currentMenu.title !== "Header" &&
          currentMenu.title !== "Footer" ? (
            <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <h2 className="px-4 py-3 text-sm font-semibold text-gray-800">
                {currentMenu.title}
              </h2>
            </div>
          ) : null}

          {/* Always show back button for any submenu level */}
          {menuStack.length > 1 && menuStack.length === 2 ? (
            <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <div className="flex items-center gap-2 p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={goBack}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-md font-medium">{currentMenu.title}</span>
              </div>
            </div>
          ) : menuStack.length > 2 ? (
            <div className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <div className="flex items-center gap-2 p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={goBack}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-md font-medium">{currentMenu.title}</span>
              </div>
            </div>
          ) : null}

          {menuStack.length === 1 && initialMenu.items ? (
            <>
              {initialMenu.items.map((item) => (
                <div
                  key={item.title}
                  className={skipTransition ? "transition-none" : ""}
                  style={{
                    display: item.title === activeTab ? "block" : "none",
                  }}
                >
                  {item.subMenu ? (
                    <MenuItemList
                      items={item.subMenu}
                      onItemClick={navigateTo}
                    />
                  ) : item.component ? (
                    <item.component {...item.componentProps} />
                  ) : null}
                </div>
              ))}
            </>
          ) : currentMenu.items ? (
            <MenuItemList items={currentMenu.items} onItemClick={navigateTo} />
          ) : currentMenu.component ? (
            <currentMenu.component {...currentMenu.componentProps} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
