import { writeFile, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// File path for the settings JSON file
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'public', 'settings.json');

// Check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// GET handler to read settings from the file
export async function GET() {
  try {
    // Check if the file exists first
    const exists = await fileExists(SETTINGS_FILE_PATH);
    
    if (!exists) {
      // If the file doesn't exist, return an empty object
      // This prevents errors on first load
      return NextResponse.json({});
    }
    
    const fileContent = await readFile(SETTINGS_FILE_PATH, 'utf-8');
    const settings = JSON.parse(fileContent);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings file:', error);
    // Return empty object instead of error to avoid disrupting the UI
    return NextResponse.json({});
  }
}

// POST handler to save settings to the file
export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Create the directory if it doesn't exist
    const dirPath = path.dirname(SETTINGS_FILE_PATH);
    
    // Save settings to a JSON file in the public directory
    await writeFile(
      SETTINGS_FILE_PATH,
      JSON.stringify(settings, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings file:', error);
    return NextResponse.json(
      { error: 'Failed to save settings file', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
