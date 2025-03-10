"use client";

import React, { useEffect, useState } from "react";

export default function BuilderContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Add the CSS file to the iframe
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "/main.css";
    document.head.appendChild(linkElement);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}
