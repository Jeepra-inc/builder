import React from 'react';
import clsx from 'clsx';
import SectionWrapper from '@/app/builder/components/IframeContent/SectionWrapper';
import { useResolvedSettings } from './hooks/useResolvedSettings';
import { BaseSectionProps } from './types';

/**
 * BaseSection handles the common logic and layout for all section components.
 */
const BaseSection: React.FC<BaseSectionProps> = ({
  schema,
  section,
  isEditing,
  isSelected,
  onUpdateSection,
  className,
  children,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
}) => {
  // Resolve settings using the custom hook
  const resolvedSettings = useResolvedSettings(schema, section.settings ?? {});

  return (
    <SectionWrapper
      section={section}
      isEditing={isEditing}
      isSelected={isSelected}
      className={className}
    >
      {/* Apply common classes and styles */}
      <section
        className={clsx(
          'rounded-lg',
          className,
          {
            'text-left': resolvedSettings.textAlignment === 'left',
            'text-center': resolvedSettings.textAlignment === 'center',
            'text-right': resolvedSettings.textAlignment === 'right',
          }
        )}
        style={{
          backgroundColor: resolvedSettings.backgroundColor,
          color: resolvedSettings.textColor,
          paddingTop: paddingTop ? `${paddingTop}px` : undefined,
          paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
          paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
          paddingRight: paddingRight ? `${paddingRight}px` : undefined,
        }}
      >
        {/* Render children with resolved settings */}
        {children(resolvedSettings)}
      </section>
    </SectionWrapper>
  );
};

export default BaseSection;
