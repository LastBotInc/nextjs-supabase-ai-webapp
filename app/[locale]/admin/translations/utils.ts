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

export function cloneAndClearObject(
  obj: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(Object.keys(obj).map((k) => [k, ""]));
}

export function stringify(
  obj: unknown,
): string {
  if (obj === "" || obj === null || obj === undefined) return "";
  if (isValidJsonObject(obj) || Array.isArray(obj)) return JSON.stringify(obj);
  return obj.toString();
}
