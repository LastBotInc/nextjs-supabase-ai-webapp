import type { Locale } from './i18n/config'

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

async function loadTranslations(locale: Locale): Promise<Messages> {
  log('\n🌍 [i18n] ===== TRANSLATION LOADING START =====')
  log('🔍 [i18n] Loading translations for locale:', locale)
  
  // First load translations from JSON files as base
  let messages = {} as Messages
  
  try {
    messages = (await import(`@/messages/${locale}.json`)).default
    log('\n📄 [i18n] JSON translations loaded')
  } catch {
    log(`❌ [i18n] No JSON translations found for ${locale}, trying English...`)
    if (locale !== 'en') {
      try {
        messages = (await import(`@/messages/en.json`)).default
        log('\n📄 [i18n] English fallback JSON loaded')
      } catch (fallbackError) {
        console.error('❌ [i18n] Failed to load fallback translations:', fallbackError)
      }
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

  // If no translations at all, throw error
  if (Object.keys(messages).length === 0) {
    throw new Error(`❌ [i18n] No translations found for locale: ${locale}`)
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
    // Fallback to static JSON files
    try {
      const messages = (await import(`@/messages/${locale}.json`)).default
      return {
        messages,
        locale
      }
    } catch (staticError) {
      console.error('Error loading static translations:', staticError)
      // Final fallback - empty messages
      return {
        messages: {},
        locale
      }
    }
  }
}

export const dynamic = 'force-dynamic' 