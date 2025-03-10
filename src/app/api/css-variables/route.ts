import { writeFile, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// File path for the main CSS file
const CSS_FILE_PATH = path.join(process.cwd(), "public", "main.css");

// Add cache for last updated time and content hash to prevent excessive file writes
let lastUpdateTime = 0;
let lastContentHash = "";
const UPDATE_COOLDOWN = 5000; // 5 seconds between updates

// Function to generate CSS variables from settings
function generateCSSVariables(settings: any): string {
  // Extract values from settings
  const headerSettings = settings.headerSettings || {};
  const globalStyles = settings.globalStyles || {};
  const typography = globalStyles.typography || {};
  const branding = globalStyles.branding || {};
  const layout = headerSettings.layout || {};

  // Get page width from global layout settings
  const globalLayout = settings.globalLayout || {};
  const pageWidth = globalLayout.pageWidth || "1200px";

  // Only log once per cooldown period
  const now = Date.now();
  if (now - lastUpdateTime > UPDATE_COOLDOWN) {
    console.log("Generating CSS variables with page width:", pageWidth);
  }

  // Create CSS variables string
  return `/* Generated at ${new Date().toISOString()} */
:root {
  /* Global Layout Settings */
  --page-width: ${pageWidth};
  
  /* Layout Settings */
  --header-max-width: ${layout.maxWidth || "1200px"};
  --header-sticky: ${layout.sticky ? "true" : "false"};
  
  /* Header Color Schemes */
  --top-bar-color-scheme: ${headerSettings.topBarColorScheme || "light"};
  --main-bar-color-scheme: ${headerSettings.mainBarColorScheme || "light"};
  --bottom-bar-color-scheme: ${headerSettings.bottomBarColorScheme || "light"};
  
  /* Header Visibility */
  --top-bar-visible: ${headerSettings.topBarVisible ? "true" : "false"};
  --bottom-bar-visible: ${headerSettings.bottomEnabled ? "true" : "false"};
  
  /* Header Heights */
  --top-bar-height: ${headerSettings.topBarHeight || 40}px;
  --main-bar-height: 80px;
  --bottom-bar-height: 50px;
  
  /* Logo Settings */
  --logo-width: ${branding.logoWidth || 90}px;
  
  /* Typography */
  --heading-font: '${typography.headingFont || "Assistant"}', sans-serif;
  --body-font: '${typography.bodyFont || "Assistant"}', sans-serif;
  --heading-size-scale: ${typography.headingSizeScale || 100}%;
  --body-size-scale: ${typography.bodySizeScale || 100}%;
  --heading-color: ${typography.headingColor || "#1a1a1a"};
  
  /* Colors */
  --background-color: ${branding.backgroundColor || "#ffffff"};
  
  /* Added as theme variables that can be referenced in components */
  --theme-primary: #3b82f6;
  --theme-secondary: #6b7280;
  --theme-accent: #f59e0b;
  --theme-background: ${branding.backgroundColor || "#ffffff"};
  --theme-foreground: #111827;
  --theme-muted: #f3f4f6;
  --theme-muted-foreground: #6b7280;
  --theme-border: #e5e7eb;
  --theme-input: #e5e7eb;
  --theme-ring: #3b82f6;
  --theme-radius: 0.5rem;
}
*{
font-family:var(--body-font);
}
/* Helper classes that use CSS variables */
.max-width-container {
  width: 100%;
  max-width: var(--header-max-width);
  margin-left: auto;
  margin-right: auto;
}

.page-container {
  width: 100%;
  max-width: var(--page-width);
  margin-left: auto;
  margin-right: auto;
  transition: max-width 0.3s ease;
}

.header-sticky {
  position: sticky;
  top: 0;
  z-index: 50;
}

.top-bar {
  display: var(--top-bar-visible, flex);
  height: var(--top-bar-height);
}

.bottom-bar {
  display: var(--bottom-bar-visible, flex);
  height: var(--bottom-bar-height);
}

body {
  font-family: var(--body-font);
  background-color: var(--background-color);
  color: var(--theme-foreground);
}

/* Custom container class that respects page width */
.container {
  width: 100%;
  max-width: var(--page-width);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  transition: max-width 0.3s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font);
  color: var(--heading-color);
}`;
}

// Function to update CSS variables in the CSS file
async function updateCSSFile(cssContent: string): Promise<void> {
  try {
    // Create a simple hash of the content to check if it's changed
    const contentHash = Buffer.from(cssContent).toString("base64").slice(0, 20);

    // Check if we're still in the cooldown period or content hasn't changed
    const now = Date.now();
    const isInCooldown = now - lastUpdateTime < UPDATE_COOLDOWN;
    const isSameContent = contentHash === lastContentHash;

    if (isInCooldown) {
      if (isSameContent) {
        // Skip update - both in cooldown period and content is the same
        console.log("Skipping CSS update - in cooldown period and no changes");
        return;
      } else {
        // In cooldown but content changed - log but still skip
        console.log(
          "Skipping CSS update - in cooldown period (but changes detected)"
        );
        return;
      }
    }

    // If we get here, we're either past cooldown or content has changed or both

    if (isSameContent) {
      // Past cooldown but no changes
      console.log("Skipping CSS update - no changes detected");
      return;
    }

    // Update our tracking variables
    lastContentHash = contentHash;
    lastUpdateTime = now;

    // Write the file with the new content
    await writeFile(CSS_FILE_PATH, cssContent, "utf-8");
    console.log("CSS variables updated successfully");
  } catch (error) {
    console.error("Error updating CSS variables:", error);
    throw error;
  }
}

// POST handler to update CSS variables
export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    // Generate CSS variables based on settings
    const cssContent = generateCSSVariables(settings);

    // Update the CSS file
    await updateCSSFile(cssContent);

    // Always return success even if we skipped the update
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating CSS variables:", error);
    return NextResponse.json(
      {
        error: "Failed to update CSS variables",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
