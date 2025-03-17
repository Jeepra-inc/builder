import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define types for settings structure
interface HeaderSettings {
  topBarVisible?: boolean;
  topBarHeight?: number;
  topBarNavStyle?: string;
  topBarTextTransform?: string;
  topBarFontSizeScale?: number;
  topBarColorScheme?: string;
  [key: string]: any;
}

interface Settings {
  headerSettings?: HeaderSettings;
  [key: string]: any;
}

// Path to settings file
const settingsPath = path.join(process.cwd(), "public", "settings.json");

// GET handler for fetching settings
export async function GET() {
  try {
    // Check if settings file exists
    if (!fs.existsSync(settingsPath)) {
      return NextResponse.json(
        { error: "Settings file not found" },
        { status: 404 }
      );
    }

    // Read settings file
    const settingsData = fs.readFileSync(settingsPath, "utf-8");
    const settings = JSON.parse(settingsData);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error reading settings file:", error);
    return NextResponse.json(
      { error: "Failed to read settings" },
      { status: 500 }
    );
  }
}

// POST handler for updating settings
export async function POST(request: Request) {
  try {
    // Parse the request body
    const updatedSettings = (await request.json()) as Settings;

    // Debug logs
    console.log("API - POST request received:", {
      hasHeaderSettings: !!updatedSettings.headerSettings,
      topBarVisible: updatedSettings.headerSettings?.topBarVisible,
      topBarVisibleType: typeof updatedSettings.headerSettings?.topBarVisible,
      topBarHeight: updatedSettings.headerSettings?.topBarHeight,
      topBarHeightType: typeof updatedSettings.headerSettings?.topBarHeight,
      topBarNavStyle: updatedSettings.headerSettings?.topBarNavStyle,
      topBarTextTransform: updatedSettings.headerSettings?.topBarTextTransform,
      topBarColorScheme: updatedSettings.headerSettings?.topBarColorScheme,
      topBarFontSizeScale: updatedSettings.headerSettings?.topBarFontSizeScale,
    });

    // Validate settings object
    if (!updatedSettings) {
      return NextResponse.json(
        { error: "Invalid settings data" },
        { status: 400 }
      );
    }

    // Read current settings to merge with updates
    let currentSettings: Settings = {};
    if (fs.existsSync(settingsPath)) {
      try {
        const currentData = fs.readFileSync(settingsPath, "utf-8");
        currentSettings = JSON.parse(currentData) as Settings;
        console.log("API - Current settings read:", {
          hasHeaderSettings: !!currentSettings.headerSettings,
          topBarVisible: currentSettings.headerSettings?.topBarVisible,
          topBarHeight: currentSettings.headerSettings?.topBarHeight,
          topBarNavStyle: currentSettings.headerSettings?.topBarNavStyle,
          topBarTextTransform:
            currentSettings.headerSettings?.topBarTextTransform,
          topBarFontSizeScale:
            currentSettings.headerSettings?.topBarFontSizeScale,
        });
      } catch (err) {
        console.error("API - Error reading current settings:", err);
      }
    }

    // Ensure we properly handle topBarVisible as a boolean and topBarHeight as a number
    if (updatedSettings.headerSettings) {
      if ("topBarVisible" in updatedSettings.headerSettings) {
        updatedSettings.headerSettings.topBarVisible =
          updatedSettings.headerSettings.topBarVisible === true;
        console.log(
          "API - Normalized topBarVisible:",
          updatedSettings.headerSettings.topBarVisible
        );
      }

      if ("topBarHeight" in updatedSettings.headerSettings) {
        const rawHeight = updatedSettings.headerSettings.topBarHeight;
        updatedSettings.headerSettings.topBarHeight = Number(rawHeight || 40);
        console.log(
          "API - Normalized topBarHeight:",
          updatedSettings.headerSettings.topBarHeight
        );
      }

      if ("topBarNavStyle" in updatedSettings.headerSettings) {
        const navStyle = updatedSettings.headerSettings.topBarNavStyle;
        updatedSettings.headerSettings.topBarNavStyle = String(
          navStyle || "style1"
        );
        console.log(
          "API - Normalized topBarNavStyle:",
          updatedSettings.headerSettings.topBarNavStyle
        );
      }

      if ("topBarTextTransform" in updatedSettings.headerSettings) {
        const textTransform =
          updatedSettings.headerSettings.topBarTextTransform;
        updatedSettings.headerSettings.topBarTextTransform = String(
          textTransform || "capitalize"
        );
        console.log(
          "API - Normalized topBarTextTransform:",
          updatedSettings.headerSettings.topBarTextTransform
        );
      }

      if ("topBarFontSizeScale" in updatedSettings.headerSettings) {
        const fontSizeScale =
          updatedSettings.headerSettings.topBarFontSizeScale;
        updatedSettings.headerSettings.topBarFontSizeScale = Number(
          fontSizeScale || 1
        );
        console.log(
          "API - Normalized topBarFontSizeScale:",
          updatedSettings.headerSettings.topBarFontSizeScale
        );
      }

      if ("topBarColorScheme" in updatedSettings.headerSettings) {
        const colorScheme = updatedSettings.headerSettings.topBarColorScheme;
        updatedSettings.headerSettings.topBarColorScheme = String(
          colorScheme || "light"
        );
        console.log(
          "API - Normalized topBarColorScheme:",
          updatedSettings.headerSettings.topBarColorScheme
        );
      }
    }

    // Merge settings
    const finalSettings: Settings = {
      ...currentSettings,
      ...updatedSettings,
      headerSettings: {
        ...(currentSettings.headerSettings || {}),
        ...(updatedSettings.headerSettings || {}),
      },
    };

    console.log("API - Final settings to write:", {
      hasHeaderSettings: !!finalSettings.headerSettings,
      topBarVisible: finalSettings.headerSettings?.topBarVisible,
      topBarVisibleType: typeof finalSettings.headerSettings?.topBarVisible,
      topBarHeight: finalSettings.headerSettings?.topBarHeight,
      topBarHeightType: typeof finalSettings.headerSettings?.topBarHeight,
      topBarNavStyle: finalSettings.headerSettings?.topBarNavStyle,
      topBarTextTransform: finalSettings.headerSettings?.topBarTextTransform,
      topBarColorScheme: finalSettings.headerSettings?.topBarColorScheme,
      topBarFontSizeScale: finalSettings.headerSettings?.topBarFontSizeScale,
    });

    // Ensure directory exists
    const dir = path.dirname(settingsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write updated settings to file
    fs.writeFileSync(
      settingsPath,
      JSON.stringify(finalSettings, null, 2),
      "utf-8"
    );

    console.log("API - Settings file written successfully");

    return NextResponse.json({
      success: true,
      debugInfo: {
        topBarVisible: finalSettings.headerSettings?.topBarVisible,
        topBarHeight: finalSettings.headerSettings?.topBarHeight,
        topBarNavStyle: finalSettings.headerSettings?.topBarNavStyle,
        topBarTextTransform: finalSettings.headerSettings?.topBarTextTransform,
        topBarColorScheme: finalSettings.headerSettings?.topBarColorScheme,
        topBarFontSizeScale: finalSettings.headerSettings?.topBarFontSizeScale,
      },
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
