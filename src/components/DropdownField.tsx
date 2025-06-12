import React from "react";

interface DropdownFieldProps {
  id: string;
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  id,
  name,
  label,
  options,
  defaultValue,
  required = false,
  onChange,
}) => {
  return (
    <div className="mb-3">
      <label
        htmlFor={id}
        className="block text-[#8A92A6] font-normal text-md mb-3"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-[#6C757D] text-md"
        defaultValue={defaultValue}
        required={required}
        onChange={onChange}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
