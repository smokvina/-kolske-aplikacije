
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const baseClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 transition-all duration-300";
  const hoverClasses = onClick ? "hover:shadow-lg hover:border-[#003366] dark:hover:border-sky-400 cursor-pointer" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;