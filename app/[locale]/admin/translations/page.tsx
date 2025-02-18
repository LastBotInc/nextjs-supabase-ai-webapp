'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import TranslationEditor from './TranslationEditor'
import SearchFilter from './SearchFilter'
import LanguageManager from './LanguageManager'
import { invalidateTranslationCache } from '@/app/i18n'
import { Locale } from '@/app/i18n/config'
import { useSearchParams } from 'next/navigation'

interface Translation {
  namespace: string
  key: string
  locale: string
  value: string
}

interface GroupedTranslation {
  namespace: string
  key: string
  translations: Record<string, string>
}

interface Language {
  code: string
  name: string
  native_name: string
}

interface Props {
  params: {
    locale: string
  }
}

export default function TranslationsPage({ params }: Props) {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const t = useTranslations('Admin.translations')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchData() {
      console.log('Fetching translations and languages...')
      try {
        // Fetch translations
        const translationsResponse = await fetch('/api/translations')
        const { data: translationsData, error: translationsError } = await translationsResponse.json()

        if (translationsError) {
          throw new Error(translationsError)
        }

        // Fetch languages
        const languagesResponse = await fetch('/api/languages')
        const { data: languagesData, error: languagesError } = await languagesResponse.json()

        if (languagesError) {
          throw new Error(languagesError)
        }
        
        console.log('Fetched translations:', translationsData)
        console.log('Fetched languages:', languagesData)
        setTranslations(translationsData || [])
        setLanguages(languagesData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchData()

    // Subscribe to changes
    const channel = supabase
      .channel('translations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations'
        },
        async () => {
          // Refetch all data when any change occurs
          await fetchData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'languages'
        },
        async () => {
          // Refetch all data when languages change
          await fetchData()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Group translations by namespace and key
  console.log('Current translations state:', translations)
  const groupedTranslations = translations.reduce((acc: Record<string, GroupedTranslation>, translation: Translation) => {
    const key = `${translation.namespace}.${translation.key}`
    if (!acc[key]) {
      acc[key] = { namespace: translation.namespace, key: translation.key, translations: {} }
    }
    acc[key].translations[translation.locale] = translation.value
    return acc
  }, {})

  console.log('Grouped translations:', groupedTranslations)

  const translationGroups = Object.values(groupedTranslations) as GroupedTranslation[]

  // Filter translations based on search term
  const filteredTranslations = search
    ? translationGroups.filter(group => 
        group.namespace.toLowerCase().includes(search.toLowerCase()) ||
        group.key.toLowerCase().includes(search.toLowerCase()) ||
        Object.values(group.translations).some(value => 
          value.toLowerCase().includes(search.toLowerCase())
        )
      )
    : translationGroups

  const handleSave = async (namespace: string, key: string, locale: string, newValue: string) => {
    try {
      // Update local state optimistically
      setTranslations(prev => prev.map(t => 
        t.namespace === namespace && t.key === key && t.locale === locale
          ? { ...t, value: newValue }
          : t
      ))

      // Update database through API
      const response = await fetch('/api/translations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          namespace,
          key,
          locale,
          value: newValue,
        }),
      })

      const { error } = await response.json()
      if (error) throw new Error(error)

      // Invalidate cache for the updated locale
      invalidateTranslationCache(locale as Locale)
    } catch (err) {
      console.error('Error saving translation:', err)
      // Revert local state on error by refetching translations
      const response = await fetch('/api/translations')
      const { data } = await response.json()
      if (data) {
        setTranslations(data)
      }
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading translations...</div>
  }

  if (error) {
    return <div className="container mx-auto py-8">Error loading translations: {error.message}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t('description')}</p>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>{t('shortcuts.title')}</p>
          <ul className="mt-1 list-disc list-inside">
            <li>{t('shortcuts.enter')}</li>
            <li>{t('shortcuts.save')}</li>
            <li>{t('shortcuts.cancel')}</li>
          </ul>
        </div>
      </div>

      <LanguageManager />

      <SearchFilter />
      
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900">
              <th className="px-4 py-2 text-left text-black dark:text-white">{t('table.namespace')}</th>
              <th className="px-4 py-2 text-left text-black dark:text-white">{t('table.key')}</th>
              {languages.map(lang => (
                <th key={lang.code} className="px-4 py-2 text-left text-black dark:text-white">
                  {lang.name} ({lang.native_name})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTranslations.map((group) => (
              <tr key={`${group.namespace}.${group.key}`} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{group.namespace}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{group.key}</td>
                {languages.map(lang => (
                  <td key={lang.code} className="px-4 py-2">
                    <TranslationEditor
                      namespace={group.namespace}
                      translationKey={group.key}
                      locale={lang.code}
                      value={group.translations[lang.code] || ''}
                      onSave={(newValue) => handleSave(group.namespace, group.key, lang.code, newValue)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 