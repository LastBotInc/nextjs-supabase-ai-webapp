import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { languages as availableLanguages } from '@/app/i18n/languages'
import { invalidateTranslationCache } from '@/app/i18n'
import { Locale } from '@/app/i18n/config'
import { createClient } from '@/utils/supabase/client'

interface Language {
  code: string
  name: string
  native_name: string
  enabled: boolean
}

interface Translation {
  namespace: string
  key: string
  value: string
  locale: string
}

interface GeneratedTranslation {
  key: string
  value: string
}

export default function LanguageManager() {
  const supabase = createClient()
  const t = useTranslations('Admin.translations')
  const [languages, setLanguages] = useState<Language[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [generatingLanguage, setGeneratingLanguage] = useState<string | null>(null)
  const [languageToDelete, setLanguageToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('Not authenticated')

        const response = await fetch('/api/languages', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to fetch languages')
        setLanguages(result.data)
      } catch (error) {
        console.error('Error fetching languages:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch languages')
      }
    }

    fetchLanguages()
  }, [supabase.auth])

  // Generate translations for a new language
  const generateTranslations = async (languageCode: string) => {
    setIsGenerating(true)
    let success = true
    console.time('Total translation process completed in')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      // Fetch all English translations first
      const response = await fetch('/api/translations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      const { data: translations } = await response.json()
      
      // Filter English translations
      const englishTranslations = translations.filter((t: Translation) => t.locale === 'en')
      console.log(`Starting translation process for ${languageCode.toUpperCase()}: ${englishTranslations.length} texts total`)
      
      // Process translations in batches of 50
      const batchSize = 50
      for (let i = 0; i < englishTranslations.length; i += batchSize) {
        const batch = englishTranslations.slice(i, i + batchSize)
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(englishTranslations.length / batchSize)}`)
        
        // Prepare batch for translation
        const textsToTranslate = batch.map((t: Translation) => ({
          key: `${t.namespace}.${t.key}`,
          value: t.value
        }))

        // Generate translations for the batch
        const response = await fetch('/api/translations/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: textsToTranslate,
            targetLocale: languageCode
          })
        })

        const { translations: generatedTranslations, error } = await response.json()
        if (error) {
          console.error('Translation generation error:', error)
          success = false
          continue
        }

        // Save all translations from this batch
        console.log(`Saving ${generatedTranslations.length} translations to database`)
        await Promise.all(generatedTranslations.map(async (translation: GeneratedTranslation) => {
          const [namespace, ...keyParts] = translation.key.split('.')
          const key = keyParts.join('.')
          
          try {
            await fetch('/api/translations', {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                namespace,
                key,
                locale: languageCode,
                value: translation.value
              })
            })
          } catch (err) {
            console.error('Error saving translation:', err)
            success = false
          }
        }))

        // Update progress in UI
        setGeneratingLanguage(`${languageCode} (${Math.min((i + batchSize), englishTranslations.length)}/${englishTranslations.length})`)
      }

      // Invalidate translation cache for the new language
      await invalidateTranslationCache(languageCode as Locale)
      
      if (success) {
        console.log(`Successfully completed all translations for ${languageCode.toUpperCase()}`)
        toast.success(t('languages.translationSuccess'))
      } else {
        console.warn(`Completed translations for ${languageCode.toUpperCase()} with some errors`)
        toast.error(t('languages.translationError'))
      }
    } catch (err) {
      console.error('Error generating translations:', err)
      toast.error(t('languages.translationError'))
      success = false
    } finally {
      console.timeEnd('Total translation process completed in')
      setIsGenerating(false)
      setGeneratingLanguage(null)
    }

    return success
  }

  // Add new language
  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLanguage) return

    const languageToAdd = availableLanguages.find(lang => lang.code === selectedLanguage)
    if (!languageToAdd) return

    // First, close the form and show the generating status
    setIsAdding(false)
    setIsGenerating(true)
    setGeneratingLanguage(languageToAdd.code)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      // Add the language first
      const response = await fetch('/api/languages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(languageToAdd)
      })

      const { data, error } = await response.json()
      if (error) throw new Error(error)

      // Update local state
      setLanguages(prev => [...prev, data])
      toast.success(t('languages.addSuccess'))

      // Generate translations
      await generateTranslations(languageToAdd.code)
    } catch (err) {
      console.error('Error adding language:', err)
      toast.error(t('languages.addError'))
    } finally {
      setSelectedLanguage('')
      setIsGenerating(false)
      setGeneratingLanguage(null)
    }
  }

  // Remove language and its translations
  const handleRemoveLanguage = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      setIsDeleting(true)
      setLanguageToDelete(code)

      const response = await fetch(`/api/languages?code=${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(t('languages.removeError'))
        console.error('Error removing language:', error)
        return
      }

      // Remove from local state
      setLanguages(languages.filter(lang => lang.code !== code))
      toast.success(t('languages.removeSuccess'))

      // Invalidate cache to refresh translations
      await invalidateTranslationCache()
    } catch (err) {
      console.error('Error removing language:', err)
      toast.error(t('languages.removeError'))
    } finally {
      setIsDeleting(false)
      setLanguageToDelete(null)
    }
  }

  // Toggle language status
  const handleToggleLanguage = async (code: string, enabled: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/languages', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code, enabled })
      })

      const { error } = await response.json()
      if (error) throw new Error(error)

      setLanguages(languages.map(lang => 
        lang.code === code ? { ...lang, enabled } : lang
      ))
      toast.success(enabled ? t('languages.enableSuccess') : t('languages.disableSuccess'))
    } catch (err) {
      console.error('Error updating language:', err)
      toast.error(t('languages.updateError'))
    }
  }

  // Filter out already added languages
  const availableToAdd = availableLanguages.filter(
    lang => !languages.some(existing => existing.code === lang.code)
  )

  if (error) {
    return <div className="mb-8 text-red-500">{error}</div>
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          {t('languages.title')}
        </h2>
        {!isAdding && !isGenerating && availableToAdd.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('languages.addButton')}
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>
              {t('generating')} - {generatingLanguage?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleAddLanguage} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('languages.form.code')}
            </label>
            <select
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">{t('languages.form.select')}</option>
              {availableToAdd.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.native_name})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setSelectedLanguage('')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              {t('languages.form.cancel')}
            </button>
            <button
              type="submit"
              disabled={!selectedLanguage}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('languages.form.add')}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {languages.map((language) => (
            <li key={language.code} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full">
                    {language.code}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {language.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language.native_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleLanguage(language.code, !language.enabled)}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      language.enabled
                        ? 'text-green-800 bg-green-100 hover:bg-green-200 dark:text-green-100 dark:bg-green-800/30 dark:hover:bg-green-800/40'
                        : 'text-gray-800 bg-gray-100 hover:bg-gray-200 dark:text-gray-100 dark:bg-gray-800/30 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    {language.enabled ? t('languages.enabled') : t('languages.disabled')}
                  </button>
                  {language.code !== 'en' && (
                    <button
                      onClick={() => setLanguageToDelete(language.code)}
                      className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-full dark:text-red-100 dark:bg-red-800/30 dark:hover:bg-red-800/40"
                      disabled={isDeleting || isGenerating}
                    >
                      {isDeleting && languageToDelete === language.code ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : t('languages.remove')}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete confirmation dialog */}
      {languageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('languages.removeConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('languages.removeConfirmMessage')}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setLanguageToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                {t('languages.form.cancel')}
              </button>
              <button
                onClick={() => languageToDelete && handleRemoveLanguage(languageToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? t('languages.removing') : t('languages.removeConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 