import { sectionRegistry } from './section-registry';
import { SectionType } from '@/app/builder/types';
import { allComponents, allSchemas } from '@/app/builder/elements/sections';
import { SectionRegistration } from './types';

// Add this to get access to the require.context
const sectionsContext = require.context('./', true, /^\.\/[^/]+\/index\.ts$/);

export function defineSectionModule(registration: SectionRegistration) {
  return registration;
}

// Helper function to get parent folder name from component key
function getParentFolderName(componentKey: string): string {
  const paths = sectionsContext.keys();
  
  // Find the path that contains our component
  const matchingPath = paths.find(path => {
    try {
      const module = sectionsContext(path);
      return Object.entries(module).some(([key, value]) => 
        key === componentKey || value === allComponents[componentKey.toLowerCase()]
      );
    } catch {
      return false;
    }
  });
  
  if (!matchingPath) {
    console.warn(`Could not find parent folder for component ${componentKey}`);
    return componentKey.toLowerCase().replace('component', '');
  }
  
  // Extract folder name from path (e.g., './banner/index.ts' -> 'banner')
  return matchingPath.split('/')[1];
}

// Utility to create section name from type
function createSectionName(type: string): string {
  return `${type.charAt(0).toUpperCase() + type.slice(1)} Section`;
}

// Utility to determine section group
function determineSectionGroup(type: string, schema: any): string {
  return type.includes('banner') ? 'banner' : (schema?.group || type);
}

// Create placeholder image path
function createPlaceholderPath(type: string): string {
  const normalizedType = type.toLowerCase();
  return `/sections/${normalizedType}/placeholders/${normalizedType}-placeholder.svg`;
}

// Get schema key from component key
function getSchemaKey(componentKey: string): string {
  const baseName = componentKey.replace(/component$/i, '');
  return `${baseName.toLowerCase()}Schema`;
}

// Dynamically import and register sections
export const autoRegisterSections = async () => {
  const componentKeys = Object.keys(allComponents);

  for (const componentKey of componentKeys) {
    try {
      const component = allComponents[componentKey.toLowerCase()];
      const schemaKey = getSchemaKey(componentKey);
      const schema = allSchemas[schemaKey];

      if (!component) {
        console.warn(`Missing component for ${componentKey}`);
        continue;
      }

      if (!schema) {
        console.warn(`Missing schema for ${componentKey}, schema key: ${schemaKey}`);
        continue;
      }

      // Get section type from parent folder
      const sectionType = getParentFolderName(componentKey) as SectionType;
      const sectionName = createSectionName(sectionType);
      const group = determineSectionGroup(sectionType, schema);

      // Register section with all required information
      sectionRegistry.registerSection({
        type: sectionType,
        name: sectionName,
        description: schema.description || sectionName,
        group,
        component,
        placeholderImage: createPlaceholderPath(sectionType),
        defaultContent: schema.defaultContent
      });

    } catch (error) {
      console.error(`Failed to register section for ${componentKey}:`, error);
    }
  }
};

// Auto-register sections when this module is imported
autoRegisterSections();