import React, { useEffect, useRef } from "react";

interface TextAreaProps {
    placeholder: string;
    name: string;  // Use name for form submission
    cols?: number;
    rows?: number;
    className?: string;
    readOnly?: boolean;
    onClick?: () => void;
}

const TextArea: React.FC<TextAreaProps> = ({
    placeholder,
    name,
    cols = 10,
    rows = 3,
    className,
    readOnly = false,
    onClick = () => {},
}) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
        }
    }, []);

    return (
        <textarea
            className={`py-3 px-5 border-b border-gray-500 text-gray-700
            outline-none w-full bg-gray-200 ${className} rounded-t-sm`}
            placeholder={placeholder}
            name={name}  // Important for form submission
            cols={cols}
            rows={rows}
            spellCheck={false}
            ref={textAreaRef}
            readOnly={readOnly}
            onClick={onClick}
        ></textarea>
    );
};

export default TextArea;
