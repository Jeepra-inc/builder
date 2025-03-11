import React from "react";

// Define our built-in color schemes
export const BUILT_IN_SCHEMES = {
  light: {
    top: {
      background: "#f7fafc",
      text: "#4a5568",
    },
    main: {
      background: "#ffffff",
      text: "#1a202c",
    },
    bottom: {
      background: "#f9fafb",
      text: "#4a5568",
      border: "#e2e8f0",
    },
  },
  dark: {
    top: {
      background: "#2d3748",
      text: "#e2e8f0",
    },
    main: {
      background: "#1a202c",
      text: "#f7fafc",
    },
    bottom: {
      background: "#2d3748",
      text: "#e2e8f0",
      border: "#4a5568",
    },
  },
};

export type SectionStyles = {
  background: React.CSSProperties;
  text: React.CSSProperties;
};

export const getColorSchemeStyles = (
  colorScheme: string = "light"
): SectionStyles => {
  const styles: SectionStyles = {
    background: {},
    text: {},
  };

  switch (colorScheme) {
    case "dark":
      styles.background = { backgroundColor: "#1f2937" };
      styles.text = { color: "#f9fafb" };
      break;
    case "blue":
      styles.background = { backgroundColor: "#1e40af" };
      styles.text = { color: "#ffffff" };
      break;
    case "red":
      styles.background = { backgroundColor: "#b91c1c" };
      styles.text = { color: "#ffffff" };
      break;
    case "green":
      styles.background = { backgroundColor: "#047857" };
      styles.text = { color: "#ffffff" };
      break;
    case "purple":
      styles.background = { backgroundColor: "#6d28d9" };
      styles.text = { color: "#ffffff" };
      break;
    case "orange":
      styles.background = { backgroundColor: "#c2410c" };
      styles.text = { color: "#ffffff" };
      break;
    case "gray":
      styles.background = { backgroundColor: "#4b5563" };
      styles.text = { color: "#ffffff" };
      break;
    case "transparent":
      styles.background = { backgroundColor: "transparent" };
      styles.text = { color: "#1f2937" };
      break;
    case "light":
    default:
      styles.background = { backgroundColor: "#ffffff" };
      styles.text = { color: "#1f2937" };
      break;
  }

  return styles;
};

// Get appropriate styles for a section based on its color scheme
export const getSectionStyle = (
  section: "top" | "main" | "bottom",
  schemeId?: string
): React.CSSProperties => {
  // Handle undefined, light and dark schemes
  if (!schemeId || schemeId === "light" || schemeId === "dark") {
    const theme =
      BUILT_IN_SCHEMES[schemeId as "light" | "dark"] || BUILT_IN_SCHEMES.light;

    if (section === "top") {
      return {
        backgroundColor: theme.top.background,
        color: theme.top.text,
      };
    } else if (section === "main") {
      return {
        backgroundColor: theme.main.background,
        color: theme.main.text,
      };
    } else {
      return {
        backgroundColor: theme.bottom.background,
        color: theme.bottom.text,
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: theme.bottom.border,
      };
    }
  }

  // Handle custom color schemes
  switch (schemeId) {
    case "blue":
      return {
        backgroundColor:
          section === "top"
            ? "#1e40af"
            : section === "main"
            ? "#2563eb"
            : "#3b82f6",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#60a5fa",
            }
          : {}),
      };
    case "red":
      return {
        backgroundColor:
          section === "top"
            ? "#b91c1c"
            : section === "main"
            ? "#dc2626"
            : "#ef4444",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#f87171",
            }
          : {}),
      };
    case "green":
      return {
        backgroundColor:
          section === "top"
            ? "#047857"
            : section === "main"
            ? "#059669"
            : "#10b981",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#34d399",
            }
          : {}),
      };
    case "purple":
      return {
        backgroundColor:
          section === "top"
            ? "#6d28d9"
            : section === "main"
            ? "#7c3aed"
            : "#8b5cf6",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#a78bfa",
            }
          : {}),
      };
    case "orange":
      return {
        backgroundColor:
          section === "top"
            ? "#c2410c"
            : section === "main"
            ? "#ea580c"
            : "#f97316",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#fb923c",
            }
          : {}),
      };
    case "gray":
      return {
        backgroundColor:
          section === "top"
            ? "#4b5563"
            : section === "main"
            ? "#6b7280"
            : "#9ca3af",
        color: "#ffffff",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#d1d5db",
            }
          : {}),
      };
    case "transparent":
      return {
        backgroundColor: "transparent",
        color: "#1f2937",
        ...(section === "bottom"
          ? {
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "#e5e7eb",
            }
          : {}),
      };
    default:
      // Default to light theme
      return getSectionStyle(section, "light");
  }
};
