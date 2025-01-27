// src/components/SchemaContext.tsx
import React, { createContext, useContext } from 'react';
import { SectionSchema } from '@/app/builder/types';
import { SchemaProviderProps } from './types';

const SchemaContext = createContext<SectionSchema | undefined>(undefined);

export const useSchema = () => {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
};

export const SchemaProvider: React.FC<SchemaProviderProps> = ({ schema, children }) => {
  return <SchemaContext.Provider value={schema}>{children}</SchemaContext.Provider>;
};
