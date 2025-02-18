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

export async function getI18nConfig({ locale }: { locale: Locale }): Promise<I18nConfig> {
  console.log(`Loading translations for locale: ${locale}`);
  try {
    // During production builds, use static imports
    if (process.env.NODE_ENV === 'production') {
      try {
        const messages = (await import(`@/messages/${locale}.json`)).default;
        return {
          messages,
          timeZone: 'Europe/Helsinki'
        };
      } catch (error) {
        console.error(`Failed to load translations for ${locale} in production:`, error);
        console.warn(`Falling back to default locale (${defaultLocale})`);
        const messages = (await import(`@/messages/${defaultLocale}.json`)).default;
        return {
          messages,
          timeZone: 'Europe/Helsinki'
        };
      }
    }

    // In development, try dynamic import with error handling
    try {
      const messages = await import(`@/messages/${locale}.json`).then(module => module.default);
      return {
        messages,
        timeZone: 'Europe/Helsinki'
      };
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
      console.warn(`Falling back to default locale (${defaultLocale})`);
      
      // Check if the locale is in staticLocales but translation file is missing
      if (staticLocales.includes(locale)) {
        console.error(`Translation file missing for enabled locale: ${locale}`);
      }
      
      const messages = await import(`@/messages/${defaultLocale}.json`).then(module => module.default);
      return {
        messages,
        timeZone: 'Europe/Helsinki'
      };
    }
  } catch (error) {
    console.error(`Critical error loading translations:`, error);
    console.warn(`Emergency fallback to default locale (${defaultLocale})`);
    const messages = (await import(`@/messages/${defaultLocale}.json`)).default;
    return {
      messages,
      timeZone: 'Europe/Helsinki'
    };
  }
} 