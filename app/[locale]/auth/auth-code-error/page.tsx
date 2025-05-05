'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function AuthCodeErrorPage() {
  const t = useTranslations('Auth')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract error query parameter if present
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    setError(errorParam)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-red-600 dark:text-red-400">
          {t('authErrorTitle')}
        </h1>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6">
          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            {t('authErrorMessage')}
          </p>
          
          {error && (
            <div className="text-sm bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-32">
              <code className="text-red-600 dark:text-red-400 break-all">{error}</code>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/auth/sign-in" 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors"
          >
            {t('tryAgain')}
          </Link>
          
          <Link 
            href="/" 
            className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-center transition-colors"
          >
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
