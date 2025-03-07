import { Separator } from "@/components/ui/separator";
import React from "react";

interface SettingSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string; // Add className prop
}

export function SettingSection({
  title,
  description,
  children,
  className, // Destructure className
}: SettingSectionProps) {
  return (
    <>
      <div className={`p-4 ${className}`}>
        <div>
          <h3 className="text-sm font-medium">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <div>{children}</div>
      </div>
      <Separator />
    </>
  );
}
