import React from 'react';
import { SectionComponentProps } from '@/app/builder/types';
import ComponentOutline from './ComponentOutline';

export const SectionWrapper: React.FC<SectionComponentProps & { 
  children: React.ReactNode,
  renderEditButton?: () => React.ReactNode,
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({
  children,
  section,
  isEditing,
  isSelected,
  onUpdateSection,
  renderEditButton,
  className,
  onMouseEnter,
  onMouseLeave,
  ...otherProps
}) => {
  // Filter out non-DOM props
  const domProps = { ...otherProps };

  return (
    <>
      <div 
        data-section-type={section.type}
        className={`relative ${className || ''}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...domProps}
      >
        {isEditing && renderEditButton && (
          <div className="absolute right-2 top-2 z-10">
            {renderEditButton()}
          </div>
        )}
        {children}
        {isEditing && <ComponentOutline />}
      </div>
    </>
  );
};

export default SectionWrapper;
