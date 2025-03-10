import { Separator } from "@/components/ui/separator";
import React from "react";

interface ColSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string; // Add className prop
  expanded?: boolean;
  divider?: boolean;
}

export function ColSection({
  title,
  description,
  children,
  className,
  expanded = true,
  divider = true,
}: ColSectionProps) {
  return (
    <>
      <div className={`p-3 ${className || ""}`}>
        {expanded ? (
          <div className="grid grid-cols-10 items-center gap-2">
            {/* Title and description column - 30% (3/10) */}
            <div className="col-span-4">
              <h3 className="text-xs font-semibold">{title}</h3>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>

            {/* Content column - 50% (5/10) */}
            <div className="col-span-6 space-y-2">{children}</div>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
      {divider && <Separator />}
    </>
  );
}
