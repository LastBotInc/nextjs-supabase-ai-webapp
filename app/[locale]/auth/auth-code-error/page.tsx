'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default function AuthCodeError() {
  const t = useTranslations('Auth')
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('authError.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('authError.description')}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <Link
              href={`${SITE_URL}/${locale}/auth/sign-in`}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('authError.backToSignIn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
