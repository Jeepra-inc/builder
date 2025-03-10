import { NextRequest, NextResponse } from "next/server";

// This is a simple in-memory storage for demo purposes
// In a real application, you would use a database
let mediaItems = [
  {
    id: "1",
    title: "Mountain Landscape",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    type: "photo",
    date: "2023-06-15",
  },
  {
    id: "2",
    title: "Beach Sunset",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    type: "photo",
    date: "2023-07-22",
  },
  {
    id: "3",
    title: "City Timelapse",
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    type: "video",
    date: "2023-08-05",
  },
];

export async function GET() {
  return NextResponse.json({ items: mediaItems });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Simple validation
    if (!data.title || !data.src || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: data.title,
      src: data.src,
      type: data.type,
      date: data.date || new Date().toISOString().split("T")[0],
    };

    mediaItems.push(newItem);
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing ID parameter" },
        { status: 400 }
      );
    }

    const initialLength = mediaItems.length;
    mediaItems = mediaItems.filter((item) => item.id !== id);

    if (mediaItems.length === initialLength) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
