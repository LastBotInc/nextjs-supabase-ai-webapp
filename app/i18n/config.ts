export type Locale = string;

export const defaultLocale: Locale = 'fi';

// This is used for static generation and initial config
export const staticLocales: Locale[] = ['fi', 'en', 'sv'];

// Export locales for next-intl
export const locales = staticLocales;

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Function to get enabled locales from the database
export async function getEnabledLocales(): Promise<Locale[]> {
  // During build time or when NEXT_PUBLIC_SITE_URL is not available, use static locales
  if (!process.env.NEXT_PUBLIC_SITE_URL || process.env.NODE_ENV === 'production') {
    console.log('Using static locales for build:', staticLocales);
    return staticLocales;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/languages`);
    const { data, error } = await response.json();
    
    if (error) throw new Error(error);
    
    // Filter enabled languages and map to locale codes
    const enabledLocales = data
      .filter((lang: { enabled: boolean }) => lang.enabled)
      .map((lang: { code: string }) => lang.code);
    
    // If no enabled locales found, fallback to static locales
    if (!enabledLocales?.length) {
      console.log('No enabled locales found, using static locales:', staticLocales);
      return staticLocales;
    }

    return enabledLocales;
  } catch (err) {
    console.error('Error fetching enabled locales:', err);
    console.log('Falling back to static locales:', staticLocales);
    return staticLocales;
  }
}

// Define a recursive type for nested messages
type NestedMessages = {
  [key: string]: string | string[] | NestedMessages;
};

interface I18nConfig {
  messages: NestedMessages;
  timeZone: string;
}

// Function to recursively merge multiple translation objects
function mergeTranslations(...objects: NestedMessages[]): NestedMessages {
  const result: NestedMessages = {};

  for (const obj of objects) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
            typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          // If both properties are objects, merge them recursively
          result[key] = mergeTranslations(result[key] as NestedMessages, value as NestedMessages);
        } else {
          // Otherwise, overwrite the property
          result[key] = value;
        }
      }
    }
  }

  return result;
}

// Load namespaces from individual files - server only function
// This was removed because it requires filesystem access that's not available during build
// async function loadNamespacesFromFiles(locale: Locale): Promise<NestedMessages> { ... }

// Load namespaces using dynamic imports - works in both client and server
import { availableNamespaces } from '@/app/i18n/generated/namespaces'; // Path relative to config.ts
async function loadNamespacesUsingImport(locale: Locale): Promise<NestedMessages> {
  console.log(`Loading namespaces using dynamic imports for ${locale}`);
  
  const namespaces: NestedMessages = {};
  
  // We use a dynamic import.meta.glob pattern which Vite/Webpack will handle
  try {
    // Remove the test load for Navigation if it's covered by availableNamespaces
    // Or keep it if it serves a specific purpose (e.g., early test)
    // For now, let's rely on the generated list for all.

    for (const namespace of availableNamespaces) {
      try {
        const module = await import(`@/messages/${locale}/${namespace}.json`).then(m => m.default);
        namespaces[namespace] = module;
      } catch (error) {
        // Continue with other namespaces
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[i18n] Namespace not found or failed to load in config.ts: ${namespace} for locale ${locale}. Error: ${errorMessage}`);
      }
    }
    
    return namespaces;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading namespaces using import for ${locale} in config.ts:`, errorMessage);
    throw error;
  }
}

// Fallback to loading monolithic translation file if namespace-based loading fails
async function loadMonolithicTranslation(locale: Locale): Promise<NestedMessages> {
  try {
    console.warn(`Attempting to load translations for ${locale}...`);
    
    // Try to use dynamic imports of namespace files since we no longer have monolithic files
    try {
      // We'll try to load namespaces directly using the namespace folder structure
      console.log('Using namespace-based imports as fallback');
      
      const namespaces: NestedMessages = {};
      
      // Try to load some common namespaces
      const commonNamespaces = [
        'Navigation', 
        'Common', 
        'Footer', 
        'Auth', 
        'Blog', 
        'Index'
      ];
      
      for (const namespace of commonNamespaces) {
        try {
          const module = await import(`@/messages/${locale}/${namespace}.json`).then(m => m.default);
          namespaces[namespace] = module;
        } catch (nsError) {
          // Continue with other namespaces
        }
      }
      
      if (Object.keys(namespaces).length > 0) {
        return namespaces;
      }
      
      // If we couldn't load any namespaces and this isn't the default locale, try default locale
      if (locale !== defaultLocale) {
        console.warn(`Falling back to default locale (${defaultLocale})`);
        return loadMonolithicTranslation(defaultLocale);
      }
      
      // If we're already at the default locale and it failed, return an empty object
      console.error('Critical error: Failed to load even the default locale translation');
      return {};
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
      return {};
    }
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    return {};
  }
}

export async function getI18nConfig({ locale }: { locale: Locale }): Promise<I18nConfig> {
  console.log(`Loading translations for locale: ${locale}`);
  
  let messages: NestedMessages = {};
  
  try {
    // First try to load translations using dynamic imports (this works in both client and server)
    messages = await loadNamespacesUsingImport(locale);
    console.log(`Successfully loaded namespace-based translations for ${locale} using imports`);

    // If no translations were loaded, fall back to monolithic translation
    if (Object.keys(messages).length === 0) {
      console.warn(`No translations loaded for ${locale}, trying monolithic fallback`);
      messages = await loadMonolithicTranslation(locale);
    }
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    
    // Try monolithic translation as a last resort
    try {
      console.warn(`Trying monolithic fallback for ${locale}`);
      messages = await loadMonolithicTranslation(locale);
    } catch (fallbackError) {
      console.error(`Failed to load even monolithic fallback for ${locale}:`, fallbackError);
      
      // If all else fails, try default locale
      if (locale !== defaultLocale) {
        console.warn(`Attempting to use default locale (${defaultLocale}) as last resort`);
        try {
          messages = await loadNamespacesUsingImport(defaultLocale);
        } catch (defLocaleError) {
          console.error(`Failed to load default locale:`, defLocaleError);
          // If everything fails, return empty messages
          messages = {};
        }
      }
    }
  }
  
  return {
    messages,
    timeZone: 'Europe/Helsinki', // Default time zone
  };
} 