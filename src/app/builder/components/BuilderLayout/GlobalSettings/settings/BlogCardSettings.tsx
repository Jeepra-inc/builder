import React, { useState } from 'react';
import { SettingSection } from './SettingSection';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';
import RangeSlider from './RangeSlider';

export function BlogCardSettings() {
  const [style, setStyle] = useState<'standard' | 'card'>('card');
  const [imagePadding, setImagePadding] = useState(0);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [colorScheme, setColorScheme] = useState('scheme-2');
  const [borderThickness, setBorderThickness] = useState(0);
  const [borderOpacity, setBorderOpacity] = useState(10);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [shadowBlur, setShadowBlur] = useState(5);

  return (
    <div className="space-y-6">
      <SettingSection title="Style" description="Choose card layout">
        <div className="flex gap-2">
          <Button
            variant={style === 'standard' ? 'default' : 'outline'}
            onClick={() => setStyle('standard')}
          >
            Standard
          </Button>
          <Button
            variant={style === 'card' ? 'default' : 'outline'}
            onClick={() => setStyle('card')}
          >
            Card
          </Button>
        </div>
      </SettingSection>

      <SettingSection title="Image Padding" description="Adjust image spacing">
        <RangeSlider
          value={imagePadding}
          onInput={(e) => setImagePadding(parseFloat(e.target.value))}
          unit="px"
          min={0}
          max={50}
          step={1}
        />
      </SettingSection>

      <SettingSection title="Text Alignment" description="Set text positioning">
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <Button
              key={align}
              variant={textAlignment === align ? 'default' : 'outline'}
              onClick={() => setTextAlignment(align)}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </Button>
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Color Scheme" description="Select color palette">
        <Select value={colorScheme} onValueChange={setColorScheme}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select scheme" />
          </SelectTrigger>
          <SelectContent>
            {['scheme-1', 'scheme-2', 'scheme-3'].map((scheme) => (
              <SelectItem key={scheme} value={scheme}>
                <div className="flex items-center gap-2">
                  {colorScheme === scheme && <Check className="h-4 w-4" />}
                  {scheme.replace('scheme-', 'Scheme ')}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingSection>

      <SettingSection title="Border" description="Customize card borders">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thickness</label>
            <RangeSlider
              value={borderThickness}
              onInput={(e) => setBorderThickness(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={20}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Opacity</label>
            <RangeSlider
              value={borderOpacity}
              onInput={(e) => setBorderOpacity(parseFloat(e.target.value))}
              unit="%"
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Corner radius</label>
            <RangeSlider
              value={cornerRadius}
              onInput={(e) => setCornerRadius(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={50}
              step={1}
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Shadow" description="Adjust shadow properties">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Opacity</label>
            <RangeSlider
              value={shadowOpacity}
              onInput={(e) => setShadowOpacity(parseFloat(e.target.value))}
              unit="%"
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horizontal offset</label>
            <RangeSlider
              value={horizontalOffset}
              onInput={(e) => setHorizontalOffset(parseFloat(e.target.value))}
              unit="px"
              min={-50}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vertical offset</label>
            <RangeSlider
              value={verticalOffset}
              onInput={(e) => setVerticalOffset(parseFloat(e.target.value))}
              unit="px"
              min={-50}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Blur</label>
            <RangeSlider
              value={shadowBlur}
              onInput={(e) => setShadowBlur(parseFloat(e.target.value))}
              unit="px"
              min={0}
              max={50}
              step={1}
            />
          </div>
        </div>
      </SettingSection>
    </div>
  );
}