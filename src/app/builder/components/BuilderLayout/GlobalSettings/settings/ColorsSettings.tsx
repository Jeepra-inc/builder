import { ChevronLeft, ChevronsUpDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SketchPicker } from "react-color";
import GradientColorPicker from "react-best-gradient-color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorScheme {
  id: string;
  name: string;
  background: string;
  text: string;
  gradient: string;
  buttonBackground: string;
  buttonLabel: string;
  outlineButton: string;
}

const defaultSchemes: Omit<ColorScheme, "id">[] = [
  // {
  //   name: "Scheme 1",
  //   background: "#FFFFFF",
  //   text: "#121212",
  //   gradient: "linear-gradient(90deg, #00C9FF 0%, #92FE9D 100%)",
  //   buttonBackground: "#121212",
  //   buttonLabel: "#FFFFFF",
  //   outlineButton: "#121212",
  // },
  // {
  //   name: "Scheme 2",
  //   background: "#F0F0F0",
  //   text: "#121212",
  //   gradient: "linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)",
  //   buttonBackground: "#121212",
  //   buttonLabel: "#FFFFFF",
  //   outlineButton: "#121212",
  // },
  // {
  //   name: "Scheme 3",
  //   background: "#333333",
  //   text: "#FFFFFF",
  //   gradient: "linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)",
  //   buttonBackground: "#121212",
  //   buttonLabel: "#FFFFFF",
  //   outlineButton: "#121212",
  // },
];

type ColorProperty = keyof Omit<
  ColorScheme,
  "id" | "name" | "gradient" | "background"
>;

const colorProperties: { label: string; key: ColorProperty }[] = [
  { label: "Text", key: "text" },
  { label: "Solid button background", key: "buttonBackground" },
  { label: "Solid button label", key: "buttonLabel" },
  { label: "Outline button", key: "outlineButton" },
];

const ColorPicker = ({
  color,
  onChange,
  label,
}: {
  color: string;
  onChange: (color: string) => void;
  label: string;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        className="w-full flex items-center text-left justify-between rounded-none p-4 py-2 h-auto"
      >
        <span className="text-sm font-medium text-gray-700 text-pretty">
          {label}
        </span>
        <div className="flex items-center gap-2 border border-gray-200 rounded p-1 min-w-[100px]">
          <div
            className="w-4 h-4 rounded-full border border-gray-200"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-gray-600 uppercase">{color}</span>
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      className="w-auto p-0"
      align="start"
      side="right"
      sideOffset={10}
    >
      <SketchPicker
        color={color}
        onChange={(color) => onChange(color.hex)}
        presetColors={[
          "#D0021B",
          "#F5A623",
          "#F8E71C",
          "#8B572A",
          "#7ED321",
          "#417505",
          "#BD10E0",
          "#9013FE",
          "#4A90E2",
          "#50E3C2",
          "#B8E986",
          "#000000",
          "#4A4A4A",
          "#9B9B9B",
          "#FFFFFF",
        ]}
      />
    </PopoverContent>
  </Popover>
);

const GradientPicker = ({
  gradient,
  onChange,
}: {
  gradient: string;
  onChange: (gradient: string) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        className="w-full flex rounded-none items-center text-left justify-between p-4 py-2 h-auto"
      >
        <span className="text-sm font-medium text-gray-700 text-pretty">
          Background gradient
        </span>
        <div className="flex items-center gap-2 border border-gray-200 rounded p-1">
          <div
            className="w-20 h-6 rounded border border-gray-200"
            style={{ background: gradient || "white" }}
          />
          <ChevronsUpDown size={16} className="text-zinc-400" />
        </div>
      </Button>
    </PopoverTrigger>
    <PopoverContent
      className="w-auto p-4"
      align="start"
      side="right"
      sideOffset={10}
    >
      <div className="w-[300px]">
        <GradientColorPicker value={gradient} onChange={onChange} />
      </div>
    </PopoverContent>
  </Popover>
);

const ColorPreview = ({
  background,
  gradient,
  text,
  buttonBackground,
  outlineButton,
}: {
  background: string;
  gradient: string;
  text: string;
  buttonBackground: string;
  outlineButton: string;
}) => (
  <div
    className="p-2 px-4 border border-zinc-200 rounded-lg"
    style={{ background: gradient || background, color: text }}
  >
    <div className="flex flex-col items-center justify-center mb-2 gap-1">
      <span className="text-xl font-semibold">Aa</span>
      <div className="flex items-center gap-1">
        <span
          className="w-5 h-2 rounded-full"
          style={{ backgroundColor: buttonBackground }}
        />
        <span
          className="w-5 h-2 rounded-full border-2"
          style={{
            borderColor: outlineButton,
            backgroundColor: "transparent",
          }}
        />
      </div>
    </div>
  </div>
);

const ColorsSettings = () => {
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme | null>(
    null
  );
  const [schemes, setSchemes] = useState<ColorScheme[]>(() => {
    // Initialize with default schemes - will be replaced with API data when loaded
    return defaultSchemes.map((scheme, index) => ({
      ...scheme,
      id: `scheme-${index + 1}`,
    }));
  });

  // Load color schemes from API on mount
  useEffect(() => {
    const fetchColorSchemes = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          console.error("Error fetching settings:", response.statusText);
          return;
        }

        const settings = await response.json();

        if (
          settings?.globalStyles?.colors?.schemes &&
          Array.isArray(settings.globalStyles.colors.schemes) &&
          settings.globalStyles.colors.schemes.length > 0
        ) {
          setSchemes(settings.globalStyles.colors.schemes);
        }
      } catch (error) {
        console.error("Error loading saved color schemes:", error);
      }
    };

    fetchColorSchemes();
  }, []);

  const handleColorChange = (property: keyof ColorScheme, value: string) => {
    if (!selectedScheme) return;

    const updated = schemes.map((scheme) =>
      scheme.id === selectedScheme.id
        ? { ...scheme, [property]: value }
        : scheme
    );

    setSchemes(updated);
    setSelectedScheme((prev) => (prev ? { ...prev, [property]: value } : null));

    // Save updated schemes to settings (dispatch event only, actual saving occurs on save button)
    saveColorSchemesToSettings(updated);
  };

  // Function to save color schemes by dispatching an event (actual API save happens on save button click)
  const saveColorSchemesToSettings = (updatedSchemes: ColorScheme[]) => {
    try {
      // Save schemes to local state
      setSchemes(updatedSchemes);

      // Dispatch an event to notify any listeners that color schemes have changed
      window.dispatchEvent(
        new CustomEvent("colorSchemeUpdated", {
          detail: { schemes: updatedSchemes },
        })
      );
    } catch (error) {
      console.error("🚨 Failed to save color schemes to settings:", error);
    }
  };

  const addNewScheme = () => {
    const newScheme: ColorScheme = {
      id: `scheme-${schemes.length + 1}`,
      name: `Scheme ${schemes.length + 1}`,
      background: "#FFFFFF",
      text: "#000000",
      gradient: "",
      buttonBackground: "#000000",
      buttonLabel: "#FFFFFF",
      outlineButton: "#000000",
    };
    const updatedSchemes = [...schemes, newScheme];
    setSchemes(updatedSchemes);

    // Save updated schemes
    saveColorSchemesToSettings(updatedSchemes);
  };

  return (
    <div className="p-4">
      {selectedScheme ? (
        <div className="absolute w-full top-0 left-0 h-full bg-white flex flex-col">
          <div className="flex w-full items-center gap-2 p-4 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedScheme(null)}
              className="w-4 h-6"
            >
              <ChevronLeft />
            </Button>
            <div>
              <span className="text-zinc-500 text-sm">Colors</span>
              <h4 className="text-md font-semibold">
                Editing {selectedScheme.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 pb-8 pt-0 mb-4 border-b border-zinc-200">
            <ColorPreview
              background={selectedScheme.background}
              gradient={selectedScheme.gradient}
              text={selectedScheme.text}
              buttonBackground={selectedScheme.buttonBackground}
              outlineButton={selectedScheme.outlineButton}
            />
            <p className="text-xs text-zinc-600">
              Editing this scheme's colors will affect all sections that use
              this scheme.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <GradientPicker
              gradient={selectedScheme.gradient}
              onChange={(gradient) => handleColorChange("gradient", gradient)}
            />
            {colorProperties.map(({ label, key }) => (
              <ColorPicker
                key={key}
                label={label}
                color={selectedScheme[key]}
                onChange={(color) => handleColorChange(key, color)}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="mb-4 text-xs text-zinc-600">
            Color schemes can be applied to sections throughout your online
            store.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="group">
                <div
                  className="border border-gray-300 rounded-lg cursor-pointer mb-2 hover:shadow-md"
                  style={{
                    background: scheme.gradient || scheme.background,
                    color: scheme.text,
                  }}
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <ColorPreview
                    background={scheme.background}
                    gradient={scheme.gradient}
                    text={scheme.text}
                    buttonBackground={scheme.buttonBackground}
                    outlineButton={scheme.outlineButton}
                  />
                </div>
                <p className="text-center text-xs font-medium mb-2">
                  {scheme.name}
                </p>
              </div>
            ))}
            <div>
              <div
                className="p-4 min-h-[70px] flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-lg text-zinc-500 cursor-pointer hover:shadow-md"
                onClick={addNewScheme}
              >
                <span className="text-sm">+</span>
              </div>
              <p className="text-center text-xs font-medium mt-2">Add Scheme</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { ColorsSettings };
