"use client";

import {
  EllipsisHorizontalIcon,
  HeartIcon,
  TrashIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface MediaCardProps {
  id: string;
  title: string;
  src: string;
  type: "photo" | "video" | "audio" | "document";
  date: string;
  description?: string;
  altTag?: string;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

export default function MediaCard({
  id,
  title,
  src,
  type,
  date,
  description,
  altTag,
  onDelete,
  onClick,
}: MediaCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const renderMediaPreview = () => {
    switch (type) {
      case "photo":
        return (
          <img src={src} alt={title} className="w-full h-full object-cover" />
        );
      case "video":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-12 border-l-blue-600 ml-1"></div>
            </div>
            <VideoCameraIcon className="h-10 w-10 text-white absolute bottom-2 right-2 opacity-75" />
          </div>
        );
      case "audio":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <MusicalNoteIcon className="h-16 w-16 text-blue-300" />
          </div>
        );
      case "document":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <DocumentTextIcon className="h-16 w-16 text-gray-300" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gray-100">
        {renderMediaPreview()}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 truncate" title={title}>
            {title}
          </h3>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white shadow-lg rounded-md py-1 w-36 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(id);
                    setShowMenu(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full text-left"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{date}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFavorite(!favorite);
            }}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            {favorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
