// sections/index.ts
import { ComponentType } from 'react';
import { isValidElementType } from 'react-is';
import { SectionType, Theme } from '@/app/builder/types';
import { sectionRegistry } from './section-registry';

// Dynamically import all section modules using require.context
const sectionsContext = require.context('./', true, /^\.\/[^/]+\/index\.ts$/) as {
  keys(): string[];
  (id: string): any;
  resolve(id: string): string;
};

// Initialize objects to hold schemas, components, and special sections
export const schemas: Record<string, any> = {};
export const components: Record<string, ComponentType<any>> = {};

// Function to find placeholder image
const findPlaceholderImage = (componentName: string, sectionFolder: string) => {
  // Possible placeholder file names
  const placeholderNames = [
    `${componentName}-placeholder.svg`,
    `${componentName}Placeholder.svg`,
    'placeholder.svg'
  ];

  // Try to find the placeholder in the section's placeholders folder
  for (const placeholderName of placeholderNames) {
    const placeholderPath = `/sections/${sectionFolder}/placeholders/${placeholderName}`;
    
    // In a real webpack context, you'd use require.context or similar
    // Here we're assuming the file might exist
    return placeholderPath;
  }

  // Fallback to a global default placeholder
  return '/placeholders/default-placeholder.svg';
};

// Function to normalize component name
function normalizeComponentName(name: string): string {
  return name.toLowerCase().replace(/component$/, '');
}

// Function to normalize schema name
function normalizeSchemaName(name: string): string {
  return name.toLowerCase().replace(/schema$/, '');
}

// Aggregate exports from each section module
sectionsContext.keys().forEach((path) => {
  const module = sectionsContext(path);

  // Extract folder name from the path (e.g., './banner/index.ts' -> 'banner')
  const folder = path.split('/')[1];

  // Collect schemas, components, and special sections
  Object.entries(module).forEach(([exportKey, exportValue]) => {
    const lowerKey = exportKey.toLowerCase();
    
    // Handle schemas
    if (lowerKey.endsWith('schema')) {
      const normalizedName = normalizeSchemaName(exportKey);
      schemas[normalizedName] = exportValue;
    }
    
    // Handle components
    if (typeof exportValue === 'function' && lowerKey.endsWith('component')) {
      const normalizedName = normalizeComponentName(exportKey);
      // Type check to ensure the function is a React component
      if (isValidElementType(exportValue)) {
        components[normalizedName] = exportValue as ComponentType<any>;
      } else {
        console.warn(`Warning: ${exportKey} is not a valid React component`);
      }
    }
    
    // Handle special sections
    if (exportKey === 'bannerSpecialSections') {
      Object.assign(components, module[exportKey]);
    }
  });

  // Fallback: if default export is a valid component, add it
  if (module.default && typeof module.default === 'function') {
    const defaultComponentName = module.default.name.replace('Component', '').toLowerCase();
    components[defaultComponentName] = module.default;
  }
});

// Dynamically register sections
const registerSections = () => {
  Object.entries(components).forEach(([componentName, component]) => {
    const schema = schemas[componentName];

    // Determine section type and name
    const sectionType = componentName as SectionType;
    const sectionName = `${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Section`;

    // Special handling for banner components to ensure they're in the same group
    const group = componentName.includes('banner') ? 'banner' : componentName;

    // Find the corresponding section folder
    const sectionFolder = sectionsContext.keys().find(path => 
      path.includes('/index.ts')
    )?.split('/')[1] || componentName;

    // Register section
    sectionRegistry.registerSection({
      type: sectionType,
      name: sectionName,
      description: schema?.description || sectionName,
      group, 
      component,
      placeholderImage: findPlaceholderImage(componentName, sectionFolder)
    });
  });
};

registerSections();

// Generate sections configuration
const sectionsConfig = Object.entries(components).reduce((acc: Record<string, any>, [componentName, component]) => {
  const schema = schemas[componentName];

  acc[componentName] = {
    name: `${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Section`,
    component,
    settings: schema?.settings || [],
  };

  return acc;
}, {});

// Merge any special sections
const finalSectionsConfig = {
  ...sectionsConfig,
};

// Export aggregated components and schemas
export const allComponents = components;
export const allSchemas = schemas;

// Export the aggregated sections as a Theme
export const sections: Theme = {
  id: 'default',
  name: 'Default Theme',
  sections: finalSectionsConfig,
};

// Optionally, export the Theme as the default export
export default sections;

// Export section registry for external access if needed
export { sectionRegistry };
