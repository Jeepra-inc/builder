import { useState, useEffect, useRef } from "react";

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  unit?: "px" | "%";
  color?: string;
  value?: number;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: number) => void;
  className?: string;
}

const RangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  color = "#0f172a",
  value: propValue,
  onInput,
  onValueChange,
  className,
}: RangeSliderProps) => {
  // Use the provided value or calculate a default
  const defaultValue = propValue !== undefined ? propValue : (max + min) / 2;
  const [value, setValue] = useState<number>(defaultValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with prop value when it changes
  useEffect(() => {
    if (propValue !== undefined && propValue !== value) {
      console.log(`RangeSlider: Updating value from prop: ${propValue}`);
      setValue(propValue);
    }
  }, [propValue, value]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(Math.min(max, Math.max(min, newValue)));
    if (onInput) onInput(e);
    if (onValueChange) onValueChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  // Setup event handlers for drag state
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={`flex items-center gap-4 w-full ${className}`}
      style={
        {
          "--thumb-scale": isDragging ? 1.3 : 1,
          "--thumb-shadow": isDragging ? `0 0 0 5px ${color}30` : "none",
          "--main-color": color,
        } as React.CSSProperties
      }
    >
      {/* Slider container */}
      <div className="relative h-[20px] flex-1" ref={sliderRef}>
        {/* Background track */}
        <div
          className="absolute w-full top-1/2 -translate-y-1/2"
          style={{
            height: "4px",
            background: "#ddd",
            borderRadius: "2px",
          }}
        />

        {/* Filled track */}
        <div
          className="absolute h-[4px] rounded-full top-1/2 transform -translate-y-1/2"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />

        {/* Range input - This is the interactive element */}
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="absolute w-full h-8 z-10 cursor-pointer top-1/2 -translate-y-1/2"
          style={{
            WebkitAppearance: "none",
            appearance: "none",
            background: "transparent",
            margin: 0,
            // Important: Don't set opacity too low or it affects interaction
            opacity: 0.01,
          }}
        />

        {/* Visual thumb element */}
        <div
          className="absolute w-[15px] h-[15px] rounded-full bg-white border-2 top-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{
            left: `${percentage}%`,
            marginLeft: "-7.5px",
            borderColor: color,
            transform: `scale(${isDragging ? 1.3 : 1})`,
            boxShadow: isDragging ? `0 0 0 5px ${color}30` : "none",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        />

        {/* Browser-specific thumb styling */}
        <style>
          {`
            /* Hide default thumb but keep it interactive */
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 25px;
              height: 25px;
              background: transparent;
              cursor: pointer;
              border: none;
              pointer-events: auto;
            }

            input[type="range"]::-moz-range-thumb {
              width: 25px;
              height: 25px;
              background: transparent;
              cursor: pointer;
              border: none;
              pointer-events: auto;
            }

            /* Hide default track */
            input[type="range"]::-webkit-slider-runnable-track {
              background: transparent;
              border: none;
              height: 5px;
            }

            input[type="range"]::-moz-range-track {
              background: transparent;
              border: none;
              height: 5px;
            }
          `}
        </style>
      </div>

      {/* Input field with integrated unit */}
      <div className="relative flex items-center">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={handleInput}
          style={{
            width: "70px",
            padding: "4px 22px 4px 8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            // Hide spin buttons
            MozAppearance: "textfield",
            appearance: "textfield",
          }}
        />
        <span className="absolute pointer-events-none text-[#666] right-[8px] top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {unit}
        </span>

        {/* Hide spin buttons for WebKit browsers */}
        <style>
          {`
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default RangeSlider;
