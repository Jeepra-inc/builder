'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Layout, ArrowLeft } from 'lucide-react';
import { HeaderLayoutsPanel } from './HeaderLayoutsPanel';
import { LogoSettingsPanel } from './panels/LogoSettingsPanel';
import { headerItems } from './data/headerItems';

type PanelType = 'main' | 'layouts' | string;

interface HeaderSettingsPanelProps {
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

const handleUpdate = (field: string, value: any, onUpdateSettings?: (settings: any) => void) => {
  if (onUpdateSettings) {
    onUpdateSettings({ [field]: value });
  }
};

export function HeaderSettingsPanel({ settings = {}, onUpdateSettings }: HeaderSettingsPanelProps) {
  const [currentView, setCurrentView] = useState<PanelType>('main');

  if (currentView === 'layouts') {
    return <HeaderLayoutsPanel onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'logo') {
    return (
      <ScrollArea className="h-full w-full rounded-md">
        <div className="pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setCurrentView('main')}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Settings</span>
            </Button>
          </div>
          <div className="px-3">
            <h3 className="text-sm font-semibold mb-4">{headerItems.find(item => item.id === currentView)?.label}</h3>
            <LogoSettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (currentView !== 'main') {
    return (
      <ScrollArea className="h-full w-full rounded-md">
        <div className="pb-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setCurrentView('main')}>
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Settings</span>
            </Button>
          </div>
          <div className="px-3">
            <h3 className="text-sm font-semibold mb-4">{headerItems.find(item => item.id === currentView)?.label}</h3>
            <div className="text-sm text-gray-500">Settings panel for {headerItems.find(item => item.id === currentView)?.label} coming soon...</div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div className="pb-8">
        {/* Layouts Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 py-2 mb-3">
            <Layout className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold cursor-pointer" onClick={() => setCurrentView('layouts')}>Layouts</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {headerItems.map((item) => (
            <div
              key={item.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setCurrentView(item.id)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
