import { Database, Palette, Layout, Type, Globe, Share, Bell, Shield, Code, Play, Group, FormInput, Paperclip, MedalIcon, Image } from 'lucide-react';
import { ColorsSettings } from '@/app/builder/components/BuilderLayout/GlobalSettings/settings/ColorsSettings';

export interface SettingConfig {
  id: string;
  label: string;
  description?: string;
  icon: any;
}

export interface SettingCategory {
  id: string;
  label: string;
  icon: any;
  description?: string;
  settings: SettingConfig[];
  component?: any; 
}

export const globalSettingsConfig: SettingCategory[] = [
  {
    id: 'branding',
    label: 'Branding',
    icon: Database,
    description: 'Manage your brand assets and identity',
    settings: [
      { id: 'logo', label: 'Logo', icon: Database },
      { id: 'favicon', label: 'Favicon', icon: Database },
    ]
  },
  {
    id: 'colors',
    label: 'Colors',
    icon: Palette,
    description: 'Manage your color settings',
    settings: [
      { id: 'primary-color', label: 'Primary Color', icon: Palette },
      { id: 'secondary-color', label: 'Secondary Color', icon: Palette },
      { id: 'accent-color', label: 'Accent Color', icon: Palette },
    ],
    component: ColorsSettings
  },
  {
    id: 'layout',
    label: 'Layout',
    icon: Layout,
    description: 'Configure your site layout and structure',
    settings: [
      { id: 'header', label: 'Header', icon: Layout },
      { id: 'footer', label: 'Footer', icon: Layout },
      { id: 'navigation', label: 'Navigation', icon: Layout },
    ]
  },
  {
    id: 'typography',
    label: 'Typography',
    icon: Type,
    description: 'Customize your site fonts and text styles',
    settings: [
      { id: 'fonts', label: 'Fonts', icon: Type },
      { id: 'headings', label: 'Headings', icon: Type },
      { id: 'paragraphs', label: 'Paragraphs', icon: Type },
    ]
  },
  {
    id: 'animation',
    label: 'Animation',
    icon: Play,
    description: 'Manage animation settings',
    settings: [
      { id: 'animations', label: 'Animations', icon: Play },
    ]
  },
  {
    id: 'buttons',
    label: 'Buttons',
    icon: Group,
    description: 'Manage button settings',
    settings: [
      { id: 'buttons', label: 'Buttons', icon: Play },
    ]
  },
  {
    id: 'inputs',
    label: 'Inputs',
    icon: FormInput,
    description: 'Manage input settings',
    settings: [
      { id: 'inputs', label: 'Inputs', icon: Play },
    ]
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: Share,
    description: 'Configure social media integration',
    settings: [
      { id: 'accounts', label: 'Social Accounts', icon: Share },
      { id: 'sharing', label: 'Share Buttons', icon: Share },
    ]
  },
  {
    id: 'blog-card',
    label: 'Blog Card',
    icon: Paperclip,
    description: 'Configure Blog card settings',
    settings: [
      { id: 'blog-card', label: 'Blog Card', icon: Share },
    ]
  },
  {
    id: 'media',
    label: 'Media',
    icon: Image,
    description: 'Manage media settings',
    settings: [
      { id: 'media', label: 'Media', icon: Share },
    ]
  },
  {
    id: 'custom-css',
    label: 'Custom CSS',
    icon: Code,
    description: 'Add custom CSS styles',
    settings: [
      { id: 'css-editor', label: 'CSS Editor', icon: Code },
    ]
  },
];
