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
      <div className="flex items-center">
        <div className="h-8 w-28 animate-pulse bg-gray-700 rounded-md" 
          style={{ 
            minWidth: '120px', 
            height: '32px',
            borderRadius: '0.375rem'
          }} 
        />
      </div>
    );
  }

  // Calculate the width based on the longest text in the available languages
  const getLongestNativeName = () => {
    if (!languages.length) return 7; // Default character count
    return Math.max(...languages.map(lang => lang.native_name.length));
  };
  
  // Minimum width plus some extra space for the dropdown arrow
  const minWidth = Math.max(getLongestNativeName() * 8 + 30, 100); // 8px per character + 30px for arrow

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
        style={{ minWidth: `${minWidth}px` }}
        className="h-8 px-3 pr-8 text-sm bg-transparent border border-black/[.1] dark:border-white/[.1] rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-black/[.3] dark:focus:ring-white/[.3] hover:border-gray-400 dark:hover:border-gray-500 transition-colors appearance-none"
      >
        {languages.map((lang) => (
          <option 
            key={lang.code} 
            value={lang.code} 
            className="bg-white dark:bg-gray-800 py-1"
            aria-label={`${lang.name} - ${lang.native_name}`}
          >
            {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="relative right-6 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
