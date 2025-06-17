"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/app/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { languages as availableLanguages } from "@/app/i18n/languages";
import { staticLocales } from "@/app/i18n/config";
import { createClient } from "@/utils/supabase/client";
import { dedupingFetch } from "@/lib/utils/deduplication";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const t = useTranslations("Common.languageSelector");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isOpen, setOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);
  // Memoize fetchLanguages to prevent recreation on each render
  const fetchLanguages = async () => {
    try {
      // Use dedupingFetch instead of regular fetch
      const response = await dedupingFetch("/api/languages");
      const { data, error } = await response.json();

      if (error) throw new Error(error);

      // Filter enabled languages
      const enabledLanguages = data?.filter((lang: Language) => lang.enabled);

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
  const toggleDropdown = async () => {
    setOpen((v) => !v);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && elementRef.current && !elementRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (loading) {
    return (
      <div className="flex items-center">
        <div
          className="h-8 w-28 animate-pulse bg-gray-700 rounded-md"
          style={{
            minWidth: "120px",
            height: "32px",
            borderRadius: "0.375rem",
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative" ref={elementRef}>
      <button
        onClick={() => toggleDropdown()}
        className={`capitalize px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
          isOpen ? "text-white bg-piki" : "text-piki hover:text-piki/80 hover:bg-gray-100"
        }`}
        aria-label={t("ariaLabel")}
        aria-expanded={isOpen}
      >
        {locale}
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
          <div className="py-1">
            {languages.map((lang) => (
              <div key={lang.code} className={`block px-4 py-2 text-sm w-full`}>
                <button
                  key={lang.code}
                  value={lang.code}
                  className="bg-white block text-piki text-left py-1 w-full disabled:opacity-50 hover:text-piki/80 hover:bg-gray-100 w-100"
                  aria-label={`${lang.name} - ${lang.native_name}`}
                  onClick={() => handleChange(lang.code)}
                  disabled={locale === lang.code}
                >
                  {lang.native_name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
