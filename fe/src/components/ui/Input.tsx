import React from "react";

interface InputProps {
    placeholder: string;
    name: string;  // Use name for form submission
    type: "text" | "password" | "date" | "datetime" | "number" | "checkbox" | "radio" | "email";
    className?: string;
    min?: number;
    max?: number;
    read_only?: boolean;
}

const Input: React.FC<InputProps> = ({
    placeholder,
    name,
    type,
    className,
    min,
    max,
    read_only = false,
}) => {
    return (
        <input
            className={`py-3 px-5 border-b border-gray-500 text-gray-700
            outline-none w-full bg-gray-200 ${className} rounded-t-sm`}
            placeholder={placeholder}
            name={name}  // Important for form submission
            type={type}
            minLength={min}
            maxLength={max}
            readOnly={read_only}
        />
    );
};

export default Input;
