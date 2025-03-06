'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SettingSection } from '../../GlobalSettings/settings/SettingSection';
import { Trash2 } from 'lucide-react';

interface HeaderNavigationSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function HeaderNavigationSettings({ settings = {}, onUpdateSettings }: HeaderNavigationSettingsProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  const handleAddNavItem = () => {
    const currentItems = settings.navigation?.items || [];
    handleUpdate('navigation.items', [
      ...currentItems,
      { text: 'New Item', url: '#', isButton: false }
    ]);
  };

  const handleRemoveNavItem = (index: number) => {
    const newItems = [...(settings.navigation?.items || [])];
    newItems.splice(index, 1);
    handleUpdate('navigation.items', newItems);
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Navigation Items"
        description="Manage header navigation menu items"
      >
        <div className="space-y-4">
          {settings.navigation?.items?.map((item: any, index: number) => (
            <div key={index} className="space-y-2 p-3 border rounded-md">
              <div className="flex items-center justify-between">
                <Label>Navigation Item {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveNavItem(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Text</Label>
                <Input
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...(settings.navigation?.items || [])];
                    newItems[index] = { ...item, text: e.target.value };
                    handleUpdate('navigation.items', newItems);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...(settings.navigation?.items || [])];
                    newItems[index] = { ...item, url: e.target.value };
                    handleUpdate('navigation.items', newItems);
                  }}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={item.isButton}
                  onCheckedChange={(checked) => {
                    const newItems = [...(settings.navigation?.items || [])];
                    newItems[index] = { ...item, isButton: checked };
                    handleUpdate('navigation.items', newItems);
                  }}
                />
                <Label>Show as Button</Label>
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