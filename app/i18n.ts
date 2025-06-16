import { getNamespaces } from '@/utils/i18n-helpers';
import type { Locale } from './i18n/config'

// Check if we're running on the server
const isServer = typeof window === 'undefined';

// Define nested record type for translations
type NestedRecord = {
  [key: string]: string | string[] | NestedRecord | NestedRecord[]
}

// Define message structure
type Messages = {
  [key: string]: string | string[] | Messages | Messages[] | undefined
}

// Cache for translations with 5-second TTL in development, 30 seconds in production
const CACHE_TTL = process.env.NODE_ENV === 'development' ? 5 * 1000 : 30 * 1000

// Translation cache Map
const translationCache = new Map<string, { data: Messages, timestamp: number }>()

// Convert flat object with dot notation to nested object
function flatToNested(obj: Record<string, string>): NestedRecord {
  const result: NestedRecord = {}
  
  for (const key in obj) {
    const keys = key.split('.')
    let current = result
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = (current[keys[i]] || {}) as NestedRecord
      current = current[keys[i]] as NestedRecord
    }
    
    current[keys[keys.length - 1]] = obj[key]
  }
  
  return result
}

// Deep merge function for translations
function deepMerge(target: NestedRecord, source: NestedRecord): NestedRecord {
  const result = { ...target }
  
  for (const key in source) {
    if (source[key] === null || source[key] === undefined) {
      continue
    }
    
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] || {}) as NestedRecord,
        source[key] as NestedRecord
      )
    } else {
      result[key] = source[key]
    }
  }
  
  return result
}

// Logging configuration
const DEBUG_MODE = process.env.NODE_ENV === 'development' && process.env.DEBUG_I18N === 'true'

function log(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

// Cache invalidation function
export function invalidateTranslationCache(locale?: Locale) {
  if (locale) {
    translationCache.delete(locale)
    log('🗑️ [i18n] Cache invalidated for locale:', locale)
  } else {
    translationCache.clear()
    log('🗑️ [i18n] Cache cleared for all locales')
  }
}

async function getTranslationsWithCache(locale: Locale, forceRefresh = false): Promise<Messages> {
  const now = Date.now()
  const cached = translationCache.get(locale)
  
  // Return cached translations if they exist, haven't expired, and no force refresh
  if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
    log('🎯 [i18n] Using cached translations for:', locale)
    return cached.data
  }

  // Load translations
  const messages = await loadTranslations(locale)
  
  // Cache the new translations
  translationCache.set(locale, { data: messages, timestamp: now })
  log('💾 [i18n] Cached new translations for:', locale)
  
  return messages
}

// Load namespaces using dynamic imports - works in both client and server
async function loadNamespacesUsingImport(locale: Locale): Promise<Messages> {
  log('📁 [i18n] Loading namespace files for locale using dynamic imports:', locale)
  
  const namespaces: Messages = {}
  
  try {
    // Updated list based on actual files in messages/en/
    const commonNamespaces = getNamespaces()
    
    for (const namespace of commonNamespaces) {
      try {
        const module = await import(`@/messages/${locale}/${namespace}.json`).then(m => m.default)
        namespaces[namespace] = module
        log(`✅ [i18n] Loaded namespace: ${namespace}`)
      } catch (error) {
        // Continue with other namespaces
        log(`⚠️ [i18n] Namespace not found: ${namespace}`)
      }
    }
    
    return namespaces
  } catch (error) {
    log(`❌ [i18n] Error loading namespaces using import for ${locale}:`, error)
    throw error
  }
}

// Helper function to load all namespace files from a locale directory - server only
// We skip this implementation for client-side rendering
// This function requires fs module which is only available in Node.js environment
async function loadNamespacesFromFiles(locale: Locale): Promise<Messages> {
  log('📁 [i18n] Loading namespace files from filesystem for locale:', locale)
  
  // Only run on server
  if (!isServer) {
    log('⚠️ [i18n] Attempted to use filesystem on client side')
    return {}
  }
  
  // This function is implemented on the server only
  // For build time, we'll rely on import method instead
  log('⚠️ [i18n] File system operations are not available during build')
  return loadNamespacesUsingImport(locale)
}

// Fallback to loading monolithic translation file
async function loadMonolithicFile(locale: Locale): Promise<Messages> {
  log('📄 [i18n] Attempting to load translations for:', locale)
  
  try {
    // Updated list based on actual files in messages/en/
    const commonNamespaces = getNamespaces()
    
    // Try to use dynamic imports of namespace files since we no longer have monolithic files
    try {
      // We'll try to load namespaces directly using the namespace folder structure
      console.log('Using namespace-based imports as fallback');
      
      const namespaces: Messages = {};
      
      for (const namespace of commonNamespaces) {
        try {
          const module = await import(`@/messages/${locale}/${namespace}.json`).then(m => m.default)
          namespaces[namespace] = module
          log(`✅ [i18n] Loaded namespace: ${namespace}`)
        } catch (error) {
          // Continue with other namespaces
          log(`⚠️ [i18n] Namespace not found: ${namespace}`)
        }
      }
      
      return namespaces;
    } catch (error) {
      log(`❌ [i18n] Failed to load namespaces for ${locale}`)
      
      // If not the default locale, try the default locale
      if (locale !== 'en') {
        log('⚠️ [i18n] Falling back to English...')
        try {
          return await loadNamespacesUsingImport('en')
        } catch (fallbackError) {
          log('❌ [i18n] Failed to load English fallback:', fallbackError)
        }
      }
      
      // Return empty object if all attempts fail
      return {}
    }
  } catch (error) {
    log(`❌ [i18n] Error loading translations for ${locale}:`, error)
    return {}
  }
}

async function loadTranslations(locale: Locale): Promise<Messages> {
  log('\n🌍 [i18n] ===== TRANSLATION LOADING START =====')
  log('🔍 [i18n] Loading translations for locale:', locale)
  
  // First try to load translations from namespace-based folder structure
  let messages: Messages = {}
  try {
    // First try using dynamic imports (works on both client and server)
    messages = await loadNamespacesUsingImport(locale)
    
    // If we got some namespaces, great! 
    if (Object.keys(messages).length > 0) {
      log('✅ [i18n] Successfully loaded namespace-based translations for', locale, 'using imports')
      //return messages
    }
    
    // If dynamic imports didn't yield results, try API (on client) or file system (on server)
    log('⚠️ [i18n] No namespaces loaded using imports, trying alternative methods')
    
    if (!isServer) {
      // On client-side, try to fetch from translation API
      try {
        log('🔍 [i18n] Fetching translations from API for', locale)
        const apiUrl = `/api/translations?locale=${locale}`
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (data.translations && Object.keys(data.translations).length > 0) {
          log('✅ [i18n] Successfully loaded translations from API for', locale)
          return data.translations
        }
        
        log('⚠️ [i18n] API returned empty translations for', locale)
      } catch (apiError) {
        log('❌ [i18n] Error fetching translations from API:', apiError)
      }
    }
    
    // Fallback to monolithic file as a last resort (we might not have this anymore)
    log('⚠️ [i18n] Falling back to monolithic file for', locale)
    return loadMonolithicFile(locale)
  } catch (error) {
    log(`❌ [i18n] Error loading namespace-based translations for ${locale}:`, error)
    
    // If namespace-based loading fails, try monolithic file
    log('⚠️ [i18n] Attempting to load monolithic file as fallback for', locale)
    return loadMonolithicFile(locale)
  } finally {
    log('🌍 [i18n] ===== TRANSLATION LOADING END =====\n')
  }
}

export async function getTranslations(locale: Locale): Promise<Messages> {
  return getTranslationsWithCache(locale)
}

export default async function getI18nConfig({ locale }: { locale: Locale }) {
  const messages = await getTranslations(locale)
  
  return {
    messages,
    // Default timeZone - can be overridden per-user if needed
    timeZone: 'Europe/Helsinki',
  }
}

export const dynamic = 'force-dynamic' 