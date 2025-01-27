// src/section-registry.ts
import { SectionType } from '@/app/builder/types';
import { SectionInfo } from './types';

export class SectionRegistry {
  private static _instance: SectionRegistry;
  private _sections: Map<SectionType, SectionInfo> = new Map();

  private constructor() {}

  public static getInstance(): SectionRegistry {
    if (!SectionRegistry._instance) {
      SectionRegistry._instance = new SectionRegistry();
    }
    return SectionRegistry._instance;
  }

  // Register a new section
  public registerSection(section: SectionInfo): void {
    this._sections.set(section.type, section);
  }

  // Get a specific section by type
  public getSection(type: SectionType): SectionInfo | undefined {
    return this._sections.get(type);
  }

  // Get all registered sections
  public getAllSections(): SectionInfo[] {
    return Array.from(this._sections.values());
  }

  // Get sections by group
  public getSectionsByGroup(group: string): SectionInfo[] {
    return this.getAllSections().filter(section => section.group === group);
  }

  // Get all unique groups
  public getGroups(): string[] {
    const groups = new Set(this.getAllSections().map(section => section.group));
    return Array.from(groups).sort();
  }

  // Check if a section type is registered
  public hasSection(type: SectionType): boolean {
    return this._sections.has(type);
  }

  // Clear all registered sections
  public clearSections(): void {
    this._sections.clear();
  }
}

// Singleton instance for easy access
export const sectionRegistry = SectionRegistry.getInstance();
