"use client";

import React, { useEffect, useState } from "react";
import "./styles/topBar.css"; // Import top bar styles

export default function BuilderContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Add the CSS files to the iframe
    const mainCssLink = document.createElement("link");
    mainCssLink.rel = "stylesheet";
    mainCssLink.href = "/main.css";
    document.head.appendChild(mainCssLink);

    // Create and append style element for top bar styles
    const styleElement = document.createElement("style");
    styleElement.id = "top-bar-styles";
    styleElement.textContent = `
      .top-bar {
        display: var(--top-bar-visible, flex);
        height: var(--top-bar-height, 40px) !important;
        min-height: var(--top-bar-height, 40px) !important;
      }
      
      [data-section="top"] {
        height: var(--top-bar-height, 40px) !important;
        min-height: var(--top-bar-height, 40px) !important;
        display: var(--top-bar-visible, flex);
      }
    `;
    document.head.appendChild(styleElement);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}
