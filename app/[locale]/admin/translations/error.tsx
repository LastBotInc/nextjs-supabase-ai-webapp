'use client';

import { useTranslations } from 'next-intl';

export default function Error() {
  const t = useTranslations('Admin.translations');

  return (
    <div className="container mx-auto py-8">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <h2 className="text-red-800 dark:text-red-200 text-lg font-semibold">
          {t('error.title')}
        </h2>
        <p className="text-red-700 dark:text-red-300 mt-2">
          {t('error.description')}
        </p>
      </div>
    </div>
  );
} 