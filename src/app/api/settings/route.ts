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
  topBarNavSpacing?: number;
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
      } catch (err) {
        console.error("API - Error reading current settings:", err);
      }
    }

    // Ensure we properly handle topBarVisible as a boolean and topBarHeight as a number
    if (updatedSettings.headerSettings) {
      if ("topBarVisible" in updatedSettings.headerSettings) {
        updatedSettings.headerSettings.topBarVisible =
          updatedSettings.headerSettings.topBarVisible === true;
      }

      if ("topBarHeight" in updatedSettings.headerSettings) {
        const rawHeight = updatedSettings.headerSettings.topBarHeight;
        updatedSettings.headerSettings.topBarHeight = Number(rawHeight || 40);
      }

      if ("topBarNavStyle" in updatedSettings.headerSettings) {
        const navStyle = updatedSettings.headerSettings.topBarNavStyle;
        updatedSettings.headerSettings.topBarNavStyle = String(
          navStyle || "style1"
        );
      }

      if ("topBarTextTransform" in updatedSettings.headerSettings) {
        const textTransform =
          updatedSettings.headerSettings.topBarTextTransform;
        updatedSettings.headerSettings.topBarTextTransform = String(
          textTransform || "capitalize"
        );
      }

      if ("topBarFontSizeScale" in updatedSettings.headerSettings) {
        const fontSizeScale =
          updatedSettings.headerSettings.topBarFontSizeScale;
        updatedSettings.headerSettings.topBarFontSizeScale = Number(
          fontSizeScale || 1
        );
      }

      if ("topBarColorScheme" in updatedSettings.headerSettings) {
        const colorScheme = updatedSettings.headerSettings.topBarColorScheme;
        // Validate color scheme - ensure it's a valid string
        const validColorScheme =
          typeof colorScheme === "string" && colorScheme.trim()
            ? colorScheme
            : "light";

        updatedSettings.headerSettings.topBarColorScheme = validColorScheme;
      } else {
        return;
      }

      if ("topBarNavSpacing" in updatedSettings.headerSettings) {
        const navSpacing = updatedSettings.headerSettings.topBarNavSpacing;
        // Convert to number with default of 24
        updatedSettings.headerSettings.topBarNavSpacing = Number(
          navSpacing || 24
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

    return NextResponse.json({
      success: true,
      debugInfo: {
        topBarVisible: finalSettings.headerSettings?.topBarVisible,
        topBarHeight: finalSettings.headerSettings?.topBarHeight,
        topBarNavStyle: finalSettings.headerSettings?.topBarNavStyle,
        topBarTextTransform: finalSettings.headerSettings?.topBarTextTransform,
        topBarColorScheme: finalSettings.headerSettings?.topBarColorScheme,
        topBarFontSizeScale: finalSettings.headerSettings?.topBarFontSizeScale,
        topBarNavSpacing: finalSettings.headerSettings?.topBarNavSpacing,
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
