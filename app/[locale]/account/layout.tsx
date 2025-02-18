'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('Account')
  const pathname = usePathname()
  const { locale } = useParams()

  const tabs = [
    { name: t('settings.title'), href: `/${locale}/account/settings` },
    { name: t('security.title'), href: `/${locale}/account/security` }
  ]

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300',
                  'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
} 