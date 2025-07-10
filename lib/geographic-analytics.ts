/**
 * Geographic Analytics Library
 * Provides comprehensive location and language tracking capabilities
 */

export interface GeographicData {
  // Location data
  country: string
  countryCode: string
  region: string
  regionCode: string
  city: string
  latitude: number | null
  longitude: number | null
  timezone: string
  
  // Language data
  browserLanguage: string
  browserLanguages: string[]
  acceptLanguage: string
  preferredLanguage: string
  
  // Additional context
  continent: string
  currency: string
  isp: string | null
  organization: string | null
  asn: string | null
  
  // Derived insights
  isEU: boolean
  isGDPRRegion: boolean
  marketingRegion: string
  languageFamily: string
}

export interface LanguageInfo {
  code: string
  name: string
  nativeName: string
  family: string
  direction: 'ltr' | 'rtl'
  region: string[]
}

// Language database for comprehensive language analysis
const LANGUAGE_DATABASE: Record<string, LanguageInfo> = {
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    family: 'Germanic',
    direction: 'ltr',
    region: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA']
  },
  'fi': {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    family: 'Finno-Ugric',
    direction: 'ltr',
    region: ['FI']
  },
  'sv': {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    family: 'Germanic',
    direction: 'ltr',
    region: ['SE', 'FI']
  },
  'no': {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    family: 'Germanic',
    direction: 'ltr',
    region: ['NO']
  },
  'da': {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    family: 'Germanic',
    direction: 'ltr',
    region: ['DK']
  },
  'de': {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    family: 'Germanic',
    direction: 'ltr',
    region: ['DE', 'AT', 'CH']
  },
  'fr': {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    family: 'Romance',
    direction: 'ltr',
    region: ['FR', 'BE', 'CH', 'CA']
  },
  'es': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    family: 'Romance',
    direction: 'ltr',
    region: ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'GQ']
  },
  'it': {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    family: 'Romance',
    direction: 'ltr',
    region: ['IT', 'CH', 'SM', 'VA']
  },
  'pt': {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    family: 'Romance',
    direction: 'ltr',
    region: ['PT', 'BR', 'AO', 'MZ', 'GW', 'CV', 'ST', 'TL']
  },
  'ru': {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    family: 'Slavic',
    direction: 'ltr',
    region: ['RU', 'BY', 'KZ', 'KG', 'TJ']
  },
  'zh': {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    family: 'Sino-Tibetan',
    direction: 'ltr',
    region: ['CN', 'TW', 'HK', 'SG']
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    family: 'Japonic',
    direction: 'ltr',
    region: ['JP']
  },
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    family: 'Koreanic',
    direction: 'ltr',
    region: ['KR', 'KP']
  },
  'ar': {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    family: 'Semitic',
    direction: 'rtl',
    region: ['SA', 'EG', 'AE', 'DZ', 'SD', 'IQ', 'MA', 'YE', 'SY', 'TN', 'JO', 'LY', 'LB', 'PS', 'OM', 'KW', 'MR', 'QA', 'BH', 'DJ', 'KM']
  },
  'hi': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    family: 'Indo-European',
    direction: 'ltr',
    region: ['IN']
  }
}

// EU countries for GDPR compliance detection
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
]

// GDPR-applicable regions (EU + EEA + UK)
const GDPR_COUNTRIES = [...EU_COUNTRIES, 'IS', 'LI', 'NO', 'GB', 'CH']

/**
 * Detect browser languages and preferences
 */
export function detectBrowserLanguages(): {
  browserLanguage: string
  browserLanguages: string[]
  preferredLanguage: string
} {
  if (typeof window === 'undefined') {
    return {
      browserLanguage: 'en',
      browserLanguages: ['en'],
      preferredLanguage: 'en'
    }
  }

  const browserLanguage = navigator.language || 'en'
  const browserLanguages = Array.from(navigator.languages || [browserLanguage])
  
  // Find the most preferred language that we support
  const supportedLanguages = Object.keys(LANGUAGE_DATABASE)
  const preferredLanguage = browserLanguages.find(lang => {
    const langCode = lang.split('-')[0].toLowerCase()
    return supportedLanguages.includes(langCode)
  })?.split('-')[0].toLowerCase() || 'en'

  return {
    browserLanguage: browserLanguage.toLowerCase(),
    browserLanguages: browserLanguages.map(lang => lang.toLowerCase()),
    preferredLanguage
  }
}

/**
 * Get language information from language code
 */
export function getLanguageInfo(languageCode: string): LanguageInfo {
  const code = languageCode.split('-')[0].toLowerCase()
  return LANGUAGE_DATABASE[code] || LANGUAGE_DATABASE['en']
}

/**
 * Determine marketing region based on country and language
 */
export function getMarketingRegion(countryCode: string, languageCode: string): string {
  const country = countryCode.toUpperCase()
  const lang = languageCode.split('-')[0].toLowerCase()

  // Nordic region
  if (['FI', 'SE', 'NO', 'DK', 'IS'].includes(country)) {
    return 'Nordic'
  }

  // DACH region (German-speaking)
  if (['DE', 'AT', 'CH'].includes(country) || lang === 'de') {
    return 'DACH'
  }

  // Benelux
  if (['BE', 'NL', 'LU'].includes(country)) {
    return 'Benelux'
  }

  // UK & Ireland
  if (['GB', 'IE'].includes(country)) {
    return 'UK & Ireland'
  }

  // North America
  if (['US', 'CA'].includes(country)) {
    return 'North America'
  }

  // Latin America
  if (['MX', 'AR', 'BR', 'CL', 'CO', 'PE', 'VE'].includes(country) || lang === 'es' || lang === 'pt') {
    return 'Latin America'
  }

  // Asia Pacific
  if (['JP', 'KR', 'CN', 'IN', 'AU', 'NZ', 'SG', 'HK', 'TW'].includes(country)) {
    return 'Asia Pacific'
  }

  // Middle East & Africa
  if (['AE', 'SA', 'EG', 'ZA', 'NG', 'KE'].includes(country) || lang === 'ar') {
    return 'Middle East & Africa'
  }

  // Eastern Europe
  if (['RU', 'PL', 'CZ', 'HU', 'RO', 'BG', 'UA', 'BY'].includes(country) || lang === 'ru') {
    return 'Eastern Europe'
  }

  // Western Europe (default for EU countries)
  if (EU_COUNTRIES.includes(country)) {
    return 'Western Europe'
  }

  return 'Other'
}

/**
 * Get timezone from browser
 */
export function getTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC'
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Get currency for a country
 */
export function getCurrencyForCountry(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    'US': 'USD', 'GB': 'GBP', 'EU': 'EUR', 'JP': 'JPY', 'CN': 'CNY',
    'CA': 'CAD', 'AU': 'AUD', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK',
    'DK': 'DKK', 'FI': 'EUR', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR',
    'ES': 'EUR', 'NL': 'EUR', 'BE': 'EUR', 'AT': 'EUR', 'IE': 'EUR',
    'PT': 'EUR', 'GR': 'EUR', 'RU': 'RUB', 'IN': 'INR', 'BR': 'BRL',
    'KR': 'KRW', 'MX': 'MXN', 'AR': 'ARS', 'ZA': 'ZAR', 'TR': 'TRY',
    'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF', 'RO': 'RON', 'BG': 'BGN'
  }

  return currencyMap[countryCode.toUpperCase()] || 'USD'
}

/**
 * Get continent for a country
 */
export function getContinentForCountry(countryCode: string): string {
  const continentMap: Record<string, string> = {
    // Europe
    'AD': 'Europe', 'AL': 'Europe', 'AT': 'Europe', 'BA': 'Europe', 'BE': 'Europe',
    'BG': 'Europe', 'BY': 'Europe', 'CH': 'Europe', 'CZ': 'Europe', 'DE': 'Europe',
    'DK': 'Europe', 'EE': 'Europe', 'ES': 'Europe', 'FI': 'Europe', 'FR': 'Europe',
    'GB': 'Europe', 'GR': 'Europe', 'HR': 'Europe', 'HU': 'Europe', 'IE': 'Europe',
    'IS': 'Europe', 'IT': 'Europe', 'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe',
    'LV': 'Europe', 'MC': 'Europe', 'MD': 'Europe', 'ME': 'Europe', 'MK': 'Europe',
    'MT': 'Europe', 'NL': 'Europe', 'NO': 'Europe', 'PL': 'Europe', 'PT': 'Europe',
    'RO': 'Europe', 'RS': 'Europe', 'RU': 'Europe', 'SE': 'Europe', 'SI': 'Europe',
    'SK': 'Europe', 'SM': 'Europe', 'UA': 'Europe', 'VA': 'Europe',

    // North America
    'CA': 'North America', 'US': 'North America', 'MX': 'North America',
    'GT': 'North America', 'BZ': 'North America', 'SV': 'North America',
    'HN': 'North America', 'NI': 'North America', 'CR': 'North America', 'PA': 'North America',

    // South America
    'AR': 'South America', 'BO': 'South America', 'BR': 'South America', 'CL': 'South America',
    'CO': 'South America', 'EC': 'South America', 'FK': 'South America', 'GF': 'South America',
    'GY': 'South America', 'PE': 'South America', 'PY': 'South America', 'SR': 'South America',
    'UY': 'South America', 'VE': 'South America',

    // Asia
    'AF': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'BH': 'Asia', 'BD': 'Asia', 'BT': 'Asia',
    'BN': 'Asia', 'KH': 'Asia', 'CN': 'Asia', 'CY': 'Asia', 'GE': 'Asia', 'HK': 'Asia',
    'IN': 'Asia', 'ID': 'Asia', 'IR': 'Asia', 'IQ': 'Asia', 'IL': 'Asia', 'JP': 'Asia',
    'JO': 'Asia', 'KZ': 'Asia', 'KW': 'Asia', 'KG': 'Asia', 'LA': 'Asia', 'LB': 'Asia',
    'MY': 'Asia', 'MV': 'Asia', 'MN': 'Asia', 'MM': 'Asia', 'NP': 'Asia', 'KP': 'Asia',
    'KR': 'Asia', 'OM': 'Asia', 'PK': 'Asia', 'PS': 'Asia', 'PH': 'Asia', 'QA': 'Asia',
    'SA': 'Asia', 'SG': 'Asia', 'LK': 'Asia', 'SY': 'Asia', 'TW': 'Asia', 'TJ': 'Asia',
    'TH': 'Asia', 'TL': 'Asia', 'TR': 'Asia', 'TM': 'Asia', 'AE': 'Asia', 'UZ': 'Asia',
    'VN': 'Asia', 'YE': 'Asia',

    // Africa
    'DZ': 'Africa', 'AO': 'Africa', 'BJ': 'Africa', 'BW': 'Africa', 'BF': 'Africa',
    'BI': 'Africa', 'CM': 'Africa', 'CV': 'Africa', 'CF': 'Africa', 'TD': 'Africa',
    'KM': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'CI': 'Africa', 'DJ': 'Africa',
    'EG': 'Africa', 'GQ': 'Africa', 'ER': 'Africa', 'ET': 'Africa', 'GA': 'Africa',
    'GM': 'Africa', 'GH': 'Africa', 'GN': 'Africa', 'GW': 'Africa', 'KE': 'Africa',
    'LS': 'Africa', 'LR': 'Africa', 'LY': 'Africa', 'MG': 'Africa', 'MW': 'Africa',
    'ML': 'Africa', 'MR': 'Africa', 'MU': 'Africa', 'MA': 'Africa', 'MZ': 'Africa',
    'NA': 'Africa', 'NE': 'Africa', 'NG': 'Africa', 'RW': 'Africa', 'ST': 'Africa',
    'SN': 'Africa', 'SC': 'Africa', 'SL': 'Africa', 'SO': 'Africa', 'ZA': 'Africa',
    'SS': 'Africa', 'SD': 'Africa', 'SZ': 'Africa', 'TZ': 'Africa', 'TG': 'Africa',
    'TN': 'Africa', 'UG': 'Africa', 'ZM': 'Africa', 'ZW': 'Africa',

    // Oceania
    'AU': 'Oceania', 'FJ': 'Oceania', 'KI': 'Oceania', 'MH': 'Oceania', 'FM': 'Oceania',
    'NR': 'Oceania', 'NZ': 'Oceania', 'PW': 'Oceania', 'PG': 'Oceania', 'WS': 'Oceania',
    'SB': 'Oceania', 'TO': 'Oceania', 'TV': 'Oceania', 'VU': 'Oceania'
  }

  return continentMap[countryCode.toUpperCase()] || 'Unknown'
}

/**
 * Fetch IP geolocation data from ipapi.co (free tier: 1000 requests/day)
 */
export async function fetchIPGeolocation(ip?: string): Promise<Partial<GeographicData>> {
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NextJS-Analytics/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.reason || 'Geolocation API error')
    }

    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'Unknown',
      regionCode: data.region_code || 'XX',
      city: data.city || 'Unknown',
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || 'UTC',
      continent: getContinentForCountry(data.country_code || 'XX'),
      currency: data.currency || getCurrencyForCountry(data.country_code || 'XX'),
      isp: data.org || null,
      organization: data.org || null,
      asn: data.asn || null
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error)
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      timezone: getTimezone(),
      continent: 'Unknown',
      currency: 'USD',
      isp: null,
      organization: null,
      asn: null
    }
  }
}

/**
 * Get comprehensive geographic data for analytics
 */
export async function getGeographicData(
  ip?: string,
  acceptLanguageHeader?: string
): Promise<GeographicData> {
  // Get browser language data
  const languageData = detectBrowserLanguages()
  
  // Get IP geolocation data
  const geoData = await fetchIPGeolocation(ip)
  
  // Parse Accept-Language header if provided
  const acceptLanguage = acceptLanguageHeader || languageData.browserLanguage
  
  // Get language info
  const languageInfo = getLanguageInfo(languageData.preferredLanguage)
  
  // Determine compliance requirements
  const countryCode = geoData.countryCode || 'XX'
  const isEU = EU_COUNTRIES.includes(countryCode)
  const isGDPRRegion = GDPR_COUNTRIES.includes(countryCode)
  
  // Get marketing region
  const marketingRegion = getMarketingRegion(countryCode, languageData.preferredLanguage)

  return {
    // Location data
    country: geoData.country || 'Unknown',
    countryCode,
    region: geoData.region || 'Unknown',
    regionCode: geoData.regionCode || 'XX',
    city: geoData.city || 'Unknown',
    latitude: geoData.latitude ?? null,
    longitude: geoData.longitude ?? null,
    timezone: geoData.timezone || getTimezone(),
    
    // Language data
    browserLanguage: languageData.browserLanguage,
    browserLanguages: languageData.browserLanguages,
    acceptLanguage,
    preferredLanguage: languageData.preferredLanguage,
    
    // Additional context
    continent: geoData.continent || 'Unknown',
    currency: geoData.currency || 'USD',
    isp: geoData.isp ?? null,
    organization: geoData.organization ?? null,
    asn: geoData.asn ?? null,
    
    // Derived insights
    isEU,
    isGDPRRegion,
    marketingRegion,
    languageFamily: languageInfo.family
  }
}

/**
 * Analyze geographic and language trends
 */
export interface GeographicInsights {
  totalUsers: number
  uniqueCountries: number
  uniqueLanguages: number
  topCountry: string
  topLanguage: string
  topMarketingRegion: string
  gdprPercentage: number
  languageDiversity: number
  geographicSpread: number
}

export function calculateGeographicInsights(data: GeographicData[]): GeographicInsights {
  if (data.length === 0) {
    return {
      totalUsers: 0,
      uniqueCountries: 0,
      uniqueLanguages: 0,
      topCountry: 'Unknown',
      topLanguage: 'Unknown',
      topMarketingRegion: 'Unknown',
      gdprPercentage: 0,
      languageDiversity: 0,
      geographicSpread: 0
    }
  }

  const totalUsers = data.length
  const uniqueCountries = new Set(data.map(d => d.countryCode)).size
  const uniqueLanguages = new Set(data.map(d => d.preferredLanguage)).size
  
  // Count occurrences
  const countryCounts = data.reduce((acc, d) => {
    acc[d.country] = (acc[d.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const languageCounts = data.reduce((acc, d) => {
    acc[d.preferredLanguage] = (acc[d.preferredLanguage] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const regionCounts = data.reduce((acc, d) => {
    acc[d.marketingRegion] = (acc[d.marketingRegion] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Find top items
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  const topMarketingRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
  
  // Calculate GDPR percentage
  const gdprUsers = data.filter(d => d.isGDPRRegion).length
  const gdprPercentage = (gdprUsers / totalUsers) * 100
  
  // Calculate diversity indices
  const languageDiversity = calculateDiversityIndex(Object.values(languageCounts), totalUsers)
  const geographicSpread = calculateDiversityIndex(Object.values(countryCounts), totalUsers)

  return {
    totalUsers,
    uniqueCountries,
    uniqueLanguages,
    topCountry,
    topLanguage,
    topMarketingRegion,
    gdprPercentage,
    languageDiversity,
    geographicSpread
  }
}

/**
 * Calculate Simpson's Diversity Index
 */
function calculateDiversityIndex(counts: number[], total: number): number {
  const sum = counts.reduce((acc, count) => {
    const proportion = count / total
    return acc + (proportion * proportion)
  }, 0)
  
  return 1 - sum
} 