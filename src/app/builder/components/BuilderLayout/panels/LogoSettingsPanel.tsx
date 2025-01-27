'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogoSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export function LogoSettingsPanel({ settings = {}, onUpdateSettings }: LogoSettingsPanelProps) {
  const handleUpdate = (field: string, value: any) => {
    if (onUpdateSettings) {
      onUpdateSettings({ [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <ImageUploader
          value={settings.logo?.image}
          onChange={(url) => handleUpdate('logo.image', url)}
          label="Logo Image"
        />
        <div className="space-y-2">
          <Label>Logo Text</Label>
          <Input
            value={settings.logo?.text || ''}
            onChange={(e) => handleUpdate('logo.text', e.target.value)}
            placeholder="Enter logo text"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={settings.logo?.showText}
            onCheckedChange={(checked) => handleUpdate('logo.showText', checked)}
          />
          <Label>Show Logo Text</Label>
        </div>
        <div className="space-y-2">
          <Label>Logo Size</Label>
          <Select 
            value={settings.logo?.size || 'medium'} 
            onValueChange={(value) => handleUpdate('logo.size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
