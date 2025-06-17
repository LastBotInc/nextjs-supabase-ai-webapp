"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import JsonObjectEditor from "./JsonObjectEditor";
import { cloneAndClearObject, isJsonFormat, isValidJsonObject } from "./utils";

interface JsonArrayEditorProps {
  value: string; // JSON stringified array
  onChangeAction: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  locale?: string;
}

function valueToOriginalFormat(value: unknown): Record<string, string> | string | Error {
  if (typeof value === "object") {
    return (value as Record<string, string>) || "";
  }
  if (typeof value === "string") {
    if (isJsonFormat(value)) {
      try {
        return JSON.parse(value);
      } catch {
        return new Error("Invalid JSON format");
      }
    }
  }
  return String(value);
}

function toJsonObject(obj: Record<string, unknown>): Record<string, string | Record<string, string> | Error> {
  // Convert all values to strings or errors
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const formattedValue = valueToOriginalFormat(v);
      return [k, formattedValue];
    })
  );
}

export default function JsonArrayEditor({ value, onChangeAction, disabled }: JsonArrayEditorProps) {
  // Parse the initial value as an array of string | object
  let initialArray: (string | Record<string, string>)[] = [];
  const [errorField, setErrorField] = useState<[number, string] | null>(null);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      initialArray = parsed;
    }
  } catch {
    // Ignore parse errors, start with empty array
  }

  const [items, setItems] = useState<(string | Record<string, string>)[]>(initialArray);

  // Check if the array should be treated as objects (homogeneous)
  const isObjectArray = items.length > 0 && isValidJsonObject(items[0]);
  const isArrayArray = !isObjectArray && Array.isArray(items[0]);

  // Handle input change for an item (string or object)
  const handleItemChange = (idx: number, newValue: string | Record<string, string>) => {
    const newValueWithJSONValues = isValidJsonObject(newValue)
      ? toJsonObject(newValue as Record<string, string>)
      : isArrayArray && typeof newValue === "string"
      ? newValue.split(",")
      : newValue;
    const errorKey = Object.keys(newValueWithJSONValues).find(
      (k) => (newValueWithJSONValues as Record<string, string | Error>)[k] instanceof Error
    );
    if (errorKey) {
      setErrorField([idx, errorKey]);
    } else {
      setErrorField(null);

      const newItems = items.map((item, i) => (i === idx ? newValueWithJSONValues : item));
      setItems(newItems as Record<string, string>[] | string[]);
      onChangeAction(JSON.stringify(newItems));
    }
  };

  // Remove an item
  const handleRemove = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    onChangeAction(JSON.stringify(newItems));
  };

  // Add a new item: if object array, clone first object with empty values; else, add empty string
  const handleAdd = () => {
    const hasObjects = items.length > 0 && isValidJsonObject(items[0]);
    const newItem = hasObjects ? cloneAndClearObject(items[0] as Record<string, string>) : "";
    const newItems = [...items, newItem];
    setItems(newItems);
    onChangeAction(JSON.stringify(newItems));
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
              {errorField && errorField[0] === idx && (
                <p className="text-red-500 text-sm">{errorField[1]} has invalid value</p>
              )}
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
            className="p-2 text-xs text-red-500 bg-gray-100 rounded hover:bg-red-100 disabled:opacity-50"
            aria-label="Remove item"
          >
            <TrashIcon className="w-4 h-4" />
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
