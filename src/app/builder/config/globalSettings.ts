import { Database, Palette, Layout, Type, Globe, Share, Bell, Shield, Code } from 'lucide-react';

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
      { id: 'colors', label: 'Brand Colors', icon: Palette },
    ]
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
    id: 'custom-css',
    label: 'Custom CSS',
    icon: Code,
    description: 'Add custom CSS styles',
    settings: [
      { id: 'css-editor', label: 'CSS Editor', icon: Code },
    ]
  },
  {
    id: 'localization',
    label: 'Localization',
    icon: Globe,
    description: 'Manage languages and regional settings',
    settings: [
      { id: 'languages', label: 'Languages', icon: Globe },
      { id: 'timezone', label: 'Timezone', icon: Globe },
      { id: 'currency', label: 'Currency', icon: Globe },
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
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Configure site notifications and alerts',
    settings: [
      { id: 'popups', label: 'Pop-ups', icon: Bell },
      { id: 'alerts', label: 'Alerts', icon: Bell },
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Manage security settings',
    settings: [
      { id: 'authentication', label: 'Authentication', icon: Shield },
      { id: 'privacy', label: 'Privacy', icon: Shield },
    ]
  }
];
