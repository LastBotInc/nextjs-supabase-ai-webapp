import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { staticLocales as locales, defaultLocale } from "../i18n/config";
import Navigation from "@/app/components/Navigation";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";
import getI18nConfig from "@/app/i18n";
import { dedupingServerFetch } from "@/lib/utils/server-deduplication";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

// Validate locale before using it
async function validateLocale(locale: string) {
  // Use static locales during build, production, or if no site URL is set
  if (
    !process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL ||
    process.env.NEXT_PHASE // Next.js build phase
  ) {
    return locales.includes(locale) ? locale : defaultLocale;
  }

  try {
    // Get enabled locales from database
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

    const response = await dedupingServerFetch(`${baseUrl}/api/languages`);

    if (!response.ok) {
      console.warn(`Failed to fetch languages, using static locales. Status: ${response.status}`);
      return locales.includes(locale) ? locale : defaultLocale;
    }

    const { data: languages } = await response.json();
    const enabledLocales =
      languages?.map((lang: { code: string; enabled: boolean }) => (lang.enabled ? lang.code : null)).filter(Boolean) ||
      locales;

    // Check if locale is enabled
    if (!enabledLocales.includes(locale)) {
      return defaultLocale;
    }
    return locale;
  } catch (error) {
    console.error("Error validating locale:", error);
    // Fallback to static locales if database check fails
    return locales.includes(locale) ? locale : defaultLocale;
  }
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  // Await and validate the incoming locale
  const resolvedParams = await params;
  const validatedLocale = await validateLocale(resolvedParams.locale);

  // Get messages using our i18n configuration that includes database translations
  let messages: AbstractIntlMessages = {};
  try {
    const i18nConfig = await getI18nConfig({ locale: validatedLocale });
    messages = (i18nConfig.messages || {}) as AbstractIntlMessages; // Ensure messages is always an object
  } catch (error) {
    console.error("Failed to load translations for layout:", error);
    // Optionally load default locale messages as a fallback here if needed
  }

  return (
    // Ensure messages is always passed as an object, even if empty
    <NextIntlClientProvider messages={messages} locale={validatedLocale}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
