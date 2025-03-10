"use client";

import {
  XMarkIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { formatFileSize } from "../lib/mediaUtils";

interface MediaDetailProps {
  media: {
    id: string;
    title: string;
    src: string;
    type: "photo" | "video" | "audio" | "document";
    date: string;
    description?: string;
    altTag?: string;
  };
  onClose: () => void;
}

export default function MediaDetail({ media, onClose }: MediaDetailProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (media.type === "photo") {
      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        setIsLoading(false);
      };
      img.src = media.src;
    } else {
      setIsLoading(false);
    }
  }, [media]);

  // For demonstration purposes - in a real app, you'd fetch this from the server
  const fileSize = "2.4 MB";
  const fileType =
    media.type === "photo"
      ? "image/jpeg"
      : media.type === "video"
      ? "video/mp4"
      : media.type === "audio"
      ? "audio/mpeg"
      : "application/pdf";
  const uploadedBy = "Admin User";
  const description = media.description || "No description available";
  const altTag =
    media.altTag || (media.type === "photo" ? "No alt text available" : "");

  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 md:p-8">
      <div className="absolute top-4 right-4 flex space-x-4">
        <button
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          title="Download"
        >
          <ArrowDownTrayIcon className="w-6 h-6" />
        </button>
        <button
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          title="Edit"
        >
          <PencilIcon className="w-6 h-6" />
        </button>
        <button
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          title="Delete"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          title="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full max-h-full w-full max-w-6xl">
        {/* Media preview section */}
        <div className="flex-grow flex items-center justify-center bg-black bg-opacity-50 rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
          {(() => {
            if (isLoading) {
              return (
                <div className="animate-pulse w-20 h-20 rounded-full bg-gray-300"></div>
              );
            }

            switch (media.type) {
              case "photo":
                return (
                  <img
                    src={media.src}
                    alt={media.title}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                );
              case "video":
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <video
                      src={media.src}
                      controls
                      className="max-w-full max-h-[70vh]"
                      poster="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                );
              case "audio":
                return (
                  <div className="w-full flex flex-col items-center justify-center p-8">
                    <MusicalNoteIcon className="w-24 h-24 text-gray-400 mb-4" />
                    <audio controls src={media.src} className="w-full max-w-md">
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                );
              case "document":
                return (
                  <div className="w-full flex flex-col items-center justify-center p-8">
                    <DocumentTextIcon className="w-24 h-24 text-gray-400 mb-4" />
                    <p className="text-white text-center">
                      <a
                        href={media.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center mt-4"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                        Open Document
                      </a>
                    </p>
                  </div>
                );
              default:
                return <div className="text-white">Unsupported media type</div>;
            }
          })()}
        </div>

        {/* Details sidebar */}
        <div className="w-full md:w-80 bg-white p-6 rounded-b-lg md:rounded-r-lg md:rounded-bl-none overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 truncate" title={media.title}>
            {media.title}
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Uploaded on
              </h3>
              <p>{media.date}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Uploaded by
              </h3>
              <p>{uploadedBy}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                File type
              </h3>
              <p>{fileType}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                File size
              </h3>
              <p>{fileSize}</p>
            </div>

            {media.type === "photo" && dimensions.width > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Dimensions
                </h3>
                <p>
                  {dimensions.width} × {dimensions.height} pixels
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <p>{description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Alt Tag
              </h3>
              <p>{altTag}</p>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center">
                  <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                  Download
                </button>
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm flex items-center">
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-md text-sm flex items-center">
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
