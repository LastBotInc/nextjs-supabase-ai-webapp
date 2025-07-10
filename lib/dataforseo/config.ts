/**
 * DataForSEO API Configuration
 * Environment variables and default settings for DataForSEO integration
 */

export interface DataForSEOConfig {
  login: string;
  password: string;
  apiUrl: string;
  rateLimitPerMinute: number;
  defaultLocationCode: number;
  defaultLanguageCode: string;
  defaultDevice: 'desktop' | 'mobile' | 'tablet';
  timeout: number;
}

/**
 * Get DataForSEO configuration from environment variables
 */
export function getDataForSEOConfig(): DataForSEOConfig {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    throw new Error(
      'DataForSEO credentials not found. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.'
    );
  }

  return {
    login,
    password,
    apiUrl: process.env.DATAFORSEO_API_URL || 'https://api.dataforseo.com/v3',
    rateLimitPerMinute: parseInt(process.env.DATAFORSEO_RATE_LIMIT || '2000'),
    defaultLocationCode: parseInt(process.env.DATAFORSEO_DEFAULT_LOCATION || '2840'), // US
    defaultLanguageCode: process.env.DATAFORSEO_DEFAULT_LANGUAGE || 'en',
    defaultDevice: (process.env.DATAFORSEO_DEFAULT_DEVICE as 'desktop' | 'mobile' | 'tablet') || 'desktop',
    timeout: parseInt(process.env.DATAFORSEO_TIMEOUT || '30000'), // 30 seconds
  };
}

/**
 * DataForSEO API endpoints
 */
export const DATAFORSEO_ENDPOINTS = {
  // SERP API
  SERP_GOOGLE_ORGANIC_TASK_POST: '/serp/google/organic/task_post',
  SERP_GOOGLE_ORGANIC_TASK_GET: '/serp/google/organic/task_get',
  SERP_GOOGLE_ORGANIC_TASKS_READY: '/serp/google/organic/tasks_ready',
  
  // Keywords Data API
  KEYWORDS_DATA_GOOGLE_SEARCH_VOLUME_TASK_POST: '/keywords_data/google/search_volume/task_post',
  KEYWORDS_DATA_GOOGLE_SEARCH_VOLUME_TASK_GET: '/keywords_data/google/search_volume/task_get',
  KEYWORDS_DATA_GOOGLE_KEYWORD_SUGGESTIONS_TASK_POST: '/keywords_data/google/keyword_suggestions/task_post',
  KEYWORDS_DATA_GOOGLE_KEYWORD_SUGGESTIONS_TASK_GET: '/keywords_data/google/keyword_suggestions/task_get',
  
  // Backlinks API
  BACKLINKS_SUMMARY: '/backlinks/summary/live',
  BACKLINKS_REFERRING_DOMAINS: '/backlinks/referring_domains/live',
  BACKLINKS_ANCHORS: '/backlinks/anchors/live',
  BACKLINKS_PAGES: '/backlinks/pages/live',
  
  // OnPage API
  ONPAGE_TASK_POST: '/on_page/task_post',
  ONPAGE_TASK_GET: '/on_page/task_get',
  ONPAGE_PAGES: '/on_page/pages',
  ONPAGE_LIGHTHOUSE: '/on_page/lighthouse/task_post',
  
  // Content Analysis API
  CONTENT_ANALYSIS_SUMMARY: '/content_analysis/summary/live',
  CONTENT_ANALYSIS_SEARCH: '/content_analysis/search/live',
  CONTENT_ANALYSIS_PHRASE_TRENDS: '/content_analysis/phrase_trends/live',
  
  // Domain Analytics API
  DOMAIN_ANALYTICS_TECHNOLOGIES: '/domain_analytics/technologies/domain_technologies/live',
  DOMAIN_ANALYTICS_WHOIS: '/domain_analytics/whois/overview/live',
  
  // DataForSEO Labs API
  DATAFORSEO_LABS_GOOGLE_RANKINGS: '/dataforseo_labs/google/rankings/live',
  DATAFORSEO_LABS_GOOGLE_COMPETITORS: '/dataforseo_labs/google/competitors/live',
  DATAFORSEO_LABS_GOOGLE_RELATED_KEYWORDS: '/dataforseo_labs/google/related_keywords/live',
  
  // Business Data API
  BUSINESS_DATA_GOOGLE_MY_BUSINESS: '/business_data/google/my_business/find/task_post',
  BUSINESS_DATA_GOOGLE_REVIEWS: '/business_data/google/reviews/task_post',
  
  // Merchant API
  MERCHANT_GOOGLE_SELLERS: '/merchant/google/sellers/task_post',
  MERCHANT_GOOGLE_PRODUCTS: '/merchant/google/products/task_post',
  
  // App Data API
  APP_DATA_APPLE_APP_STORE: '/app_data/apple/app_store/search/task_post',
  APP_DATA_GOOGLE_PLAY: '/app_data/google_play/search/task_post',
} as const;

/**
 * DataForSEO location codes for major markets
 */
export const DATAFORSEO_LOCATIONS = {
  // English-speaking countries
  US: 2840,
  UK: 2826,
  CA: 2124,
  AU: 2036,
  
  // European countries
  DE: 2276,
  FR: 2250,
  ES: 2724,
  IT: 2380,
  NL: 2528,
  SE: 2752,
  NO: 2578,
  DK: 2208,
  FI: 2246,
  
  // Other major markets
  JP: 2392,
  KR: 2410,
  CN: 2156,
  IN: 2356,
  BR: 2076,
  MX: 2484,
} as const;

/**
 * DataForSEO language codes
 */
export const DATAFORSEO_LANGUAGES = {
  EN: 'en',
  DE: 'de',
  FR: 'fr',
  ES: 'es',
  IT: 'it',
  NL: 'nl',
  SV: 'sv',
  NO: 'no',
  DA: 'da',
  FI: 'fi',
  JA: 'ja',
  KO: 'ko',
  ZH: 'zh',
  HI: 'hi',
  PT: 'pt',
} as const;

/**
 * DataForSEO search engines
 */
export const DATAFORSEO_SEARCH_ENGINES = {
  GOOGLE: 'google',
  BING: 'bing',
  YAHOO: 'yahoo',
  BAIDU: 'baidu',
  YANDEX: 'yandex',
} as const;

/**
 * DataForSEO device types
 */
export const DATAFORSEO_DEVICES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
} as const;

/**
 * DataForSEO API response status codes
 */
export const DATAFORSEO_STATUS_CODES = {
  SUCCESS: 20000,
  GENERAL_ERROR: 40000,
  AUTHENTICATION_ERROR: 40100,
  AUTHORIZATION_ERROR: 40300,
  NOT_FOUND: 40400,
  RATE_LIMIT_EXCEEDED: 42900,
  INTERNAL_ERROR: 50000,
} as const; 