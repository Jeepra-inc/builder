import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

// Path to the settings file
const SETTINGS_FILE_PATH = path.join(process.cwd(), "public", "settings.json");

// Add cache for color schemes to prevent excessive file reads
let cachedSchemes: Record<
  string,
  { backgroundColor: string; color: string; borderColor?: string }
> | null = null;
let lastUpdateTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function getColorSchemes(): Promise<
  Record<
    string,
    { backgroundColor: string; color: string; borderColor?: string }
  >
> {
  try {
    // Check if we have a valid cache
    const now = Date.now();
    if (cachedSchemes && now - lastUpdateTime < CACHE_TTL) {
      console.log("Using cached color schemes");
      return cachedSchemes;
    }

    // Read and parse the settings file
    const fileContents = await readFile(SETTINGS_FILE_PATH, "utf-8");
    const settings = JSON.parse(fileContents);

    // Extract color schemes - adapt this based on your actual settings structure
    let schemes: any[] = [];

    // Check different possible locations for color schemes in the settings
    // First look in globalStyles which seems to be where they're defined based on the snippet
    if (
      settings.globalStyles?.colorSchemes &&
      Array.isArray(settings.globalStyles.colorSchemes)
    ) {
      schemes = settings.globalStyles.colorSchemes;
    }
    // Also check if there are themes in globalStyles
    else if (
      settings.globalStyles?.themes &&
      Array.isArray(settings.globalStyles.themes)
    ) {
      schemes = settings.globalStyles.themes;
    }
    // Check top-level locations
    else if (settings.colorSchemes && Array.isArray(settings.colorSchemes)) {
      schemes = settings.colorSchemes;
    } else if (settings.themes && Array.isArray(settings.themes)) {
      schemes = settings.themes;
    } else {
      // Default fallback schemes
      schemes = [
        {
          id: "light",
          name: "Light",
          background: "#ffffff",
          text: "#333333",
          border: "#e5e5e5",
        },
        {
          id: "dark",
          name: "Dark",
          background: "#1a1a1a",
          text: "#ffffff",
          border: "#444444",
        },
        {
          id: "scheme-1",
          name: "Scheme 1",
          background: "#f8f9fa",
          text: "#212529",
          border: "#dee2e6",
        },
        {
          id: "scheme-2",
          name: "Scheme 2",
          background: "#212529",
          text: "#f8f9fa",
          border: "#495057",
        },
      ];
    }

    // Convert schemes to a format our code expects - mapping id to backgroundColor/color/borderColor
    const formattedSchemes: Record<
      string,
      { backgroundColor: string; color: string; borderColor?: string }
    > = {};

    schemes.forEach((scheme) => {
      if (scheme && scheme.id) {
        formattedSchemes[scheme.id] = {
          backgroundColor: scheme.background || "#ffffff",
          color: scheme.text || "#333333",
          borderColor: scheme.border || scheme.outlineButton || "#e5e5e5",
        };
      }
    });

    // Include fallbacks for common schemes if not already present
    if (!formattedSchemes["light"]) {
      formattedSchemes["light"] = {
        backgroundColor: "#ffffff",
        color: "#333333",
        borderColor: "#e5e5e5",
      };
    }

    if (!formattedSchemes["dark"]) {
      formattedSchemes["dark"] = {
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        borderColor: "#444444",
      };
    }

    // Update the cache with the formatted schemes
    cachedSchemes = formattedSchemes;
    lastUpdateTime = now;

    console.log(
      `Retrieved ${
        Object.keys(formattedSchemes).length
      } color schemes from settings.json`
    );
    return formattedSchemes;
  } catch (error) {
    console.error("Error reading color schemes:", error);

    // Return default schemes in case of error
    return {
      light: {
        backgroundColor: "#ffffff",
        color: "#333333",
        borderColor: "#e5e5e5",
      },
      dark: {
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        borderColor: "#444444",
      },
    };
  }
}

export async function GET() {
  try {
    // Get color schemes
    const schemes = await getColorSchemes();

    // Return the schemes
    return NextResponse.json({ success: true, schemes });
  } catch (error) {
    console.error("Error in color schemes API:", error);
    return NextResponse.json(
      {
        error: "Failed to get color schemes",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
