'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/app/i18n/navigation';
import { useState, useEffect } from 'react';
import { languages as availableLanguages } from '@/app/i18n/languages';
import { staticLocales } from '@/app/i18n/config';
import { createClient } from '@/utils/supabase/client';
import { dedupingFetch } from '@/lib/utils/deduplication';

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
  const t = useTranslations('Common.languageSelector');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Memoize fetchLanguages to prevent recreation on each render
  const fetchLanguages = async () => {
    try {
      // Use dedupingFetch instead of regular fetch
      const response = await dedupingFetch('/api/languages');
      const { data, error } = await response.json();
      
      if (error) throw new Error(error);
      
      // Filter enabled languages
      const enabledLanguages = data?.filter((lang: Language) => lang.enabled);
      
      if (!enabledLanguages?.length) {
        // If no enabled languages found, use static locales
        const staticLanguages = staticLocales.map(code => {
          const lang = availableLanguages.find(l => l.code === code);
          return {
            code,
            name: lang?.name || code,
            native_name: lang?.native_name || code,
            enabled: true
          };
        });
        setLanguages(staticLanguages);
        return;
      }
      
      setLanguages(enabledLanguages);
    } catch (err) {
      console.error('Error fetching languages:', err);
      // Fallback to static locales
      const staticLanguages = staticLocales.map(code => {
        const lang = availableLanguages.find(l => l.code === code);
        return {
          code,
          name: lang?.name || code,
          native_name: lang?.native_name || code,
          enabled: true
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
    if (document.visibilityState === 'visible' && process.env.NODE_ENV === 'production') {
      channel = supabase
        .channel('languages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'languages'
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
  }, []);  // Empty dependency array since fetchLanguages is now stable

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    try {
      await router.replace(pathname, { locale: newLocale });
    } catch (err) {
      console.error('Error changing locale:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
    );
  }

  return (
    <div className="flex items-center">
      <label 
        htmlFor="language-select" 
        className="sr-only"
      >
        {t('label')}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={handleChange}
        aria-label={t('ariaLabel')}
        className="h-8 w-14 px-1 text-sm bg-transparent border border-piki/20 rounded-md text-piki focus:outline-none focus:ring-2 focus:ring-kupari/50 hover:border-kupari transition-colors"
      >
        {languages.map((lang) => (
          <option 
            key={lang.code} 
            value={lang.code} 
            className="bg-white text-piki"
            aria-label={`${lang.name} - ${lang.native_name}`}
          >
            {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
