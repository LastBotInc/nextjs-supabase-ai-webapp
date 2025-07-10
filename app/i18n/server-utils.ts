import { setRequestLocale } from 'next-intl/server';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { Locale, locales, defaultLocale } from './config'; // Assuming locales are in config

/**
 * For server components to get translation messages.
 */
export async function getMessages(locale: Locale) { // Typed locale
  // Make sure to configure `getMessages` with the correct path.
  // The rule used @/messages, which is ./messages from root.
  // From app/i18n, messages is at ../../messages
  return (await import(`../../messages/${locale}.json`)).default;
}

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

// Navigation utilities re-exported for server components
export const { Link, redirect, usePathname, useRouter } = 
  createSharedPathnamesNavigation({ locales, localePrefix: 'as-needed' }); // Use localePrefix as per common next-intl setup 