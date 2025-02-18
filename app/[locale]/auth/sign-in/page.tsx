'use client'

import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

// Dynamically import SignInForm with no SSR
const SignInForm = dynamic(() => import('@/components/auth/SignInForm'), {
  ssr: false
})

export default function SignInPage() {
  const t = useTranslations('Auth')
  const { session, loading, isAdmin } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const nextUrl = searchParams.get('next') || `/${locale}/admin/blog`

  useEffect(() => {
    // Add debug logging
    console.log('Sign-in page state:', {
      hasSession: !!session,
      loading,
      isAdmin,
      isRedirecting,
      nextUrl
    })

    // Only redirect if we have a session and loading is complete
    if (session?.user && !loading) {
      setIsRedirecting(true)
      // Small delay to ensure state is settled
      const redirectTimer = setTimeout(() => {
        window.location.href = nextUrl
      }, 100)
      return () => clearTimeout(redirectTimer)
    }
  }, [session, loading, isAdmin, nextUrl, isRedirecting])

  // Show loading state when redirecting or initial auth loading
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 mb-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {isRedirecting ? t('redirecting') : t('loading')}
          </p>
        </div>
      </div>
    )
  }

  // If we have a session but not redirecting yet, don't render anything
  if (session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('signIn')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/auth/register`} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            {t('register')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
