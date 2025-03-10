import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { ImageUpload } from "./ImageUpload";

// Dynamically import the MediaApp component to avoid any potential issues
const MediaApp = dynamic(
  () =>
    import("@/app/media/components/MediaAppSelector").then(
      (mod) => mod.MediaApp
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        Loading media library...
      </div>
    ),
  }
);

interface MediaSelectorProps {
  onSelect: (imageUrl: string) => void;
  id?: string;
  buttonLabel?: string;
  selectedImage?: string;
  className?: string;
  showUploadOption?: boolean;
  uploadButtonLabel?: string;
  uploadButtonId?: string;
  height?: string;
}

export function MediaSelector({
  onSelect,
  id,
  buttonLabel = "Select from Media Library",
  selectedImage,
  className = "",
  showUploadOption = false,
  uploadButtonLabel = "Upload from Device",
  uploadButtonId = "media-upload",
  height,
}: MediaSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelectImage = (imageUrl: string) => {
    onSelect(imageUrl);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload from device button and hidden upload component */}
      {showUploadOption && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(uploadButtonId)?.click()}
            className="gap-2 text-sm"
          >
            <Upload className="h-4 w-4" />
            {uploadButtonLabel}
          </Button>
          <ImageUpload id={uploadButtonId} onImageUpload={onSelect} />
        </>
      )}

      {/* Media library selection button */}
      <div
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 border-[0.5px] justify-center cursor-pointer bg-zinc-50 border-dashed border-width-xs border-zinc-500 rounded-md text-sm ${className} ${
          height || ""
        }`}
        id={id}
      >
        <Image className="h-4 w-4" />
        {buttonLabel}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-full h-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <MediaApp
              mode="select"
              onSelectMedia={handleSelectImage}
              selectedMediaUrl={selectedImage}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
