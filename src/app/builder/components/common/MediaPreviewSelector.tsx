import React from "react";
import { X } from "lucide-react";
import { MediaSelector } from "./MediaSelector";

interface MediaPreviewSelectorProps {
  imageUrl?: string;
  onImageSelect: (url: string) => void;
  onImageRemove?: () => void;
  height?: string;
  width?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  altText?: string;
  placeholder?: {
    text?: string;
    icon?: React.ReactNode;
  };
  showUploadFromDevice?: boolean;
  uploadButtonId?: string;
  mediaLibraryLabel?: string;
  uploadButtonLabel?: string;
  className?: string;
}

export function MediaPreviewSelector({
  imageUrl,
  onImageSelect,
  onImageRemove,
  height = "h-[100px]",
  width = "w-full",
  objectFit = "contain",
  altText = "Image",
  mediaLibraryLabel = "Select from Media Library",
  className = "",
}: MediaPreviewSelectorProps) {
  return (
    <div className={`${className}`}>
      {imageUrl ? (
        // Image Preview Mode
        <div
          className={`relative ${width} ${height} flex items-center justify-center border rounded-md overflow-hidden`}
        >
          <img
            src={imageUrl}
            alt={altText}
            className={`h-full w-full ${objectFit}`}
          />
          {onImageRemove && (
            <button
              onClick={onImageRemove}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        // Selection Mode
        <MediaSelector
          onSelect={onImageSelect}
          buttonLabel={mediaLibraryLabel}
          selectedImage={imageUrl}
          className={width}
          height={height}
        />
      )}
    </div>
  );
}
