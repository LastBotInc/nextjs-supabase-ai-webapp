import { getRequestConfig } from 'next-intl/server';
import { AbstractIntlMessages } from 'next-intl';
import { type Locale, defaultLocale, locales } from '@/app/i18n/config';
import getI18nConfig from '../i18n';

// This is the required default export for next-intl
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Get the messages and timezone for the locale
  const { messages, timeZone } = await getI18nConfig({ locale: locale as Locale });

  return {
    locale, // Explicitly return the locale
    messages: messages as AbstractIntlMessages,
    timeZone,
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      }
    }
  };
}); 