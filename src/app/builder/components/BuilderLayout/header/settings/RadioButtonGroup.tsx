import React from "react";

interface RadioButtonOption {
  id: string;
  value: string;
  label: React.ReactNode; // Changed from string to React.ReactNode
}

interface RadioButtonGroupProps {
  options: RadioButtonOption[];
  name: string;
  required?: boolean;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  name,
  required,
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <span key={option.id}>
          <input
            type="radio"
            id={option.id}
            name={name}
            value={option.value}
            className="hidden peer"
            required={required}
          />
          <label
            htmlFor={option.id}
            className="inline-flex items-center justify-between w-full p-2 px-3 text-gray-500 bg-white border border-gray-200 rounded-md cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-blue-500 peer-checked:border-blue-600 dark:peer-checked:border-blue-600 peer-checked:text-blue-600 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 hover:shadow"
          >
            <div className="flex items-center justify-center w-full">
              <div className="flex items-center text-xs justify-center min-w-[15px]">
                {option.label}
              </div>
            </div>
          </label>
        </span>
      ))}
    </div>
  );
};

export default RadioButtonGroup;
