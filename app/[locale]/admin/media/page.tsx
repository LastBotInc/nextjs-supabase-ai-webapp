'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MediaDashboard } from './MediaDashboard';
import { MediaFilter } from '@/types/media';

export default function MediaPage() {
  const t = useTranslations('Media');
  const [filter, setFilter] = useState<MediaFilter>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 dark:text-white">
          {t('title')}
        </h1>
        
        <MediaDashboard filter={filter} onFilterChange={setFilter} />
      </div>
    </div>
  );
} 