import React, { ReactNode } from "react";

interface CardProps{
    children: ReactNode,
    className?: string
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={`p-5 rounded-xl bg-white bg-opacity-5 backdrop-blur-sm shadow-sm ${className}`}>
            {children}
        </div>
    );
};



export default Card