"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import JsonObjectEditor from "./JsonObjectEditor";

interface JsonArrayEditorProps {
  value: string; // JSON stringified array
  onChangeAction: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  locale?: string;
}

// Helper to check if a value is a plain object (not array, not primitive)
function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function toStringObject(obj: Record<string, unknown>): Record<string, string> {
  // Convert all values to strings
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, String(v)]));
}

export default function JsonArrayEditor({ value, onChangeAction, disabled }: JsonArrayEditorProps) {
  // Parse the initial value as an array of string | object
  let initialArray: (string | Record<string, string>)[] = [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      initialArray = parsed.map((item) =>
        isPlainObject(item) ? toStringObject(item as Record<string, unknown>) : String(item)
      );
    }
  } catch {
    // Ignore parse errors, start with empty array
  }

  const [items, setItems] = useState<(string | Record<string, string>)[]>(initialArray);

  // Check if the array should be treated as objects (homogeneous)
  const isObjectArray = items.length > 0 && isPlainObject(items[0]);

  // Handle input change for an item (string or object)
  const handleItemChange = (idx: number, newValue: string | Record<string, string>) => {
    const newItems = items.map((item, i) => (i === idx ? newValue : item));
    setItems(newItems);
    onChangeAction(JSON.stringify(newItems));
  };

  // Remove an item
  const handleRemove = (idx: number) => {
    setItems((prev) => {
      const newItems = prev.filter((_, i) => i !== idx);
      onChangeAction(JSON.stringify(newItems));
      return newItems;
    });
  };

  // Add a new item: if object array, clone first object with empty values; else, add empty string
  const handleAdd = () => {
    setItems((prev) => {
      let newItems;
      if (isObjectArray && prev.length > 0 && isPlainObject(prev[0])) {
        // Clone first object, set all values to empty string
        const template = prev[0] as Record<string, string>;
        const emptyObj: Record<string, string> = Object.fromEntries(Object.keys(template).map((k) => [k, ""]));
        newItems = [...prev, emptyObj];
      } else {
        newItems = [...prev, ""];
      }
      onChangeAction(JSON.stringify(newItems));
      return newItems;
    });
  };

  return (
    <div className="space-y-2 pb-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          {isObjectArray ? (
            // Render JsonObjectEditor for all items if first is object
            <div className="flex-grow">
              <JsonObjectEditor
                value={item as Record<string, string>}
                onChangeAction={async (newObj) => handleItemChange(idx, newObj)}
                disabled={disabled}
                locale={undefined}
              />
            </div>
          ) : (
            // Render input for primitive items
            <input
              type="text"
              value={item as string}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              className="flex-grow p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
              disabled={disabled}
            />
          )}
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
