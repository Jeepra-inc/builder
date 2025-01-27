import React, { useEffect } from 'react';
import { useBuilder } from '../../../contexts/BuilderContext';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Database, X } from 'lucide-react';
import { ImageUpload } from '../../common/ImageUpload';
import { SettingSection } from '../SettingSection';

export function BrandingSettings() {
  const { 
    backgroundColor, 
    setBackgroundColor,
    logoUrl,
    setLogoUrl,
    logoWidth,
    setLogoWidth,
    faviconUrl,
    setFaviconUrl
  } = useBuilder();

  // Update iframe whenever logo settings change
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_HEADER',
        settings: {
          logoUrl,
          logoWidth,
          backgroundColor
        }
      }, '*');
    }
  }, [logoUrl, logoWidth, backgroundColor]);

  return (
    <div className="space-y-6">
      <SettingSection
        title="Logo"
        description="Upload and configure your site logo"
      >
        <div className="relative">
          <Button 
            variant="outline" 
            className="w-full h-[100px] border-dashed flex flex-col gap-2 hover:bg-zinc-50"
            onClick={() => document.getElementById('logo-upload')?.click()}
          >
            {logoUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="max-h-[80px] object-contain" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUrl('');
                  }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Database className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-600">Select</span>
              </>
            )}
          </Button>
          <ImageUpload id="logo-upload" onImageUpload={setLogoUrl} />
        </div>
      </SettingSection>

      <SettingSection
        title="Logo Width"
        description="Adjust the width of your logo"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Slider
              value={[logoWidth]}
              onValueChange={([value]) => setLogoWidth(value)}
              min={50}
              max={300}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={logoWidth}
              onChange={(e) => setLogoWidth(Number(e.target.value))}
              className="w-16 text-right"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Brand Colors"
        description="Set your brand colors"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Primary Color</label>
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Add more color inputs as needed */}
        </div>
      </SettingSection>

      <SettingSection
        title="Favicon"
        description="Upload your site favicon (32x32px recommended)"
      >
        <div className="relative">
          <Button 
            variant="outline" 
            className="w-full h-[100px] border-dashed flex flex-col gap-2 hover:bg-zinc-50"
            onClick={() => document.getElementById('favicon-upload')?.click()}
          >
            {faviconUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={faviconUrl} alt="Favicon" className="max-h-[80px] object-contain" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFaviconUrl('');
                  }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Database className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-600">Select</span>
              </>
            )}
          </Button>
          <ImageUpload id="favicon-upload" onImageUpload={setFaviconUrl} />
        </div>
      </SettingSection>
    </div>
  );
}
