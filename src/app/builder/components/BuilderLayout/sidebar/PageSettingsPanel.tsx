import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  FileText,
  Eye,
  Calendar,
  CheckSquare,
  Plus,
  Video,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PageSettingsPanel() {
  return (
    <div className="h-full w-full">
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <h2 className="px-4 py-3 text-sm font-semibold text-gray-800">
          Page Settings
        </h2>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-6 pb-8">
          {/* Publish Status Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            {/* ... rest of publish status content */}
          </div>

          {/* Categories Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            {/* ... rest of categories content */}
          </div>

          {/* Format Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            {/* ... rest of format content */}
          </div>

          {/* Tags Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            {/* ... rest of tags content */}
          </div>

          {/* Featured Image Panel */}
          <div className="border border-gray-200 rounded-md shadow-sm">
            {/* ... rest of featured image content */}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
