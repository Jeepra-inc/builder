import { Section, SectionSchema, SectionType } from '@/app/builder/types';
import { ReactNode, ComponentType } from 'react';

export interface SectionProps {
  settings: Section['settings'];
  schema?: SectionSchema;
}

export interface BaseComponentProps {
  section: Section;
  isEditing?: boolean;
  isSelected?: boolean;
  onUpdateSection?: (updates: Partial<Section>) => void;
  className?: string;
  schema?: SectionSchema;
}

export interface BaseSectionProps {
  schema: SectionSchema;
  section: Section;
  isEditing?: boolean;
  isSelected?: boolean;
  onUpdateSection?: (updates: Partial<Section>) => void;
  className?: string;
  children: (resolvedSettings: Record<string, any>) => ReactNode;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface SchemaProviderProps {
  schema: SectionSchema;
  children: ReactNode;
}

// Section Registration Types
export interface SectionRegistration {
  type: SectionType;
  name: string;
  component: ComponentType<any>;
  schema: SectionSchema;
  group?: string;
}

export interface SectionInfo {
  type: SectionType;
  name: string;
  description: string;
  group: string;
  component: ComponentType<any>;
  placeholderImage: string;
  defaultContent?: Record<string, any>;
}

// src/types/BannerSettings.ts
export interface BannerSettings {
  title: string;
  description: string;
  textAlignment: 'left' | 'center' | 'right';
  backgroundColor: string;
  textColor: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: 'primary' | 'secondary' | 'outline';
}
