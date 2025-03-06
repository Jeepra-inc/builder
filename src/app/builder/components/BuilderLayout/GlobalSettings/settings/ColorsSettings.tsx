import { ChevronLeft, ChevronsUpDown } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SketchPicker } from 'react-color';
import GradientColorPicker from 'react-best-gradient-color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorScheme {
  id: string;
  name: string;
  background: string;
  text: string;
  gradient: string;
  buttonBackground: string;
  buttonLabel: string;
  outlineButton: string;
}

const defaultSchemes: Omit<ColorScheme, 'id'>[] = [
  { name: 'Scheme 1', background: '#FFFFFF', text: '#121212', gradient: 'linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)', buttonBackground: '#121212', buttonLabel: '#FFFFFF', outlineButton: '#121212' },
  { name: 'Scheme 2', background: '#F0F0F0', text: '#121212', gradient: 'linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)', buttonBackground: '#121212', buttonLabel: '#FFFFFF', outlineButton: '#121212' },
  { name: 'Scheme 3', background: '#333333', text: '#FFFFFF', gradient: 'linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)', buttonBackground: '#121212', buttonLabel: '#FFFFFF', outlineButton: '#121212' },
  { name: 'Scheme 4', background: '#000000', text: '#FFFFFF', gradient: 'linear-gradient(90deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)', buttonBackground: '#121212', buttonLabel: '#FFFFFF', outlineButton: '#121212' },
  { name: 'Scheme 5', background: '#3366FF', text: '#FFFFFF', gradient: 'linear-gradient(90deg, #8EC5FC 0%, #E0C3FC 100%)', buttonBackground: '#121212', buttonLabel: '#FFFFFF', outlineButton: '#121212' },
];

type ColorProperty = keyof Omit<ColorScheme, 'id' | 'name' | 'gradient' | 'background'>;

const colorProperties: { label: string; key: ColorProperty }[] = [
  { label: 'Text', key: 'text' },
  { label: 'Solid button background', key: 'buttonBackground' },
  { label: 'Solid button label', key: 'buttonLabel' },
  { label: 'Outline button', key: 'outlineButton' },
];

const ColorPicker = ({ color, onChange, label }: { color: string; onChange: (color: string) => void; label: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" className="w-full flex items-center text-left justify-between rounded-none p-4 py-2 h-auto">
        <span className="text-sm font-medium text-gray-700 text-pretty">{label}</span>
        <div className="flex items-center gap-2 border border-gray-200 rounded p-1 min-w-[100px]">
          <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-600 uppercase">{color}</span>
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent 
      className="w-auto p-0" 
      align="start"
      side="right"
      sideOffset={10}
    >
      <SketchPicker
        color={color}
        onChange={(color) => onChange(color.hex)}
        presetColors={['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']}
      />
    </PopoverContent>
  </Popover>
);

const GradientPicker = ({ gradient, onChange }: { gradient: string; onChange: (gradient: string) => void }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" className="w-full flex rounded-none items-center text-left justify-between p-4 py-2 h-auto">
        <span className="text-sm font-medium text-gray-700 text-pretty">Background gradient</span>
        <div className="flex items-center gap-2 border border-gray-200 rounded p-1">
          <div className="w-20 h-6 rounded border border-gray-200" style={{ background: gradient || 'white' }} />
          <ChevronsUpDown size={16} className="text-zinc-400" />
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-4" align="start" side="right" sideOffset={10}>
      <div className="w-[300px]">
        <GradientColorPicker value={gradient} onChange={onChange} />
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="destructive" size="sm" onClick={() => onChange('')} className="w-full">
            Remove Gradient
          </Button>
          <p className="text-xs text-gray-500">Background gradient replaces background where possible.</p>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);

const ColorPreview = ({ 
  background, 
  gradient, 
  text, 
  buttonBackground,
  outlineButton 
}: { 
  background: string; 
  gradient: string; 
  text: string; 
  buttonBackground: string;
  outlineButton: string;
}) => (
  <div className="p-2 px-4 border border-zinc-200 rounded-lg" style={{ background: gradient || background, color: text }}>
    <div className="flex flex-col items-center justify-center mb-2 gap-1">
      <span className="text-xl font-semibold">Aa</span>
      <div className="flex items-center gap-1">
        <span 
          className="w-5 h-2 rounded-full" 
          style={{ backgroundColor: buttonBackground }}
        />
        <span 
          className="w-5 h-2 rounded-full border-2" 
          style={{ 
            borderColor: outlineButton,
            backgroundColor: 'transparent' 
          }}
        />
      </div>
    </div>
  </div>
);

const ColorsSettings = () => {
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(null);
  const [schemes, setSchemes] = useState<ColorScheme[]>(() => {
    // Try to load saved schemes from localStorage
    try {
      const savedSettingsStr = localStorage.getItem('visual-builder-settings');
      if (savedSettingsStr) {
        const savedSettings = JSON.parse(savedSettingsStr);
        if (savedSettings?.globalStyles?.colors?.schemes && 
            Array.isArray(savedSettings.globalStyles.colors.schemes) && 
            savedSettings.globalStyles.colors.schemes.length > 0) {
          console.log('Loaded color schemes from settings:', savedSettings.globalStyles.colors.schemes);
          return savedSettings.globalStyles.colors.schemes;
        }
      }
    } catch (error) {
      console.error('Error loading saved color schemes:', error);
    }
    // Return default schemes if nothing is saved
    return defaultSchemes.map((scheme, index) => ({ ...scheme, id: `scheme-${index + 1}` }));
  });

  const handleColorChange = (property: keyof ColorScheme, value: string) => {
    if (!selectedScheme) return;
    
    const updated = schemes.map(scheme => 
      scheme.id === selectedScheme.id ? { ...scheme, [property]: value } : scheme
    );
    
    setSchemes(updated);
    setSelectedScheme(prev => prev ? { ...prev, [property]: value } : null);
    
    // Save updated schemes to localStorage
    saveColorSchemesToSettings(updated);
  };
  
  // Function to save color schemes to global settings
  const saveColorSchemesToSettings = (updatedSchemes: ColorScheme[]) => {
    try {
      console.log('🎨 ColorsSettings: Saving updated color schemes:', updatedSchemes);
      
      // Save schemes to local state
      setSchemes(updatedSchemes);
      
      // Get current settings from localStorage
      const savedSettingsStr = localStorage.getItem('visual-builder-settings');
      if (savedSettingsStr) {
        let savedSettings = JSON.parse(savedSettingsStr);
        console.log('🎨 ColorsSettings: Current settings from localStorage:', {
          hasGlobalStyles: !!savedSettings.globalStyles,
          hasColors: !!savedSettings.globalStyles?.colors,
          hasSchemes: !!savedSettings.globalStyles?.colors?.schemes,
          schemeCount: savedSettings.globalStyles?.colors?.schemes?.length
        });
        
        // Make sure the basic structure exists
        if (!savedSettings.globalStyles) {
          savedSettings.globalStyles = {};
        }
        
        if (!savedSettings.globalStyles.colors) {
          savedSettings.globalStyles.colors = {};
        }
        
        // Update the color schemes in the settings
        savedSettings.globalStyles.colors.schemes = updatedSchemes;
        
        console.log('🎨 ColorsSettings: Updated settings structure:', {
          hasGlobalStyles: !!savedSettings.globalStyles,
          hasColors: !!savedSettings.globalStyles?.colors,
          hasSchemes: !!savedSettings.globalStyles?.colors?.schemes,
          schemeCount: savedSettings.globalStyles?.colors?.schemes?.length
        });
        
        // Save back to localStorage
        localStorage.setItem('visual-builder-settings', JSON.stringify(savedSettings));
        console.log('🎨 ColorsSettings: Saved to localStorage successfully');
        
        // Also dispatch an event to notify any listeners
        console.log('🎨 ColorsSettings: Dispatching colorSchemeUpdated event');
        window.dispatchEvent(new CustomEvent('colorSchemeUpdated', {
          detail: { schemes: updatedSchemes }
        }));
        
        console.log('🎨 ColorsSettings: Event dispatched successfully');
      } else {
        console.warn('🎨 ColorsSettings: No settings found in localStorage');
      }
    } catch (error) {
      console.error('🚨 Failed to save color schemes to settings:', error);
    }
  };

  const addNewScheme = () => {
    const newScheme: ColorScheme = {
      id: `scheme-${schemes.length + 1}`,
      name: `Scheme ${schemes.length + 1}`,
      background: '#FFFFFF',
      text: '#000000',
      gradient: '',
      buttonBackground: '#000000',
      buttonLabel: '#FFFFFF',
      outlineButton: '#000000'
    };
    const updatedSchemes = [...schemes, newScheme];
    setSchemes(updatedSchemes);
    
    // Save updated schemes to localStorage
    saveColorSchemesToSettings(updatedSchemes);
  };

  // Function to directly save current schemes to settings.json
  const saveToSettingsJson = useCallback(() => {
    try {
      const savedSettingsStr = localStorage.getItem('visual-builder-settings');
      if (savedSettingsStr) {
        const settings = JSON.parse(savedSettingsStr);
        
        // Make sure the colors object has a schemes array with our current schemes
        if (!settings.globalStyles) {
          settings.globalStyles = {};
        }
        
        if (!settings.globalStyles.colors) {
          settings.globalStyles.colors = {};
        }
        
        // Ensure we're using the latest schemes from our state
        settings.globalStyles.colors.schemes = schemes;
        
        console.log('🎨 [ColorsSettings] Saving settings to API...', {
          hasGlobalStyles: !!settings.globalStyles,
          hasColors: !!settings.globalStyles?.colors,
          hasSchemes: !!settings.globalStyles?.colors?.schemes,
          schemeCount: settings.globalStyles?.colors?.schemes?.length
        });
        
        // Call the API endpoint to save settings to the public directory
        fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to save settings file: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('🎨 [ColorsSettings] Settings saved successfully:', data);
          // Show success message
          alert('Color palette settings saved successfully to settings.json');
        })
        .catch(error => {
          console.error('🚨 [ColorsSettings] Error saving settings:', error);
          alert(`Error saving settings: ${error.message}`);
        });
      } else {
        console.warn('🚨 [ColorsSettings] No settings found in localStorage');
        alert('No settings found to save!');
      }
    } catch (error) {
      console.error('🚨 [ColorsSettings] Failed to save settings to file:', error);
      alert(`Error preparing settings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Color Schemes</h2>
      </div>
      {selectedScheme ? (
        <div className="absolute w-full top-0 left-0 h-full bg-white flex flex-col">
          <div className="flex w-full items-center gap-2 p-4 px-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedScheme(null)} className="w-4 h-6">
              <ChevronLeft />
            </Button>
            <div>
              <span className="text-zinc-500 text-sm">Colors</span>
              <h4 className="text-md font-semibold">Editing {selectedScheme.name}</h4>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-4 pb-8 pt-0 mb-4 border-b border-zinc-200">
            <ColorPreview
              background={selectedScheme.background}
              gradient={selectedScheme.gradient}
              text={selectedScheme.text}
              buttonBackground={selectedScheme.buttonBackground}
              outlineButton={selectedScheme.outlineButton}
            />
            <p className="text-xs text-zinc-600">
              Editing this scheme's colors will affect all sections that use this scheme.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ColorPicker
              label="Background"
              color={selectedScheme.background}
              onChange={(color) => handleColorChange('background', color)}
            />
            <GradientPicker
              gradient={selectedScheme.gradient}
              onChange={(gradient) => handleColorChange('gradient', gradient)}
            />
            {colorProperties.map(({ label, key }) => (
              <ColorPicker
                key={key}
                label={label}
                color={selectedScheme[key]}
                onChange={(color) => handleColorChange(key, color)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-sm font-semibold mb-1">Schemes</h2>
          <p className="mb-4 text-xs text-zinc-600">Color schemes can be applied to sections throughout your online store.</p>
          <div className="grid grid-cols-3 gap-2">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="group">
                <div
                  className="border border-gray-300 rounded-lg cursor-pointer mb-2 hover:shadow-md"
                  style={{ background: scheme.gradient || scheme.background, color: scheme.text }}
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <ColorPreview
                    background={scheme.background}
                    gradient={scheme.gradient}
                    text={scheme.text}
                    buttonBackground={scheme.buttonBackground}
                    outlineButton={scheme.outlineButton}
                  />
                </div>
                <p className="text-center text-xs font-medium mb-2">{scheme.name}</p>
              </div>
            ))}
            <div>
              <div
                className="p-4 min-h-[70px] flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg text-zinc-500 cursor-pointer hover:shadow-md"
                onClick={addNewScheme}
              >
                <span className="text-sm">+</span>
              </div>
              <p className="text-center text-xs font-medium mt-2">Add Scheme</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { ColorsSettings };