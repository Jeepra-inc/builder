import { useState, useEffect } from "react";

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
  value: initialValue = (max + min) / 2,
  onInput,
  onValueChange,
  className,
}: RangeSliderProps) => {
  const [value, setValue] = useState<number>(initialValue);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(Math.min(max, Math.max(min, newValue)));
    if (onInput) onInput(e);
    if (onValueChange) onValueChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseFloat(e.target.value));
    if (onValueChange) onValueChange(parseFloat(e.target.value));
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
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
      <div className="relative h-[20px] flex-1">
        {/* Track elements */}
        <div
          className="absolute w-full top-[8px]"
          style={
            {
              ["--s"]: "2px",
              height: "4px",
              background:
                "radial-gradient(circle closest-side, #ddd 100%, #0000) 0 0 / var(--s) 5%, linear-gradient(90deg, #ddd 50%, #0000 0) calc(var(--s) / 2) 0 / calc(2* var(--s)) 100%",
            } as React.CSSProperties
          }
        />
        <div
          className="absolute h-[5px] rounded-full top-1/2 transform -translate-y-1/2"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />

        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="absolute w-full h-full z-10 m-0 p-0 top-1/2 outline-none cursor-pointer bg-transparent transform -translate-y-1/2"
          style={{
            WebkitAppearance: "none",
          }}
        />

        {/* Styled thumb for all browsers */}
        <style>
          {`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 15px;
              height: 15px;
              background: var(--main-color);
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.2s ease;
              transform: translateY(-50%) scale(var(--thumb-scale));
              box-shadow: var(--thumb-shadow);
              position: relative;
              top: 50%;
            }

            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: var(--main-color);
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.2s ease;
              transform: translateY(-50%) scale(var(--thumb-scale));
              box-shadow: var(--thumb-shadow);
              border: none;
              position: relative;
              top: 50%;
            }

            input[type="range"]::-webkit-slider-runnable-track {
              background: transparent;
              border: none;
              height: 0;
            }

            input[type="range"]::-moz-range-track {
              background: transparent;
              border: none;
              height: 0;
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
            width: "100%",
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
