'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useBuilderState } from '../hooks/useBuilderState';

export interface BuilderContextType {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  logoWidth: number;
  setLogoWidth: (width: number) => void;
  faviconUrl: string;
  setFaviconUrl: (url: string) => void;
  headingColor: string;
  setHeadingColor: (color: string) => void;
  customCSS: string;
  setCustomCSS: (css: string) => void;
}

const BuilderContext = createContext<BuilderContextType>({
  backgroundColor: '#ffffff',
  setBackgroundColor: () => {},
  logoUrl: '',
  setLogoUrl: () => {},
  logoWidth: 90,
  setLogoWidth: () => {},
  faviconUrl: '',
  setFaviconUrl: () => {},
  headingColor: '#1a1a1a',
  setHeadingColor: () => {},
  customCSS: '',
  setCustomCSS: () => {},
});

export function BuilderProvider({ children }: { children: ReactNode }) {
  const builderState = useBuilderState();
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoWidth, setLogoWidth] = useState(90);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [headingColor, setHeadingColor] = useState('#1a1a1a');
  const [customCSS, setCustomCSS] = useState('');

  return (
    <BuilderContext.Provider value={{
      ...builderState,
      backgroundColor,
      setBackgroundColor,
      logoUrl,
      setLogoUrl,
      logoWidth,
      setLogoWidth,
      faviconUrl,
      setFaviconUrl,
      headingColor,
      setHeadingColor,
      customCSS,
      setCustomCSS,
    }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
