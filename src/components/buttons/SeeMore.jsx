import React from 'react';
import { ChevronRight } from 'lucide-react';

const SeeMore = ({
  text = "Voir tout",
  onClick,
  className = "",
  textColor = "text-gray-600",
  hoverTextColor = "hover:text-black"
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group
        flex
        items-center
        gap-1
        bg-transparent
        border-none
        cursor-pointer
        transition-all
        duration-300
        ease-in-out
        ${textColor}
        ${hoverTextColor}
        ${className}
      `}
    >
      <span className="font-['Poppins'] font-medium text-sm">
        {text}
      </span>
      <ChevronRight
        className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
      />
    </button>
  );
};

export default SeeMore;