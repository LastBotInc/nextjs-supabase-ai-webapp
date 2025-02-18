'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Analytics error:', error)
  }, [error])

  const t = useTranslations('Admin.analytics')

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-xl font-semibold mb-4">
        {t('error.title')}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {t('error.description')}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        {t('error.retry')}
      </button>
    </div>
  )
} 