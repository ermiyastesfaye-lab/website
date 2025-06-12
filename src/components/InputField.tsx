import React from "react";

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  type = "text",
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
      <input
        type={type}
        id={id}
        name={name}
        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-[#6C757D] text-md"
        defaultValue={defaultValue}
        required={required}
        onChange={onChange}
      />
    </div>
  );
};
