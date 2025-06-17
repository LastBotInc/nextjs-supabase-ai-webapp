export function isJsonFormat(str: string): boolean {
  return str.includes("[") || str.includes("{");
}

export function isValidJsonObject(target: unknown): boolean {
  return typeof target === "object" && target !== null &&
    !Array.isArray(target);
}

export function isJsonObjectString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return isValidJsonObject(parsed);
  } catch {
    return false;
  }
}

// Helper to check if a string is a JSON array
export function isJsonArrayString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}
