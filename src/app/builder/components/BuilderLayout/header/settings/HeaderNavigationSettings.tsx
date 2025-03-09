"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingSection } from "../../GlobalSettings/settings/SettingSection";
import { Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import menuItemsData from "@/app/builder/data/menu-items.json";

interface HeaderNavigationSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  contentRef?: React.RefObject<HTMLIFrameElement>;
}

export function HeaderNavigationSettings({
  settings = {},
  onUpdateSettings,
  contentRef,
}: HeaderNavigationSettingsProps) {
  const [activeMenuType, setActiveMenuType] = useState<string>("mainMenu");
  const [menuItems, setMenuItems] = useState<any>(
    settings.navigation?.items || []
  );
  const [menuData, setMenuData] = useState<any>(menuItemsData);

  useEffect(() => {
    // Initialize menu items from settings or from default data if not present
    const currentItems = settings.navigation?.items || [];

    if (currentItems.length === 0 && menuData[activeMenuType]?.items) {
      // If no items in settings but we have default data, use it
      handleUpdate("navigation.items", menuData[activeMenuType].items);
      setMenuItems(menuData[activeMenuType].items);
    } else {
      setMenuItems(currentItems);
    }
  }, [activeMenuType, settings.navigation?.items]);

  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });

      // Also update the iframe if contentRef is available
      if (contentRef?.current?.contentWindow) {
        contentRef.current.contentWindow.postMessage(
          {
            type: "UPDATE_NAVIGATION",
            menuType: activeMenuType,
            items: value,
          },
          "*"
        );
      }
    }
  };

  const handleAddNavItem = () => {
    const newItem = {
      id: `${activeMenuType}_item_${menuItems.length + 1}`,
      text: "New Item",
      url: "#",
      isButton: false,
      children: [],
    };

    const updatedItems = [...menuItems, newItem];
    handleUpdate("navigation.items", updatedItems);
    setMenuItems(updatedItems);
  };

  const handleRemoveNavItem = (index: number) => {
    const newItems = [...menuItems];
    newItems.splice(index, 1);
    handleUpdate("navigation.items", newItems);
    setMenuItems(newItems);
  };

  const handleMenuChange = (value: string) => {
    setActiveMenuType(value);

    // Get items for the selected menu type
    const items = menuData[value]?.items || [];

    // Update both the menuType and items
    if (onUpdateSettings) {
      onUpdateSettings({
        navigation: {
          ...settings.navigation,
          menuType: value,
          items: items,
        },
      });
    }

    // Send a message to update navigation in the iframe
    if (contentRef?.current?.contentWindow) {
      contentRef.current.contentWindow.postMessage(
        {
          type: "UPDATE_NAVIGATION",
          menuType: value,
          items: items,
        },
        "*"
      );
    }
  };

  const handleItemUpdate = (index: number, field: string, value: any) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleUpdate("navigation.items", newItems);
    setMenuItems(newItems);
  };

  const handleAddChildItem = (parentIndex: number) => {
    const newItems = [...menuItems];

    // Initialize children array if it doesn't exist
    if (!newItems[parentIndex].children) {
      newItems[parentIndex].children = [];
    }

    // Add new child item
    newItems[parentIndex].children.push({
      id: `${newItems[parentIndex].id}_child_${
        newItems[parentIndex].children.length + 1
      }`,
      text: "New Submenu Item",
      url: "#",
      isButton: false,
    });

    handleUpdate("navigation.items", newItems);
    setMenuItems(newItems);
  };

  const handleRemoveChildItem = (parentIndex: number, childIndex: number) => {
    const newItems = [...menuItems];
    newItems[parentIndex].children.splice(childIndex, 1);
    handleUpdate("navigation.items", newItems);
    setMenuItems(newItems);
  };

  const handleChildItemUpdate = (
    parentIndex: number,
    childIndex: number,
    field: string,
    value: any
  ) => {
    const newItems = [...menuItems];
    newItems[parentIndex].children[childIndex] = {
      ...newItems[parentIndex].children[childIndex],
      [field]: value,
    };
    handleUpdate("navigation.items", newItems);
    setMenuItems(newItems);
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Menu Selection"
        description="Choose which menu to edit"
      >
        <Select value={activeMenuType} onValueChange={handleMenuChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select menu type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainMenu">{menuData.mainMenu.name}</SelectItem>
            <SelectItem value="topBarMenu">
              {menuData.topBarMenu.name}
            </SelectItem>
            <SelectItem value="bottomMenu">
              {menuData.bottomMenu.name}
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="mt-2 text-sm text-muted-foreground">
          {menuData[activeMenuType]?.description}
        </div>
      </SettingSection>

      <SettingSection
        title={`${menuData[activeMenuType]?.name || "Navigation"} Items`}
        description="Manage header navigation menu items"
      >
        <div className="space-y-4">
          {menuItems.map((item: any, index: number) => (
            <div key={index} className="space-y-2 p-3 border rounded-md">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Menu Item {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveNavItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Input
                    value={item.text}
                    onChange={(e) =>
                      handleItemUpdate(index, "text", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={item.url}
                    onChange={(e) =>
                      handleItemUpdate(index, "url", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={item.isButton}
                    onCheckedChange={(checked) =>
                      handleItemUpdate(index, "isButton", checked)
                    }
                  />
                  <Label>Show as Button</Label>
                </div>

                {/* Submenu section */}
                <div className="pt-2 border-t mt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      Submenu Items ({item.children?.length || 0})
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddChildItem(index)}
                      className="h-8"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Submenu Item
                    </Button>
                  </div>

                  {item.children && item.children.length > 0 && (
                    <div className="ml-4 mt-2 space-y-3 pl-2 border-l">
                      {item.children.map((child: any, childIndex: number) => (
                        <div
                          key={childIndex}
                          className="space-y-2 p-2 border rounded-md bg-slate-50"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">
                              Submenu Item {childIndex + 1}
                            </Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveChildItem(index, childIndex)
                              }
                              className="h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Text</Label>
                            <Input
                              value={child.text}
                              size={30}
                              className="h-8"
                              onChange={(e) =>
                                handleChildItemUpdate(
                                  index,
                                  childIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">URL</Label>
                            <Input
                              value={child.url}
                              className="h-8"
                              onChange={(e) =>
                                handleChildItemUpdate(
                                  index,
                                  childIndex,
                                  "url",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button onClick={handleAddNavItem} className="w-full">
            Add Navigation Item
          </Button>
        </div>
      </SettingSection>
    </div>
  );
}
