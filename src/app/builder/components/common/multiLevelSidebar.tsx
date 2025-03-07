// MultiLevelSidebar.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const MenuItemList = ({
  items,
  onItemClick,
}: {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
}) => (
  <ul>
    {items.map((item, index) => (
      <li key={index} className="border-b">
        {item.subMenu || item.component ? (
          <Button
            className="w-full rounded-none justify-between text-sm font-medium px-3 py-2.5 h-auto hover:bg-zinc-100 hover:text-indigo-700 transition-colors"
            variant="ghost"
            onClick={() => onItemClick(item)}
          >
            <span className="flex items-center">
              {item.icon && (
                <item.icon className="h-4 w-4 mr-2.5 text-gray-500" />
              )}
              <span className="text-gray-700">{item.title}</span>
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </Button>
        ) : null}
      </li>
    ))}
  </ul>
);

const BackButtonWithTitle = ({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) => (
  <div className="px-4 py-3 flex items-center border-b border-gray-200 bg-gray-50">
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 rounded-full mr-2 hover:bg-gray-200 transition-colors"
      onClick={onBack}
    >
      <ChevronLeft className="h-4 w-4 text-gray-600" />
    </Button>
    <h2 className="text-sm font-medium text-gray-800">{title}</h2>
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
        }
      }
    }
  }, []);

  // This effect handles the switchTab event
  useEffect(() => {
    const handleSwitchTab = (
      e: CustomEvent<{ targetTab: string; targetSubmenu?: string }>
    ) => {
      const targetTab = e.detail.targetTab;
      const targetSubmenu = e.detail.targetSubmenu;

      const menuItem = initialMenu.items?.find(
        (item) => item.title.toLowerCase() === targetTab.toLowerCase()
      );

      if (menuItem) {
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
    <motion.div
      custom={direction}
      initial={{ x: direction === "forward" ? "100%" : "-30%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction === "forward" ? "100%" : "-30%", opacity: 0 }}
      className="absolute top-0 left-0 w-full h-full flex"
      transition={animationConfig}
    >
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

      {/* Content Area */}
      <div className="flex-1 relative overflow-y-auto bg-white">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={menuStack.length}
            custom={direction}
            initial={{
              x: direction === "forward" ? "100%" : "-30%",
              opacity: 0,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction === "forward" ? "100%" : "-30%", opacity: 0 }}
            className="absolute top-0 left-0 w-full"
            transition={animationConfig}
          >
            {menuStack.length > 1 && (
              <BackButtonWithTitle title={currentMenu.title} onBack={goBack} />
            )}

            {menuStack.length === 1 && initialMenu.items ? (
              <>
                {initialMenu.items.map((item) => (
                  <div
                    key={item.title}
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
              <MenuItemList
                items={currentMenu.items}
                onItemClick={navigateTo}
              />
            ) : currentMenu.component ? (
              <currentMenu.component {...currentMenu.componentProps} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
