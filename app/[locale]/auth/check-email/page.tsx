'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function CheckEmailPage() {
  const t = useTranslations('Auth')
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('checkEmail')}
        </h2>
        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-4">{t('emailSent')}</p>
          <p className="mb-4">{t('checkSpam')}</p>
          <Link
            href={`/${locale}/auth/sign-in`}
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {t('backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  )
} 