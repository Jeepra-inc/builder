import React from 'react';
import { SettingSection } from './SettingSection';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AnimationSettings() {
  return (
    <div className="space-y-6">
      <SettingSection
        title="Custom CSS"
        description="Add your own custom CSS styles"
      >
       <div className='flex items-center justify-between gap-4 mb-4'>
        <span>Animations</span>
        <Switch />
       </div>
       <div className='flex items-center justify-between gap-4'>
      
        <span>Hover Effects</span>
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Anmation" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                <SelectLabel>Animations</SelectLabel>
                <SelectItem value="apple">3D</SelectItem>
                <SelectItem value="banana">Verticle List</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
       </div>
      </SettingSection>
    </div>
  );
}
