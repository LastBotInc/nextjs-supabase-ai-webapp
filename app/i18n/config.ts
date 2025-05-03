export type Locale = string;

export const defaultLocale: Locale = 'en';

// This is used for static generation and initial config
export const staticLocales: Locale[] = ['en', 'fi', 'sv'];

// Export locales for next-intl
export const locales = staticLocales;

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

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Load namespaces from individual files - server only function
async function loadNamespacesFromFiles(locale: Locale): Promise<NestedMessages> {
  // Only run this on the server
  if (!isServer) {
    console.warn('Attempted to load namespace files on the client side.');
    return {};
  }

  try {
    // Only import fs and path in a server context
    if (typeof process === 'undefined') {
      console.error('Cannot import fs/path: Not in a Node.js environment');
      return {};
    }
    
    // Dynamic imports with additional server-side check
    const fs = (await import('fs')).promises;
    const path = await import('path');
    
    // Get the absolute path to the namespace directory
    const namespaceDirPath = path.join(process.cwd(), 'messages', locale);
    
    try {
      // Check if the directory exists
      await fs.access(namespaceDirPath);
    } catch (error) {
      console.error(`Namespace directory for ${locale} does not exist:`, namespaceDirPath);
      throw error;
    }
    
    // Read all JSON files in the directory
    const files = await fs.readdir(namespaceDirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Load each namespace file
    const namespaces: NestedMessages = {};
    
    for (const file of jsonFiles) {
      const namespaceName = path.basename(file, '.json');
      const filePath = path.join(namespaceDirPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      try {
        // Parse the JSON content
        const namespaceContent = JSON.parse(content);
        
        // Create a namespace object with the namespace name as the key
        namespaces[namespaceName] = namespaceContent;
      } catch (error) {
        console.error(`Error parsing JSON file ${filePath}:`, error);
        // Continue with other files
      }
    }
    
    return namespaces;
  } catch (error) {
    console.error(`Error loading namespace files for ${locale}:`, error);
    throw error;
  }
}

// Load namespaces using dynamic imports - works in both client and server
async function loadNamespacesUsingImport(locale: Locale): Promise<NestedMessages> {
  console.log(`Loading namespaces using dynamic imports for ${locale}`);
  
  const namespaces: NestedMessages = {};
  
  // We use a dynamic import.meta.glob pattern which Vite/Webpack will handle
  try {
    // Try to load the navigation namespace first as a test
    try {
      const Navigation = await import(`@/messages/${locale}/Navigation.json`).then(m => m.default);
      namespaces.Navigation = Navigation;
    } catch (error) {
      console.warn(`Navigation namespace not found for ${locale}`);
    }
    
    // Try to load common namespaces that are likely to exist
    const commonNamespaces = [
      'Common', 
      'Footer', 
      'Auth', 
      'Blog', 
      'Index',
      'CookieConsent',
      'Booking',
      'Account',
      'Admin',
      'Analytics',
      'LandingPage',
      'Contact',
      'Media',
      'Profile',
      'Security',
      'User'
    ];
    
    for (const namespace of commonNamespaces) {
      try {
        const module = await import(`@/messages/${locale}/${namespace}.json`).then(m => m.default);
        namespaces[namespace] = module;
      } catch (error) {
        // Continue with other namespaces
      }
    }
    
    return namespaces;
  } catch (error) {
    console.error(`Error loading namespaces using import for ${locale}:`, error);
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
  
  try {
    let messages: NestedMessages = {};
    
    // Try loading using dynamic imports first (works in both client/server)
    try {
      messages = await loadNamespacesUsingImport(locale);
      
      // If we got some namespaces, use them
      if (Object.keys(messages).length > 0) {
        console.log(`Successfully loaded namespace-based translations for ${locale} using imports`);
      } else {
        // If no namespaces were found, attempt server-side file loading
        if (isServer) {
          messages = await loadNamespacesFromFiles(locale);
          console.log(`Successfully loaded namespace-based translations for ${locale} using filesystem`);
        } else {
          throw new Error(`No namespace files found for locale: ${locale}`);
        }
      }
    } catch (error) {
      console.warn(`Failed to load namespace-based translations for ${locale}:`, error);
      
      // Fallback to monolithic translation file
      messages = await loadMonolithicTranslation(locale);
    }
    
    return {
      messages,
      timeZone: 'Europe/Helsinki'
    };
  } catch (error) {
    console.error(`Critical error loading translations:`, error);
    
    // Emergency fallback to an empty object
    return {
      messages: {},
      timeZone: 'Europe/Helsinki'
    };
  }
} 