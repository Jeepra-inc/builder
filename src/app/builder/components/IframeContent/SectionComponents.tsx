// src/app/builder/components/SectionComponents.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { sections } from '@/app/builder/elements/sections';

// Example: build a map of dynamic components
export const SectionComponents = Object.keys(sections.sections).reduce(
  (acc, sectionType) => {
    acc[sectionType] = dynamic(() =>
      import(`@/sections/${sectionType}`)
        .then((m) => {
          // Prefer default export, fallback to first exported component
          const Component = m.default || 
            Object.values(m).find(
              (exported) => typeof exported === 'function'
            );

          if (!Component) {
            console.error(
              `No component found for section ${sectionType}`
            );
            // Return a simple React component so TS knows this is valid JSX
            return () => <div>Error: Component not found</div>;
          }
          return Component;
        })
        .catch((error) => {
          console.error(`Failed to load section component for ${sectionType}:`, error);
          // Return a simple React component so TS knows this is valid JSX
          return () => <div>Error loading section</div>;
        })
    );
    return acc;
  },
  {} as Record<string, React.ComponentType<any>>
);

export default SectionComponents;
