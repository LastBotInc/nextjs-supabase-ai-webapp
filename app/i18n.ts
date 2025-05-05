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
    const commonNamespaces = [
      'Common', 'Home', 'LeasingSolutions', 'Meta', 'About', 'Account', 
      'Admin', 'Auth', 'Blog', 'Contact', 'CookieConsent', 'LandingPages', 
      'Media', 'Navigation', 'Presentations', 'Privacy', 'Profile', 
      'Footer', 'Index'
      // Removed: 'Booking', 'Analytics', 'Security', 'User' (if they don't have corresponding files)
    ];
    
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
async function loadNamespacesFromFiles(locale: Locale): Promise<Messages> {
  log('📁 [i18n] Loading namespace files from filesystem for locale:', locale)
  
  // Only run on server
  if (!isServer) {
    log('⚠️ [i18n] Attempted to use filesystem on client side')
    return {}
  }
  
  try {
    // For server-side rendering, dynamically import fs modules
    const { promises: fs } = await import('fs')
    const path = await import('path')
    
    const namespaceDirPath = path.join(process.cwd(), 'messages', locale)
    let namespaceFiles: string[] = []
    
    try {
      // Check if directory exists and read files
      namespaceFiles = await fs.readdir(namespaceDirPath)
        .then(files => files.filter((file: string) => file.endsWith('.json')))
    } catch (dirError) {
      log(`❌ [i18n] Namespace directory for ${locale} does not exist or cannot be read`)
      throw dirError
    }
    
    if (namespaceFiles.length === 0) {
      log(`⚠️ [i18n] No namespace files found for locale: ${locale}`)
      throw new Error(`No namespace files found for locale: ${locale}`)
    }
    
    // Load and combine all namespace files
    const messages: Messages = {}
    
    for (const file of namespaceFiles) {
      const namespaceName = path.basename(file, '.json')
      const filePath = path.join(namespaceDirPath, file)
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf8')
        const namespaceData = JSON.parse(fileContent)
        messages[namespaceName] = namespaceData
        log(`✅ [i18n] Loaded namespace: ${namespaceName}`)
      } catch (fileError) {
        log(`❌ [i18n] Error loading namespace file ${file}:`, fileError)
        // Continue with other files
      }
    }
    
    return messages
  } catch (error) {
    log(`❌ [i18n] Error loading namespace files for ${locale}:`, error)
    throw error
  }
}

// Fallback to loading monolithic translation file
async function loadMonolithicFile(locale: Locale): Promise<Messages> {
  log('📄 [i18n] Attempting to load translations for:', locale)
  
  try {
    // Updated list based on actual files in messages/en/
    const commonNamespaces = [
      'Common', 'Home', 'LeasingSolutions', 'Meta', 'About', 'Account', 
      'Admin', 'Auth', 'Blog', 'Contact', 'CookieConsent', 'LandingPages', 
      'Media', 'Navigation', 'Presentations', 'Privacy', 'Profile', 
      'Footer', 'Index'
      // Removed: 'Booking', 'Analytics', 'Security', 'User'
    ];
    
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
      log('📁 [i18n] Namespace files loaded successfully using imports')
    } 
    // If no namespaces were found and we're on server, try filesystem
    else if (isServer) {
      try {
        messages = await loadNamespacesFromFiles(locale)
        log('📁 [i18n] Namespace files loaded successfully using filesystem')
      } catch (fsError) {
        throw fsError
      }
    } 
    // If client-side and dynamic imports failed, throw to trigger fallback
    else {
      throw new Error('Dynamic imports failed and cannot use filesystem on client')
    }
  } catch (namespaceError) {
    log('⚠️ [i18n] Failed to load namespace files, falling back to monolithic file')
    try {
      messages = await loadMonolithicFile(locale)
    } catch (monolithicError) {
      log('❌ [i18n] Failed to load monolithic file')
      // If we've tried both methods and failed, let's create an empty messages object
      messages = {}
    }
  }

  // Then get translations from database to override JSON values
  log('\n🔌 [i18n] Fetching database translations for locale:', locale)
  
  try {
    // Check if we're in a browser environment
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/i18n?locale=${locale}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response but got ${contentType}`)
    }

    const { data: dbTranslations, error } = await response.json()

    if (error) {
      console.error('\n❌ [i18n] Database translations error:', error)
      // If database fetch fails, return JSON translations
      log('⚠️ [i18n] Using JSON translations as fallback')
      return messages
    }

    if (dbTranslations) {
      log('\n💾 [i18n] Database translations received')
      
      // Process each namespace's translations
      Object.entries(dbTranslations).forEach(([namespace, translations]) => {
        log('\n🔄 [i18n] Processing namespace:', namespace)
        
        // Convert the translations to a flat object with proper keys
        const flatTranslations: Record<string, string> = {}
        Object.entries(translations as Record<string, string>).forEach(([key, value]) => {
          // Remove namespace prefix if it exists in the key
          const cleanKey = key.startsWith(`${namespace}.`) ? key.slice(namespace.length + 1) : key
          flatTranslations[cleanKey] = value
        })
        
        // Convert flat translations to nested structure
        const nestedTranslations = flatToNested(flatTranslations)
        
        // Merge with existing messages
        if (!messages[namespace]) {
          messages[namespace] = {}
        }
        messages[namespace] = deepMerge(
          messages[namespace] as NestedRecord,
          nestedTranslations
        ) as Messages
      })
    } else {
      log('\n⚠️ [i18n] No database translations received')
    }
  } catch (queryError) {
    console.error('\n❌ [i18n] Database query error:', queryError)
    // Return JSON translations on error
    return messages
  }

  // If no translations at all, log a warning
  if (Object.keys(messages).length === 0) {
    console.warn(`⚠️ [i18n] No translations found for locale: ${locale}`)
  }

  log('\n✅ [i18n] Translation loading completed successfully')
  log('🌍 [i18n] ===== TRANSLATION LOADING END =====\n')

  return messages
}

export default async function getI18nConfig({ locale }: { locale: Locale }) {
  try {
    // Always try to get translations from cache first
    const messages = await getTranslationsWithCache(locale)
    return {
      messages,
      locale
    }
  } catch (error) {
    console.error('Error loading translations:', error)
    // Fallback to empty messages
    return {
      messages: {},
      locale
    }
  }
}

export const dynamic = 'force-dynamic' 