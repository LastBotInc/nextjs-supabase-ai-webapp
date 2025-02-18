'use client';

import { defaultLocale, type Locale } from './config';

// Client-side locale detection
export function getClientLocale(): Locale {
  // Use browser's language preference as fallback
  const browserLocale = typeof window !== 'undefined' 
    ? window.navigator.language.split('-')[0]
    : defaultLocale;
  
  return browserLocale as Locale;
}
