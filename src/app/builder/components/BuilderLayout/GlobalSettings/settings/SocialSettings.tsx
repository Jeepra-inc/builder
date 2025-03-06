import React, { useState } from 'react';
import { SettingSection } from './SettingSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

type SocialLink = {
  platform: string;
  url: string;
};

const socialOptions = [
  { value: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { value: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/username' },
  { value: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { value: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { value: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@username' },
  { value: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { value: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
];

export function SocialSettings() {
  const [links, setLinks] = useState<SocialLink[]>([{ platform: '', url: '' }]);

  const getAvailablePlatforms = (currentIndex: number) => {
    return socialOptions.filter(option =>
      !links.some((link, index) => 
        index !== currentIndex && link.platform === option.value
      )
    );
  };

  const handleAddLink = () => {
    setLinks([...links, { platform: '', url: '' }]);
  };

  const handlePlatformChange = (value: string, index: number) => {
    const newLinks = [...links];
    newLinks[index].platform = value;
    setLinks(newLinks);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newLinks = [...links];
    newLinks[index].url = e.target.value;
    setLinks(newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const availablePlatforms = getAvailablePlatforms(-1);

  return (
    <div className="space-y-6">
      <SettingSection
        title="Social Links"
        description="Add links to your social media profiles"
      >
        <div className="space-y-4">
          {links.map((link, index) => {
            const available = getAvailablePlatforms(index);
            
            return (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 flex gap-2">
                  <Select
                    value={link.platform}
                    onValueChange={(value) => handlePlatformChange(value, index)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="url"
                    placeholder={
                      socialOptions.find(o => o.value === link.platform)?.placeholder ||
                      'Enter URL'
                    }
                    value={link.url}
                    onChange={(e) => handleUrlChange(e, index)}
                  />
                </div>

                {links.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive"
                    onClick={() => handleRemoveLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}

          {availablePlatforms.length > 0 && (
            <Button
              variant="outline"
              type="button"
              onClick={handleAddLink}
              className="mt-2"
            >
              + Add Link
            </Button>
          )}
        </div>
      </SettingSection>
    </div>
  );
}