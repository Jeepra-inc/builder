// Media file type checking
export const isImageFile = (file: File | null | undefined): boolean => {
  if (!file || typeof file.type !== "string") return false;
  return file.type.startsWith("image/");
};

export const isVideoFile = (file: File | null | undefined): boolean => {
  if (!file || typeof file.type !== "string") return false;
  return file.type.startsWith("video/");
};

// Format file size for display
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes && bytes !== 0) return "Unknown size";
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Generate a thumbnail URL for a file
// In a real app, this would use server-side image processing
export const generateThumbnailUrl = (
  file: File | null | undefined
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to create thumbnail - no result"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to create thumbnail"));
      };
      reader.readAsDataURL(file);
    } else if (isVideoFile(file)) {
      // For videos, we would normally generate thumbnails server-side
      // This is a placeholder
      resolve("https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b");
    } else {
      reject(new Error("Unsupported file type"));
    }
  });
};

// API client functions for media operations
export const fetchMediaItems = async () => {
  const response = await fetch("/api/media");
  if (!response.ok) {
    throw new Error("Failed to fetch media items");
  }
  const data = await response.json();
  return data.items;
};

export const uploadMediaItem = async (mediaData: {
  title: string;
  src: string;
  type: "photo" | "video";
  date?: string;
}) => {
  const response = await fetch("/api/media", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mediaData),
  });

  if (!response.ok) {
    throw new Error("Failed to upload media item");
  }

  const data = await response.json();
  return data.item;
};

export const deleteMediaItem = async (id: string) => {
  const response = await fetch(`/api/media?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete media item");
  }

  return true;
};

// Determine file category for display and handling
export const getFileCategory = (
  file: File | null | undefined
): "image" | "video" | "audio" | "document" | "other" => {
  if (!file || typeof file.type !== "string") return "other";

  if (file.type.startsWith("image/")) {
    return "image";
  } else if (file.type.startsWith("video/")) {
    return "video";
  } else if (file.type.startsWith("audio/")) {
    return "audio";
  } else if (
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/vnd.ms-excel" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "text/csv"
  ) {
    return "document";
  }

  return "other";
};
