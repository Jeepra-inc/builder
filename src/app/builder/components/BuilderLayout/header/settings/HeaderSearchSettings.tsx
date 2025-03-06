'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingSection } from '../../GlobalSettings/settings/SettingSection';

interface HeaderSearchSettingsProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function HeaderSearchSettings({ settings = {}, onUpdateSettings }: HeaderSearchSettingsProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <SettingSection
        title="Search Settings"
        description="Configure header search functionality"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Show Search</Label>
            <Switch
              checked={settings.search?.show}
              onCheckedChange={(checked) => handleUpdate('search.show', checked)}
            />
          </div>
          <div className="space-y-2">
            <Label>Search Type</Label>
            <Select
              value={settings.search?.type || 'icon'}
              onValueChange={(value) => handleUpdate('search.type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icon">Icon Only</SelectItem>
                <SelectItem value="form">Search Form</SelectItem>
                <SelectItem value="expandable">Expandable Search</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Placeholder Text</Label>
            <Input
              value={settings.search?.placeholder || ''}
              onChange={(e) => handleUpdate('search.placeholder', e.target.value)}
              placeholder="Search..."
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}