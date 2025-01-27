// src/sections/Heronew/Heronew-component.tsx
import { FC } from 'react';
import clsx from 'clsx';
import { SectionSchema, SectionType } from '@/app/builder/types';
import withSection from '../withSection';

interface HeronewComponentType extends FC<any> {
  schema?: SectionSchema;
}

export const HeronewSchema: SectionSchema = {
  name: 'Heronew',
  type: SectionType.Heronew,
  schema: [
    {
      id: 'title',
      type: 'text',
      label: 'Title',
      default: 'Your Heronew Title',
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'Description',
      default: 'Add your Heronew description here',
    },
  ],
  settings: [
    {
      id: 'textAlignment',
      type: 'select',
      label: 'Text Alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
    },
    {
      id: 'backgroundColor',
      type: 'color',
      label: 'Background Color',
      default: '#f0f0f0',
    },
    {
      id: 'textColor',
      type: 'color',
      label: 'Text Color',
      default: '#000000',
    },
    {
      id: 'buttonText',
      type: 'text',
      label: 'Button Text',
      default: 'Learn More',
    },
    {
      id: 'buttonLink',
      type: 'text',
      label: 'Button Link',
      default: '#',
    },
    {
      id: 'buttonStyle',
      type: 'select',
      label: 'Button Style',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
      ],
      default: 'primary',
    },
  ],
};

/**
 * HeronewComponent renders a customizable Heronew section based on the provided schema and settings.
 */
const HeronewComponent: HeronewComponentType = withSection({
  schema: HeronewSchema,
  renderContent: (settings) => {

    return (
      <div
        className={clsx(
          'max-w-4xl mx-auto pt-[30px]',
          {
            'text-left': settings.textAlignment === 'left',
            'text-center': settings.textAlignment === 'center',
            'text-right': settings.textAlignment === 'right',
          }
        )}
        style={{ backgroundColor: settings.backgroundColor }}
      >
        {settings.title && (
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: settings.textColor }}
          >
            {settings.title}
          </h1>
        )}
        {settings.description && (
          <p
            className="text-lg mb-6"
            style={{ color: settings.textColor }}
          >
            {settings.description}
          </p>
        )}
        {settings.buttonText && (
          <a
            href={settings.buttonLink}
            className={clsx(
              'inline-block px-6 py-2 rounded transition-colors duration-300',
              {
                'bg-blue-500 text-white hover:bg-blue-600':
                  settings.buttonStyle === 'primary',
                'bg-gray-500 text-white hover:bg-gray-600':
                  settings.buttonStyle === 'secondary',
                'border border-blue-500 text-blue-500 hover:bg-blue-50':
                  settings.buttonStyle === 'outline',
              }
            )}
          >
            {settings.buttonText}
          </a>
        )}
      </div>
    );
  },
});

// Attach the schema to the component for builder integration
HeronewComponent.schema = HeronewSchema;
export { HeronewComponent };
