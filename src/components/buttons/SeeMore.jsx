import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

const SeeMore = ({
  text,
  onClick,
  to,
  className = "",
  textColor = "text-gray-600",
  hoverTextColor = "hover:text-black"
}) => {
  const { t } = useTranslation();
  const displayText = text || t('common.seeMore');
  const commonClasses = `
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
  `;

  const content = (
    <>
      <span className="font-['Poppins'] font-medium text-fluid-small">
        {displayText}
      </span>
      <ChevronRight
        className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
      />
    </>
  );

  // If 'to' prop is provided, use Link for navigation
  if (to) {
    return (
      <Link to={to} className={commonClasses}>
        {content}
      </Link>
    );
  }

  // Otherwise, use button with onClick
  return (
    <button onClick={onClick} className={commonClasses}>
      {content}
    </button>
  );
};

export default SeeMore;