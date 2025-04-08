'use client'

import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/AuthProvider'
import { redirect } from '@/app/i18n/navigation'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const t = useTranslations('Profile')
  const { session, loading } = useAuth()

  // Redirect if not authenticated
  if (!loading && !session) {
    redirect('/auth/sign-in')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t('description')}</p>

        <Tabs defaultValue="general" className="space-y-8">
          <TabsList>
            <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
            <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('tabs.preferences')}</TabsTrigger>
          </TabsList>

          {/* General Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('fields.username')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 px-4 py-2"
                    value={session?.user?.email?.split('@')[0] || ''}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('fields.email')}
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 px-4 py-2"
                    value={session?.user?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('fields.fullName')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 px-4 py-2"
                    placeholder={t('fields.fullNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-[#82D173] hover:bg-[#82D173]/90 px-4 py-2 text-sm font-medium text-[#0A210F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#82D173] focus:ring-offset-2"
                >
                  {t('actions.save')}
                </button>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
} 