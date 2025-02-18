import { setRequestLocale } from 'next-intl/server';
import { Locale } from './config';

/**
 * Helper function to set up locale for server components.
 * Use this in all server components that need i18n.
 */
export async function setupServerLocale(locale: Locale) {
  // Set the locale for this request
  setRequestLocale(locale);
}

/**
 * Helper function to set up locale for metadata generation.
 * Use this in all generateMetadata functions.
 */
export async function setupMetadataLocale(locale: Locale) {
  // Set the locale for this request
  setRequestLocale(locale);
} 