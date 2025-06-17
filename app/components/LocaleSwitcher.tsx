"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/app/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { languages as availableLanguages } from "@/app/i18n/languages";
import { staticLocales } from "@/app/i18n/config";
import { createClient } from "@/utils/supabase/client";
import { dedupingFetch } from "@/lib/utils/deduplication";
interface Language {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
}

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  // Memoize fetchLanguages to prevent recreation on each render
  const fetchLanguages = async () => {
    try {
      // Use dedupingFetch instead of regular fetch
      const response = await dedupingFetch("/api/languages");
      const { data, error } = await response.json();

      if (error) throw new Error(error);

      // Filter enabled languages
      const enabledLanguages = data
        ?.filter((lang: Language) => lang.enabled)
        .sort((a: Language) => {
          if (a.code === "fi") return -1;
          if (a.code === "sv") return 1;
          return 0;
        });

      if (!enabledLanguages?.length) {
        // If no enabled languages found, use static locales
        const staticLanguages = staticLocales.map((code) => {
          const lang = availableLanguages.find((l) => l.code === code);
          return {
            code,
            name: lang?.name || code,
            native_name: lang?.native_name || code,
            enabled: true,
          };
        });
        setLanguages(staticLanguages);
        return;
      }

      setLanguages(enabledLanguages);
    } catch (err) {
      console.error("Error fetching languages:", err);
      // Fallback to static locales
      const staticLanguages = staticLocales.map((code) => {
        const lang = availableLanguages.find((l) => l.code === code);
        return {
          code,
          name: lang?.name || code,
          native_name: lang?.native_name || code,
          enabled: true,
        };
      });
      setLanguages(staticLanguages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLanguages();

    // Setup WebSocket subscription with proper cleanup
    let channel: ReturnType<typeof supabase.channel>;

    // Only setup WebSocket if page is visible and not in development
    if (document.visibilityState === "visible" && process.env.NODE_ENV === "production") {
      channel = supabase
        .channel("languages_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "languages",
          },
          // Debounce the refetch to prevent multiple rapid updates
          () => {
            const timeoutId = setTimeout(() => {
              fetchLanguages();
            }, 1000); // 1 second debounce
            return () => clearTimeout(timeoutId);
          }
        )
        .subscribe();
    }

    // Cleanup function
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []); // Empty dependency array since fetchLanguages is now stable

  const handleChange = async (newLocale: string) => {
    try {
      await router.replace(pathname, { locale: newLocale });
    } catch (err) {
      console.error("Error changing locale:", err);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="relative flex flex-row gap-1">
      {languages.map((lang) => (
        <div key={lang.code}>
          <button
            key={lang.code}
            value={lang.code}
            className="p-2 bg-white block text-piki text-left disabled:opacity-50 hover:text-piki/80 hover:bg-gray-100 rounded-xl"
            aria-label={`${lang.name} - ${lang.native_name}`}
            onClick={() => handleChange(lang.code)}
            disabled={locale === lang.code}
          >
            {lang.code.toUpperCase()}
          </button>
        </div>
      ))}
    </div>
  );
}
