"use client";

import React, { useState } from "react";
import { stringify } from "./utils";

interface JsonObjectEditorProps {
  value: Record<string, string>; // JSON object
  onChangeAction: (obj: Record<string, string>) => Promise<void>;
  disabled?: boolean;
  error?: string | null;
  locale?: string;
}

export default function JsonObjectEditor({ value, onChangeAction: onChange, disabled }: JsonObjectEditorProps) {
  // Use the value prop directly as the object to edit
  const [fields, setFields] = useState<Record<string, string>>(value);

  // Handle input change for a key
  const handleFieldChange = (key: string, newValue: string) => {
    const newFields = { ...fields, [key]: newValue };
    setFields(newFields);
    onChange(newFields);
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
            value={stringify(val)}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="flex-grow p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
