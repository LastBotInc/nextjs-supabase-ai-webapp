import { getNamespaces } from "@/utils/i18n-helpers";
import type { Locale } from "./i18n/config";
import { dedupingServerFetch } from "@/lib/utils/server-deduplication";
import { getBaseUrl } from "@/utils/getBaseUrl";

// Define message structure
type Messages = {
  [key: string]: string | string[] | Messages | Messages[] | undefined;
};

// Cache for translations with 5-second TTL in development, 30 seconds in production
const CACHE_TTL = process.env.NODE_ENV === "development" ? 5 * 1000 : 30 * 1000;

// Translation cache Map
const translationCache = new Map<
  string,
  { data: Messages; timestamp: number }
>();

// Logging configuration
const DEBUG_MODE = process.env.NODE_ENV === "development" &&
  process.env.DEBUG_I18N === "true";

function log(...args: unknown[]) {
  if (DEBUG_MODE) {
    console.log(...args);
  }
}

// Cache invalidation function
export function invalidateTranslationCache(locale?: Locale) {
  if (locale) {
    translationCache.delete(locale);
    log("🗑️ [i18n] Cache invalidated for locale:", locale);
  } else {
    translationCache.clear();
    log("🗑️ [i18n] Cache cleared for all locales");
  }
}

async function getTranslationsWithCache(
  locale: Locale,
  forceRefresh = false,
): Promise<Messages> {
  const now = Date.now();
  const cached = translationCache.get(locale);

  // Return cached translations if they exist, haven't expired, and no force refresh
  if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
    log("🎯 [i18n] Using cached translations for:", locale);
    return cached.data;
  }

  // Load translations
  const messages = await loadTranslations(locale);

  // Cache the new translations
  translationCache.set(locale, { data: messages, timestamp: now });
  log("💾 [i18n] Cached new translations for:", locale);

  return messages;
}

// Load namespaces using dynamic imports - works in both client and server
async function loadNamespaceUsingImport(
  locale: Locale,
  namespace: string,
): Promise<Messages> {
  log(
    "📁 [i18n] Loading namespace json for locale using dynamic imports:",
    locale,
  );

  try {
    const data = await import(`@/messages/${locale}/${namespace}.json`)
      .then((m) => m.default);
    log(`✅ [i18n] Loaded  json namespace: ${namespace}`);
    return data;
  } catch (error) {
    log(`⚠️ [i18n] json  namespace not found: ${namespace}`, error);
  }

  return {};
}
async function loadNamespaceFromApi(
  locale: Locale,
  namespace: string,
): Promise<Messages> {
  const baseUrl = getBaseUrl();

  const response = await dedupingServerFetch(
    `${baseUrl}/api/translations?groupNamespaces=true&locale=${locale}&namespace=${namespace}`,
  );
  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  const dataSet = result.data && result.data[namespace];

  if (dataSet && Object.keys(dataSet).length > 0) {
    log(
      "✅ [i18n] Successfully loaded translations from API for",
      locale,
      namespace,
    );
    return dataSet;
  }

  log("⚠️ [i18n] API returned empty translations for", locale, namespace);
  throw new Error("No translations found for " + locale + " " + namespace);
}

async function loadTranslations(locale: Locale): Promise<Messages> {
  log("\n🌍 [i18n] ===== TRANSLATION LOADING START =====");
  log("🔍 [i18n] Loading translations for locale:", locale);

  try {
    const messages: Messages = {};
    const commonNamespaces = getNamespaces();

    for (const namespace of commonNamespaces) {
      // add env.USE_JSON_FILES etc check here to use JSON files and skip loading?
      const translations = process.env.USE_JSON_FILES === "true"
        ? null
        : await loadNamespaceFromApi(locale, namespace);

      if (translations) {
        log("🔍 [i18n] Loaded api translations for locale:", namespace, locale);

        messages[namespace] = translations;
      } else {
        const jsonData = await loadNamespaceUsingImport(locale, namespace);
        if (jsonData) {
          log(
            "🔍 [i18n] Loaded JSON translations for locale:",
            namespace,
            locale,
          );

          messages[namespace] = jsonData;
        }
      }
    }
    return messages;
  } catch (apiError) {
    log("❌ [i18n] Error fetching translations:", apiError);
  } finally {
    log("🌍 [i18n] ===== TRANSLATION LOADING END =====\n");
  }

  return Promise.resolve({});
}

export async function getTranslations(locale: Locale): Promise<Messages> {
  return getTranslationsWithCache(locale);
}

export default async function getI18nConfig({ locale }: { locale: Locale }) {
  const messages = await getTranslations(locale);

  return {
    messages,
    // Default timeZone - can be overridden per-user if needed
    timeZone: "Europe/Helsinki",
  };
}

export const dynamic = "force-dynamic";
