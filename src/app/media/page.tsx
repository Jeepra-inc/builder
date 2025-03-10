"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpTrayIcon,
  PhotoIcon,
  VideoCameraIcon,
  Squares2X2Icon,
  ListBulletIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import MediaCard from "./components/MediaCard";
import UploadMedia from "./components/UploadMedia";
import MediaDetail from "./components/MediaDetail";

type MediaType = "photo" | "video" | "audio" | "document";
type TabType = "photos" | "videos" | "audio" | "documents";

interface MediaItem {
  id: string;
  title: string;
  src: string;
  type: MediaType;
  date: string;
  description?: string;
  altTag?: string;
}

// Sample data for demonstration
const sampleMedia: MediaItem[] = [
  {
    id: "1",
    title: "Mountain Landscape",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    type: "photo",
    date: "2023-06-15",
    description: "Beautiful mountain landscape with snow-capped peaks",
    altTag: "Snow-capped mountain peaks with clear blue sky",
  },
  {
    id: "2",
    title: "Beach Sunset",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    type: "photo",
    date: "2023-07-22",
    description: "Serene sunset view at a tropical beach",
    altTag: "Golden sunset over calm ocean waters with sandy beach",
  },
  {
    id: "3",
    title: "City Timelapse",
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    type: "video",
    date: "2023-08-05",
    description:
      "Stunning timelapse of a cityscape at night showing traffic flow",
  },
];

// Define sorting options
type SortOption =
  | "dateNewest"
  | "dateOldest"
  | "nameAZ"
  | "nameZA"
  | "sizeSmallest"
  | "sizeLargest";

export default function MediaApp() {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(sampleMedia);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("dateNewest");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter media based on active tab
  const filteredByTypeMedia = mediaItems.filter((item) => {
    if (activeTab === "photos") return item.type === "photo";
    if (activeTab === "videos") return item.type === "video";
    if (activeTab === "audio") return item.type === "audio";
    if (activeTab === "documents") return item.type === "document";
    return false;
  });

  // Filter by search query
  const filteredBySearchMedia = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTypeMedia;

    const query = searchQuery.toLowerCase();
    return filteredByTypeMedia.filter(
      (item) => item.title.toLowerCase().includes(query)
      // In a real app, you would also search description and alt tags
      // || item.description.toLowerCase().includes(query)
      // || item.altTag.toLowerCase().includes(query)
    );
  }, [filteredByTypeMedia, searchQuery]);

  // Sort the filtered media
  const sortedMedia = useMemo(() => {
    const mediaToSort = [...filteredBySearchMedia];

    switch (sortOption) {
      case "dateNewest":
        return mediaToSort.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case "dateOldest":
        return mediaToSort.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case "nameAZ":
        return mediaToSort.sort((a, b) => a.title.localeCompare(b.title));
      case "nameZA":
        return mediaToSort.sort((a, b) => b.title.localeCompare(a.title));
      case "sizeSmallest":
        // In a real app, we would store file size with each media item
        // For this demo, we'll just use a random value simulating size
        return mediaToSort.sort(
          (a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0)
        );
      case "sizeLargest":
        return mediaToSort.sort(
          (a, b) => b.id.charCodeAt(0) - a.id.charCodeAt(0)
        );
      default:
        return mediaToSort;
    }
  }, [filteredBySearchMedia, sortOption]);

  const handleDelete = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
    // If item was selected, remove from selection
    if (selectedItems.has(id)) {
      const newSelectedItems = new Set(selectedItems);
      newSelectedItems.delete(id);
      setSelectedItems(newSelectedItems);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;

    setMediaItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
    setBulkSelectMode(false);
  };

  const toggleItemSelection = (id: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === sortedMedia.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(sortedMedia.map((item) => item.id)));
    }
  };

  const handleUpload = async (files: File[]) => {
    // In a real application, files would already be uploaded to the server
    // by the UploadMedia component. Here we're just integrating them into
    // our UI state with the returned data.

    // Map the uploaded files to media items
    const newMedia: MediaItem[] = files.map((file) => {
      let type: MediaType = "photo";

      if (file.type.startsWith("video/")) {
        type = "video";
      } else if (file.type.startsWith("audio/")) {
        type = "audio";
      } else if (
        file.type === "application/pdf" ||
        file.type.includes("word") ||
        file.type.includes("excel") ||
        file.type === "text/csv"
      ) {
        type = "document";
      }

      // In a real app, file.url would come from the server response
      // Here we're using placeholder images since we don't have actual URLs
      return {
        id: Math.random().toString(36).substring(2, 9),
        title: file.name.split(".")[0],
        src:
          type === "video"
            ? "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b"
            : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        type,
        date: new Date().toISOString().split("T")[0],
        description: `Uploaded ${file.name}`,
        altTag:
          type === "photo" ? `Image of ${file.name.split(".")[0]}` : undefined,
      };
    });

    // Add the new media items to the existing ones
    setMediaItems((prev) => [...prev, ...newMedia]);

    // Close the upload modal
    setIsUploadOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-gray-600 mt-2">
          Manage and organize your media files
        </p>
      </header>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "photos"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <PhotoIcon className="h-5 w-5" />
            <span>Photos</span>
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "videos"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <VideoCameraIcon className="h-5 w-5" />
            <span>Videos</span>
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "audio"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <MusicalNoteIcon className="h-5 w-5" />
            <span>Audio</span>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === "documents"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700"
            }`}
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Documents</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search media..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View mode toggle */}
          <div className="bg-gray-100 rounded-lg flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-r-lg ${
                viewMode === "list" ? "bg-white shadow-sm" : ""
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="px-3 py-2 border border-gray-300 rounded-md flex items-center space-x-1 bg-white"
            >
              <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm hidden md:inline">Sort</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "dateNewest"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onClick={() => {
                      setSortOption("dateNewest");
                      setShowSortDropdown(false);
                    }}
                  >
                    Date added (newest first)
                  </button>
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "dateOldest"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onClick={() => {
                      setSortOption("dateOldest");
                      setShowSortDropdown(false);
                    }}
                  >
                    Date added (oldest first)
                  </button>
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "nameAZ" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onClick={() => {
                      setSortOption("nameAZ");
                      setShowSortDropdown(false);
                    }}
                  >
                    File name (A-Z)
                  </button>
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "nameZA" ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onClick={() => {
                      setSortOption("nameZA");
                      setShowSortDropdown(false);
                    }}
                  >
                    File name (Z-A)
                  </button>
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "sizeSmallest"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onClick={() => {
                      setSortOption("sizeSmallest");
                      setShowSortDropdown(false);
                    }}
                  >
                    File size (smallest first)
                  </button>
                  <button
                    className={`px-4 py-2 text-sm text-left w-full hover:bg-gray-100 ${
                      sortOption === "sizeLargest"
                        ? "bg-blue-50 text-blue-700"
                        : ""
                    }`}
                    onClick={() => {
                      setSortOption("sizeLargest");
                      setShowSortDropdown(false);
                    }}
                  >
                    File size (largest first)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk select toggle */}
          <button
            onClick={() => {
              setBulkSelectMode(!bulkSelectMode);
              if (bulkSelectMode) {
                setSelectedItems(new Set());
              }
            }}
            className={`px-3 py-2 rounded-md flex items-center space-x-1 ${
              bulkSelectMode
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            <span className="text-sm">Bulk Select</span>
          </button>

          {/* Upload button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Bulk actions bar - only visible when bulk select mode is active */}
      {bulkSelectMode && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">
              {selectedItems.size} {selectedItems.size === 1 ? "item" : "items"}{" "}
              selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedItems.size === sortedMedia.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedItems.size === 0}
              className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                selectedItems.size === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 min-h-[500px]">
        {sortedMedia.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedMedia.map((item) => (
                <div key={item.id} className="relative">
                  {bulkSelectMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <MediaCard
                    id={item.id}
                    title={item.title}
                    src={item.src}
                    type={item.type}
                    date={item.date}
                    onDelete={bulkSelectMode ? undefined : handleDelete}
                    onClick={
                      bulkSelectMode
                        ? () => toggleItemSelection(item.id)
                        : () => setSelectedMedia(item)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y">
              {sortedMedia.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-3 px-2 hover:bg-gray-50 cursor-pointer relative"
                  onClick={
                    bulkSelectMode
                      ? () => toggleItemSelection(item.id)
                      : () => setSelectedMedia(item)
                  }
                >
                  {bulkSelectMode && (
                    <div className="mr-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.id);
                        }}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden mr-4">
                    {item.type === "photo" ? (
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <VideoCameraIcon className="h-8 w-8 text-white" />
                      </div>
                    ) : item.type === "audio" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <MusicalNoteIcon className="h-8 w-8 text-white" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <DocumentTextIcon className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3
                      className="font-medium text-gray-900 truncate"
                      title={item.title}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.date} • {item.type}
                    </p>
                  </div>
                  {!bulkSelectMode && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMedia(item);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200"
                        title="View details"
                      >
                        <InformationCircleIcon className="h-5 w-5 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 rounded-full hover:bg-gray-200 text-red-500"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <EmptyState type={activeTab} onUpload={() => setIsUploadOpen(true)} />
        )}
      </div>

      {isUploadOpen && (
        <UploadMedia
          isOpen={isUploadOpen}
          onCancel={() => setIsUploadOpen(false)}
          onUpload={handleUpload}
        />
      )}

      {selectedMedia && (
        <MediaDetail
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </div>
  );
}

function EmptyState({
  type,
  onUpload,
}: {
  type: "photos" | "videos" | "audio" | "documents";
  onUpload: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
      {(() => {
        switch (type) {
          case "photos":
            return <PhotoIcon className="h-16 w-16 text-gray-300 mb-4" />;
          case "videos":
            return <VideoCameraIcon className="h-16 w-16 text-gray-300 mb-4" />;
          case "audio":
            return <MusicalNoteIcon className="h-16 w-16 text-gray-300 mb-4" />;
          case "documents":
            return (
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
            );
          default:
            return null;
        }
      })()}
      <h3 className="text-lg font-medium text-gray-900">No {type} yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Upload some {type} to see them here.
      </p>
      <button
        onClick={onUpload}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <ArrowUpTrayIcon className="h-5 w-5" />
        <span>
          Upload{" "}
          {type === "photos"
            ? "Photos"
            : type === "videos"
            ? "Videos"
            : type === "audio"
            ? "Audio"
            : "Documents"}
        </span>
      </button>
    </div>
  );
}
