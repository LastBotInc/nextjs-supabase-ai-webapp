"use client";

import React, { useState } from "react";

interface JsonObjectEditorProps {
  value: string; // JSON stringified object
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  locale?: string;
}

export default function JsonObjectEditor({ value, onChange, disabled }: JsonObjectEditorProps) {
  // Parse the initial value as a JSON object, fallback to empty object if invalid
  let initialObject: Record<string, string> = {};
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      // Convert all values to strings for editing
      initialObject = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
    }
  } catch {
    // Ignore parse errors, start with empty object
  }

  const [fields, setFields] = useState<Record<string, string>>(initialObject);

  // Handle input change for a key
  const handleFieldChange = (key: string, newValue: string) => {
    const newFields = { ...fields, [key]: newValue };
    setFields(newFields);
    onChange(JSON.stringify(newFields));
  };

  return (
    <div className="space-y-2 pb-4">
      {Object.entries(fields).map(([key, val]) => (
        <div key={key} className="flex items-center space-x-2">
          <label className="text-gray-700 dark:text-gray-300 font-semibold" htmlFor={`jsonobj-${key}`}>
            {key}:
          </label>
          <input
            id={`jsonobj-${key}`}
            type="text"
            value={val}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="flex-grow p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
