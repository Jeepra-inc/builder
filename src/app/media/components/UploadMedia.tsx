"use client";

import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import {
  isImageFile,
  isVideoFile,
  formatFileSize,
  getFileCategory,
} from "../lib/mediaUtils";

interface UploadMediaProps {
  onUpload: (files: File[]) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface FileWithProgress extends File {
  id: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function UploadMedia({
  onUpload,
  onCancel,
  isOpen,
}: UploadMediaProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const fileArray = Array.from(e.target.files).map((file) => ({
          ...file,
          id: Math.random().toString(36).substring(2, 9),
          progress: 0,
          status: "pending" as const,
        }));
        setFiles((prev) => [...prev, ...fileArray]);
      } catch (error) {
        console.error("Error processing selected files:", error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const fileArray = Array.from(e.dataTransfer.files).map((file) => ({
          ...file,
          id: Math.random().toString(36).substring(2, 9),
          progress: 0,
          status: "pending" as const,
        }));
        setFiles((prev) => [...prev, ...fileArray]);
      } catch (error) {
        console.error("Error processing dropped files:", error);
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter((file) => file.id !== id));
  };

  const uploadFile = async (file: FileWithProgress) => {
    // Validate file before attempting upload
    if (!file || !(file instanceof File) || !file.name) {
      console.error("Invalid file object:", file);
      return null;
    }

    // Create FormData
    const formData = new FormData();
    try {
      formData.append("file", file);
    } catch (error) {
      console.error("Error appending file to FormData:", error);
      return null;
    }

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, status: "uploading" } : f))
      );

      // Create XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
          );
        }
      });

      // Create a promise to handle the response
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.open("POST", "/api/media/upload");

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(
              new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
              })
            );
          } else {
            reject(new Error(`HTTP error ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      // Handle successful upload
      if (response.ok) {
        const data = await response.json();
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "success", progress: 100 } : f
          )
        );
        return data.file;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
      return null;
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Filter out any invalid files
    const validFiles = files.filter(
      (file) => file && file instanceof File && file.name && file.size > 0
    );

    if (validFiles.length === 0) {
      console.error("No valid files to upload");
      setIsUploading(false);
      return;
    }

    // Upload all files in parallel
    try {
      const uploadPromises = validFiles.map((file) => uploadFile(file));
      const results = await Promise.allSettled(uploadPromises);

      // Count successful uploads
      const successfulUploads = results.filter(
        (result) => result.status === "fulfilled" && result.value
      ).length;

      if (successfulUploads > 0) {
        // Wait a moment to show success
        setTimeout(() => {
          onUpload(validFiles);
          setFiles([]);
          setIsUploading(false);
        }, 1000);
      } else {
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload Media</h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isUploading}
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Drag and drop files here</h3>
          <p className="text-gray-500 mb-4">or</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            disabled={isUploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            disabled={isUploading}
          >
            Browse Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium mb-2">
              Selected Files ({files.length})
            </h3>
            <div className="max-h-40 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {file &&
                          (() => {
                            const category = getFileCategory(file);
                            switch (category) {
                              case "image":
                                return (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                    />
                                  </svg>
                                );
                              case "video":
                                return (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                                    />
                                  </svg>
                                );
                              case "audio":
                                return (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                                    />
                                  </svg>
                                );
                              case "document":
                                return (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                  </svg>
                                );
                              default:
                                return (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-500"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                                    />
                                  </svg>
                                );
                            }
                          })()}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium"
                          title={file?.name || "Unknown file"}
                        >
                          {file?.name || "Unknown file"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file?.size)}
                        </p>
                      </div>
                    </div>
                    {file?.status === "pending" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded-full hover:bg-gray-200 ml-2"
                        disabled={isUploading}
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    {file?.status === "error" && (
                      <span className="text-xs text-red-500">Failed</span>
                    )}
                    {file?.status === "success" && (
                      <span className="text-xs text-green-500">Done</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        file?.status === "error"
                          ? "bg-red-500"
                          : file?.status === "success"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${file?.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
            className={`px-4 py-2 rounded-lg ${
              files.length === 0 || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
