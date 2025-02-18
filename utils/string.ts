/**
 * Converts a string to a URL-friendly slug
 * @param str String to convert to slug
 * @returns URL-friendly slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and _ with -
    .replace(/^-+|-+$/g, '') // Remove leading/trailing -
}

/**
 * Truncates a string to a maximum length, adding ellipsis if truncated
 * @param str String to truncate
 * @param maxLength Maximum length of the string
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str String to capitalize
 * @returns String with first letter of each word capitalized
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Removes HTML tags from a string
 * @param str String containing HTML
 * @returns String with HTML tags removed
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Extracts the first paragraph from an HTML string
 * @param html HTML string
 * @returns First paragraph text without HTML tags
 */
export function extractFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/)
  return match ? stripHtml(match[1]) : ''
}

/**
 * Generates a random string of specified length
 * @param length Length of the random string
 * @returns Random string
 */
export function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars.charAt(x % chars.length))
    .join('')
} 