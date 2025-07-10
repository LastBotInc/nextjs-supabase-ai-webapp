import React, { useRef, useState } from "react";

// SearchBar component: input expands left, icon inside input on right
export default function SearchBar() {
  // State to control input expansion
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expand input and focus when icon or input is clicked
  const handleExpand = () => {
    setExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Collapse input when it loses focus and is empty
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setExpanded(false);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Animated input field with icon inside on the right */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        aria-label="Search"
        className={`
          transition-all duration-300 ease-in-out
          text-piki bg-white border border-gray-300 rounded-full shadow-sm
          pr-[28px] pl-2 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-400
          ${expanded ? "w-48 opacity-100" : "w-1 cursor-pointer text-piki"}
        `}
        style={{ minWidth: 0 }}
        onFocus={handleExpand}
        onBlur={handleBlur}
        onClick={handleExpand}
      />
      {/* Magnifying glass icon inside input, right-aligned */}
      <button
        type="button"
        aria-label="Open search"
        className="absolute right-[9px] top-1/2 -translate-y-1/2 p-0 m-0 bg-transparent border-none outline-none cursor-pointer"
        tabIndex={-1}
        onMouseDown={(e) => {
          e.preventDefault();
          handleExpand();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
          />
        </svg>
      </button>
    </div>
  );
}
