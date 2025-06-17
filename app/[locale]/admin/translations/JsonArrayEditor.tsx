"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

interface JsonArrayEditorProps {
  value: string; // JSON stringified array
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  locale?: string;
}

export default function JsonArrayEditor({ value, onChange, disabled }: JsonArrayEditorProps) {
  // Parse the initial value as a JSON array, fallback to empty array if invalid
  let initialArray: string[] = [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      initialArray = parsed.map((item) => String(item));
    }
  } catch {
    // Ignore parse errors, start with empty array
  }

  const [items, setItems] = useState<string[]>(initialArray);

  // Handle input change for an item
  const handleItemChange = (idx: number, newValue: string) => {
    const newItems = items.map((item, i) => (i === idx ? newValue : item));
    setItems(newItems);
    onChange(JSON.stringify(newItems));
  };

  // Remove an item
  const handleRemove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add a new empty item
  const handleAdd = () => {
    setItems((prev) => [...prev, ""]);
  };

  return (
    <div className="space-y-2 pb-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(idx, e.target.value)}
            className="flex-grow p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            disabled={disabled}
            className="px-2 py-1 text-xs text-red-500 bg-gray-100 rounded hover:bg-red-100 disabled:opacity-50"
            aria-label="Remove item"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="p-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-100 disabled:opacity-50"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
