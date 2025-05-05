import { getRequestConfig } from 'next-intl/server';
import { AbstractIntlMessages } from 'next-intl';
import { defaultLocale, locales, type Locale } from './config';
import getI18nConfig from '@/app/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming locale is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Get the messages and locale using our getI18nConfig function
  const { messages } = await getI18nConfig({ locale: locale as Locale });

  return {
    locale, // Explicitly return the locale
    messages: messages as AbstractIntlMessages,
    timeZone: 'Europe/Helsinki'
  };
}); 