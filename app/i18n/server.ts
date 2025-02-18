import { defaultLocale, type Locale } from './config'

export async function setupServerLocale(locale: string) {
  // Validate locale
  const validLocale = locale as Locale || defaultLocale
  return validLocale
} 