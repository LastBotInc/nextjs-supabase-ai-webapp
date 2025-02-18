'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export default function SearchFilter() {
  const t = useTranslations('Admin.translations');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const search = searchParams.get('search') || '';

  const handleSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, replace]);

  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-lg">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
} 