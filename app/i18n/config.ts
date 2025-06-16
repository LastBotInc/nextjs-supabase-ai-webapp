export type Locale = string;

export const defaultLocale: Locale = "en";

// This is used for static generation and initial config
export const staticLocales: Locale[] = ["en", "fi", "sv"];

// Export locales for next-intl
export const locales = staticLocales;






