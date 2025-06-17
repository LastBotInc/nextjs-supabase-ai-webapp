"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { KeyboardEvent } from "react";
import JsonArrayEditor from "./JsonArrayEditor";
import JsonObjectEditor from "./JsonObjectEditor";
import { isJsonArrayString, isJsonFormat, isJsonObjectString, isValidJsonObject } from "./utils";

interface Props {
  namespace: string;
  translationKey: string;
  locale: string;
  value: string;
  onSaveAction: (value: string) => Promise<void>;
}

export default function TranslationEditor({ locale, value, onSaveAction }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations("Admin.translations");
  // State for text edit mode
  const [isTextEditMode, setIsTextEditMode] = useState(false);
  const [textEditValue, setTextEditValue] = useState<string>("");
  const [textEditError, setTextEditError] = useState<string | null>(null);
  const [valueFormat, setValueFormat] = useState<"jsonArray" | "jsonObject" | "text">(
    isJsonObjectString(value) ? "jsonObject" : isJsonArrayString(value) ? "jsonArray" : "text"
  );

  const isJsonData = useCallback(() => valueFormat !== "text", [valueFormat]);

  // Reset edited value when value prop changes
  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  // Helper to check if a string is a JSON object (not array, not primitive)

  const handleSave = useCallback(
    async (valueToSave?: string) => {
      setIsSaving(true);
      setError(null);

      // If the value is a JSON object, validate the edited value as JSON before saving
      if (isJsonData()) {
        try {
          console.log("valueToSave", valueToSave);
          console.log("editedValue", editedValue);
          const isStillJSON =
            isJsonObjectString(valueToSave || editedValue) || isJsonArrayString(valueToSave || editedValue);
          if (!isStillJSON) {
            throw new Error("Not a valid JSON object");
          }
        } catch {
          setIsSaving(false);
          setError(t("editor.invalidJson"));
          return;
        }
      }

      try {
        await onSaveAction(valueToSave || editedValue);
        setIsEditing(false);
        toast.success(t("editor.success"));
      } catch (err) {
        console.error("Error saving translation:", err);
        setError(t("editor.error"));
        toast.error(t("editor.error"));
      } finally {
        setIsSaving(false);
      }
    },
    [editedValue, onSaveAction, t, isJsonData]
  );

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedValue(value);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Save on Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      // Cancel on Escape
      else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  // Generate translation using AI
  const handleGenerateTranslation = async () => {
    if (!value || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/translations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: value,
          targetLocale: locale,
        }),
      });

      const { translation, error } = await response.json();
      if (error) throw new Error(error);

      setEditedValue(translation);
      await handleSave(translation);
    } catch (err) {
      console.error("Translation generation error:", err);
      setError(t("editor.error"));
      toast.error(t("editor.error"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for saving in text edit mode
  const handleTextEditSave = () => {
    try {
      if (isJsonFormat(textEditValue)) {
        const parsed = JSON.parse(textEditValue);
        if (valueFormat === "jsonArray" && !Array.isArray(parsed)) throw new Error("Value must be a JSON array");
        if (valueFormat === "jsonObject" && !isValidJsonObject(parsed)) throw new Error("Value must be a JSON object");
      } else {
        setValueFormat("text");
      }
      setEditedValue(textEditValue);
      setIsTextEditMode(false);
      setTextEditError(null);
    } catch {
      setTextEditError("Invalid JSON array or object");
    }
  };

  // Handler for canceling text edit mode
  const handleTextEditCancel = () => {
    setIsTextEditMode(false);
    setTextEditError(null);
    setTextEditValue(editedValue);
  };

  if (isEditing) {
    // If in text edit mode, show textarea and Save/Cancel
    if (isTextEditMode) {
      return (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            rows={6}
            value={textEditValue}
            onChange={(e) => setTextEditValue(e.target.value)}
            disabled={isSaving}
          />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleTextEditSave}
              disabled={isSaving}
              className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleTextEditCancel}
              disabled={isSaving}
              className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {textEditError && <p className="text-xs text-red-500">{textEditError}</p>}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {valueFormat === "jsonArray" ? (
          <JsonArrayEditor
            value={editedValue}
            onChangeAction={async (jsonString) => {
              setEditedValue(jsonString);
            }}
            disabled={isSaving}
            error={error}
            locale={locale}
          />
        ) : valueFormat === "jsonObject" ? (
          <JsonObjectEditor
            value={(() => {
              try {
                const parsed = JSON.parse(editedValue);
                if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
                  return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
                }
              } catch {}
              return {};
            })()}
            onChangeAction={async (obj) => {
              setEditedValue(JSON.stringify(obj));
            }}
            disabled={isSaving}
            error={error}
            locale={locale}
          />
        ) : (
          <textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            placeholder={t("editor.placeholder") + (isJsonData() ? " (JSON array or object required)" : "")}
            rows={3}
          />
        )}
        <div className="flex space-x-2">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("editor.saving")}
              </>
            ) : (
              t("editor.save")
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {t("editor.cancel")}
          </button>
          {/* Edit as text button for JSON arrays/objects */}
          {isJsonData() && !isTextEditMode && (
            <button
              type="button"
              onClick={() => {
                setIsTextEditMode(true);
                setTextEditValue(editedValue);
                setTextEditError(null);
              }}
              disabled={isSaving}
              className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded self-end hover:bg-gray-200 disabled:opacity-50"
            >
              {"Edit as text"}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div
        onClick={() => setIsEditing(true)}
        onKeyDown={(e) => e.key === "Enter" && setIsEditing(true)}
        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 p-1 rounded flex-grow"
        tabIndex={0}
        role="button"
        aria-label={t("editor.edit")}
      >
        {value || <span className="text-gray-400 dark:text-gray-500">{t("editor.empty")}</span>}
      </div>
      {!value && locale !== "en" && (
        <button
          onClick={handleGenerateTranslation}
          disabled={isGenerating}
          className="ml-2 p-1 text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50"
          title={t("editor.generate")}
        >
          {isGenerating ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
