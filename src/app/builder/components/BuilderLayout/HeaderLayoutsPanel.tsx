'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

interface HeaderLayoutsPanelProps {
  onBack: () => void;
}

export function HeaderLayoutsPanel({ onBack }: HeaderLayoutsPanelProps) {
  return (
    <ScrollArea className="h-full w-full rounded-md">
      <div className="pb-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Settings</span>
          </Button>
        </div>

        {/* Layout Options */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Header Preset</h3>
          <div className='layout'>
            <img src="https://www.gikacoustics.com/wp-content/themes/flatsome/inc/admin/options/header/img/header-default.svg" alt="" />
          </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
