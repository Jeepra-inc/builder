// src/components/withSection.tsx
import React from 'react';
import { SectionSchema } from '@/app/builder/types';
import BaseSection from '../sections/BaseSection';
import { BaseComponentProps } from './types';

const withSection = ({
  schema,
  renderContent,
}: {
  schema: SectionSchema;
  renderContent: (resolvedSettings: Record<string, any>) => React.ReactNode;
}) => {
  const Component: React.FC<BaseComponentProps> = ({
    section,
    isEditing,
    isSelected,
    onUpdateSection,
    className,
  }) => {
    return (
      <BaseSection
        schema={schema}
        section={section}
        isEditing={isEditing}
        isSelected={isSelected}
        onUpdateSection={onUpdateSection}
        className={className}
        paddingTop={section.settings.paddingTop}
        paddingBottom={section.settings.paddingBottom}
      >
        {(resolvedSettings) => renderContent(resolvedSettings)}
      </BaseSection>
    );
  };

  Component.displayName = `withSection(${schema.name})`;

  return Component;
};

export default withSection;
