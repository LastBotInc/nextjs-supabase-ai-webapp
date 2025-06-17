export function isJsonFormat(str: string): boolean {
  return str.includes("[") || str.includes("{");
}
