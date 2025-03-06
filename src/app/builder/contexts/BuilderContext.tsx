"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  RefObject,
} from "react";
import { useBuilderState } from "../hooks/useBuilderState";

export interface BuilderContextType {
  contentRef: RefObject<HTMLIFrameElement | null>;
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
  isTopBarVisible: boolean;
  setIsTopBarVisible: (visible: boolean) => void;
  headingFont: string;
  setHeadingFont: (font: string) => void;
  bodyFont: string;
  setBodyFont: (font: string) => void;
  headingSizeScale: number;
  setHeadingSizeScale: (scale: number) => void;
  bodySizeScale: number;
  setBodySizeScale: (scale: number) => void;
}

const BuilderContext = createContext<BuilderContextType>({
  contentRef: { current: null },
  backgroundColor: "#ffffff",
  setBackgroundColor: () => {},
  logoUrl: "",
  setLogoUrl: () => {},
  logoWidth: 90,
  setLogoWidth: () => {},
  faviconUrl: "",
  setFaviconUrl: () => {},
  headingColor: "#1a1a1a",
  setHeadingColor: () => {},
  customCSS: "",
  setCustomCSS: () => {},
  isTopBarVisible: true,
  setIsTopBarVisible: () => {},
  headingFont: "Assistant",
  setHeadingFont: () => {},
  bodyFont: "Assistant",
  setBodyFont: () => {},
  headingSizeScale: 100,
  setHeadingSizeScale: () => {},
  bodySizeScale: 100,
  setBodySizeScale: () => {},
});

export function BuilderProvider({ children }: { children: ReactNode }) {
  const builderState = useBuilderState();
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoWidth, setLogoWidth] = useState(90);
  const [faviconUrl, setFaviconUrl] = useState("");
  const [headingColor, setHeadingColor] = useState("#1a1a1a");
  const [customCSS, setCustomCSS] = useState("");
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [headingFont, setHeadingFont] = useState("Assistant");
  const [bodyFont, setBodyFont] = useState("Assistant");
  const [headingSizeScale, setHeadingSizeScale] = useState(100);
  const [bodySizeScale, setBodySizeScale] = useState(100);
  const contentRef = React.createRef<HTMLIFrameElement>();

  return (
    <BuilderContext.Provider
      value={{
        ...builderState,
        contentRef,
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
        isTopBarVisible,
        setIsTopBarVisible,
        headingFont,
        setHeadingFont,
        bodyFont,
        setBodyFont,
        headingSizeScale,
        setHeadingSizeScale,
        bodySizeScale,
        setBodySizeScale,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }
  return context;
}
