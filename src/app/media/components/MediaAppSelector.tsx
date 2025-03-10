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
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  FolderIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import MediaCard from "./MediaCard";

// Sample data for demonstration (in a real app, this would come from an API)
const sampleMedia: MediaItem[] = [
  {
    id: "1",
    title: "Mountain Landscape",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    type: "photo" as MediaType,
    date: "2023-06-15",
    description: "Beautiful mountain landscape with snow-capped peaks",
    altTag: "Snow-capped mountain peaks with clear blue sky",
  },
  {
    id: "2",
    title: "Beach Sunset",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    type: "photo" as MediaType,
    date: "2023-07-22",
    description: "Serene sunset view at a tropical beach",
    altTag: "Golden sunset over calm ocean waters with sandy beach",
  },
  {
    id: "3",
    title: "City Timelapse",
    src: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    type: "video" as MediaType,
    date: "2023-08-05",
    description:
      "Stunning timelapse of a cityscape at night showing traffic flow",
  },
  {
    id: "4",
    title: "Product Photo 1",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    type: "photo" as MediaType,
    date: "2023-09-12",
    description: "Professional product photography",
    altTag: "Product on white background",
  },
  {
    id: "5",
    title: "Nature Documentary",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    type: "video" as MediaType,
    date: "2023-10-18",
    description: "Documentary footage of wildlife",
  },
  {
    id: "6",
    title: "Business Presentation",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    type: "document" as MediaType,
    date: "2023-11-05",
    description: "Quarterly business presentation",
  },
];

// Missing icon components
const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

// Sidebar categories
const sidebarCategories = [
  { id: "favorites", label: "Favorites", icon: StarSolidIcon },
  { id: "recents", label: "Recents", icon: ClockIcon },
  { id: "applications", label: "Applications", icon: FolderIcon },
  { id: "desktop", label: "Desktop", icon: FolderIcon },
  { id: "documents", label: "Documents", icon: DocumentTextIcon },
  { id: "downloads", label: "Downloads", icon: ArrowDownIcon },
  { id: "pictures", label: "Pictures", icon: PhotoIcon },
  { id: "videos", label: "Videos", icon: VideoCameraIcon },
  { id: "music", label: "Music", icon: MusicalNoteIcon },
];

type MediaType = "photo" | "video" | "audio" | "document";
type TabType = "photos" | "videos" | "audio" | "documents";
type ViewType = "grid" | "list";

interface MediaItem {
  id: string;
  title: string;
  src: string;
  type: MediaType;
  date: string;
  description?: string;
  altTag?: string;
}

interface MediaAppProps {
  mode: "select" | "view";
  onSelectMedia?: (imageUrl: string) => void;
  selectedMediaUrl?: string;
}

export function MediaApp({
  mode = "view",
  onSelectMedia,
  selectedMediaUrl,
}: MediaAppProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [activeCategory, setActiveCategory] = useState("pictures");
  const [mediaItems] = useState<MediaItem[]>(sampleMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewType>("grid");
  const [iconSize, setIconSize] = useState<"small" | "medium" | "large">(
    "medium"
  );

  // Filter media based on active category and tab
  const filteredByTypeMedia = useMemo(() => {
    if (mode === "select") {
      // In selection mode, only show photos
      return mediaItems.filter((item) => item.type === "photo");
    }

    // Otherwise filter by the active category
    switch (activeCategory) {
      case "pictures":
        return mediaItems.filter((item) => item.type === "photo");
      case "videos":
        return mediaItems.filter((item) => item.type === "video");
      case "music":
        return mediaItems.filter((item) => item.type === "audio");
      case "documents":
        return mediaItems.filter((item) => item.type === "document");
      case "favorites":
      case "recents":
      case "downloads":
        // In a real app, these would have their own logic
        return mediaItems;
      default:
        return mediaItems;
    }
  }, [mediaItems, activeCategory, mode]);

  // Filter by search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return filteredByTypeMedia;

    const query = searchQuery.toLowerCase();
    return filteredByTypeMedia.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.altTag && item.altTag.toLowerCase().includes(query))
    );
  }, [filteredByTypeMedia, searchQuery]);

  // If we're in select mode, handle clicking on media to select it
  const handleMediaClick = (item: MediaItem) => {
    if (mode === "select" && onSelectMedia) {
      onSelectMedia(item.src);
    }
  };

  // Get icon size class based on current setting
  const getIconSizeClass = () => {
    switch (iconSize) {
      case "small":
        return "w-24 h-24";
      case "large":
        return "w-40 h-40";
      default:
        return "w-32 h-32";
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Mac-like toolbar */}
      <div className="bg-white border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
          </button>

          <div className="ml-4 flex items-center space-x-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${
                viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${
                viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              <ListBulletIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 max-w-lg mx-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-3 py-1 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {mode === "select" && (
          <span className="text-sm text-gray-500 mr-2">
            Select an image to use
          </span>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mac-like sidebar */}
        <div className="w-48 bg-gray-100 p-3 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Favorites
            </h3>
            <ul className="space-y-1">
              {sidebarCategories.slice(0, 3).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center w-full px-2 py-1 rounded-md text-sm ${
                      activeCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    <span>{category.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Locations
            </h3>
            <ul className="space-y-1">
              {sidebarCategories.slice(3, 9).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center w-full px-2 py-1 rounded-md text-sm ${
                      activeCategory === category.id
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    <span>{category.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Tags
            </h3>
            <ul className="space-y-1">
              <li>
                <button className="flex items-center w-full px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                  <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                  <span>Red</span>
                </button>
              </li>
              <li>
                <button className="flex items-center w-full px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                  <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
                  <span>Orange</span>
                </button>
              </li>
              <li>
                <button className="flex items-center w-full px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-200">
                  <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                  <span>Yellow</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {filteredMedia.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <div key={item.id} className="relative">
                    {mode === "select" && selectedMediaUrl === item.src && (
                      <div className="absolute top-2 right-2 z-10">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                    <div
                      className={`cursor-pointer flex flex-col items-center ${
                        selectedMediaUrl === item.src
                          ? "ring-2 ring-blue-500 rounded-lg"
                          : ""
                      }`}
                      onClick={() => handleMediaClick(item)}
                    >
                      <div
                        className={`${getIconSizeClass()} bg-white rounded-md overflow-hidden border border-gray-200 mb-2 flex items-center justify-center`}
                      >
                        {item.type === "photo" ? (
                          <img
                            src={item.src}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : item.type === "video" ? (
                          <div className="w-full h-full relative flex items-center justify-center bg-gray-100">
                            <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        ) : item.type === "audio" ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <MusicalNoteIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <DocumentTextIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-center truncate w-full">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date Modified
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMedia.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedMediaUrl === item.src ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleMediaClick(item)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                              {item.type === "photo" ? (
                                <img
                                  className="h-10 w-10 rounded object-cover"
                                  src={item.src}
                                  alt=""
                                />
                              ) : item.type === "video" ? (
                                <VideoCameraIcon className="h-6 w-6 text-gray-400" />
                              ) : item.type === "audio" ? (
                                <MusicalNoteIcon className="h-6 w-6 text-gray-400" />
                              ) : (
                                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {item.date}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No files found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mac-like status bar */}
      <div className="bg-gray-100 border-t px-4 py-1 text-xs text-gray-500 flex justify-between">
        <span>{filteredMedia.length} items</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIconSize("small")}
              className={`p-1 rounded ${
                iconSize === "small" ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <Squares2X2Icon className="h-3 w-3 text-gray-600" />
            </button>
            <button
              onClick={() => setIconSize("medium")}
              className={`p-1 rounded ${
                iconSize === "medium" ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <Squares2X2Icon className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={() => setIconSize("large")}
              className={`p-1 rounded ${
                iconSize === "large" ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
