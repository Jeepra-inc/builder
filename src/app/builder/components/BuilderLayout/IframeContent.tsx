"use client";
import React from "react";
import { IframeContentProps } from "@/app/builder/types";

export function IframeContent({
  isDragging,
  viewportSize,
  iframeRef,
}: IframeContentProps) {
  const getDimensions = () => {
    switch (viewportSize) {
      case "mobile":
        return { width: "375px", height: "667px" };
      case "tablet":
        return { width: "768px", height: "1024px" };
      case "fullscreen":
        return { width: "100%", height: "100%" };
      case "desktop":
      default:
        return { width: "100%", height: "100%" };
    }
  };

  const dims = getDimensions();

  return (
    <div className="absolute inset-0 flex justify-center items-center p-2">
      <div
        className="w-full h-full rounded-md shadow-sm border overflow-hidden flex justify-center items-center transition-all duration-300 ease-in-out"
        style={{
          transform: isDragging ? "scale(0.9)" : "scale(1)",
          transformOrigin: "center",
          width: dims.width,
          height: dims.height,
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      >
        <iframe
          ref={iframeRef}
          src="/builder/iframe"
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
