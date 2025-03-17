"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorScheme, fetchColorSchemes } from "../utils/colorSchemeUtils";

interface ColorSchemeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  width?: string;
}

/**
 * A visual color scheme selector component that displays a preview of each scheme
 * Uses shadcn/ui's Command and Popover components for an enhanced UI
 */
const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  width = "w-[280px]",
}) => {
  const [open, setOpen] = useState(false);
  const [colorSchemes, setColorSchemes] = useState<ColorScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add debugging log for component mounting
  useEffect(() => {
    console.log("🌈 ColorSchemeSelector component mounted with value:", value);
    return () => {
      console.log("🌈 ColorSchemeSelector component unmounted");
    };
  }, [value]);

  // Log when value changes
  useEffect(() => {
    console.log("🌈 ColorSchemeSelector value changed:", value);
  }, [value]);

  // Load color schemes when component mounts
  useEffect(() => {
    console.log("🌈 ColorSchemeSelector: Fetching color schemes...");
    fetchColorSchemes()
      .then((schemes) => {
        console.log("🌈 ColorSchemeSelector: Loaded schemes:", schemes.length);
        setColorSchemes(schemes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("🌈 Error loading color schemes:", error);
        setIsLoading(false);
      });
  }, []);

  // Helper to find current scheme
  const getCurrentScheme = () => {
    return colorSchemes.find((scheme) => scheme.id === value);
  };

  // Create preview styles for a scheme
  const getPreviewStyle = (scheme: ColorScheme) => {
    return {
      background: scheme.gradient || scheme.background,
      color: scheme.text,
    };
  };

  // Add a useEffect to log when props change
  useEffect(() => {
    console.log("🌈 ColorSchemeSelector props changed:", {
      value,
      disabled,
      width,
      valueType: typeof value,
    });
  }, [value, disabled, width]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            width,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {value && getCurrentScheme() ? (
              <>
                <div
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{
                    background:
                      getCurrentScheme()?.gradient ||
                      getCurrentScheme()?.background,
                  }}
                ></div>
                <span className="truncate">
                  {getCurrentScheme()?.name || `Scheme ${value}`}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {isLoading ? "Loading schemes..." : "Select color scheme"}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandEmpty>No color schemes found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {colorSchemes.map((scheme) => (
                <CommandItem
                  key={scheme.id}
                  value={scheme.id}
                  onSelect={() => {
                    console.log(
                      `🌈 ColorSchemeSelector: Selected scheme before change: ${value}`
                    );
                    console.log(
                      `🌈 ColorSchemeSelector: Selecting new scheme: ${scheme.id} (${scheme.name})`
                    );
                    onChange(scheme.id);
                    console.log(
                      `🌈 ColorSchemeSelector: Selected scheme after change: ${scheme.id}`
                    );
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {/* Color preview */}
                    <div
                      className="w-8 h-8 rounded-md border"
                      style={getPreviewStyle(scheme)}
                    >
                      <div className="flex h-full items-end p-1">
                        <div className="h-1 w-3 bg-current opacity-70 rounded"></div>
                      </div>
                    </div>

                    {/* Scheme name */}
                    <span>{scheme.name || `Scheme ${scheme.id}`}</span>
                  </div>

                  {/* Selected indicator */}
                  {value === scheme.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { ColorSchemeSelector };
