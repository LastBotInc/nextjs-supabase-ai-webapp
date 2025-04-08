import { getTranslations } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    locale: string
  }>
}

interface CookieType {
  name: string
  description: string
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations('Privacy');

  // Helper function to safely get array translations
  const getArrayTranslation = (key: string): string[] => {
    try {
      const translation = t.raw(key)
      if (Array.isArray(translation)) {
        return translation
      }
      // Handle comma-separated string
      if (typeof translation === 'string') {
        return translation.split(',').map(item => item.trim())
      }
      console.warn(`Translation for key ${key} is not an array or string:`, translation)
      return []
    } catch (error) {
      console.error(`Error getting translation array for key: ${key}`, error)
      return []
    }
  }

  // Helper function to safely get cookie types translation
  const getCookieTypes = (): CookieType[] => {
    try {
      const types = t.raw('cookies.types')
      if (Array.isArray(types)) {
        const validTypes = types.filter(type => 
          typeof type === 'object' && 
          type !== null &&
          'name' in type && 
          'description' in type
        )
        if (validTypes.length !== types.length) {
          console.warn('Some cookie types are not in correct format:', types)
        }
        return validTypes as CookieType[]
      }
      // Handle string representation of objects
      if (typeof types === 'string') {
        try {
          const parsedTypes = types.split('],[').map(item => {
            const cleanItem = item.replace(/^\[|\]$/g, '')
            const [name, description] = cleanItem.split(',').map(s => s.trim())
            return { name, description }
          })
          return parsedTypes
        } catch (parseError) {
          console.warn('Failed to parse cookie types string:', types)
          return []
        }
      }
      console.warn('Cookie types translation is not in correct format:', types)
      return []
    } catch (error) {
      console.error('Error getting cookie types translation', error)
      return []
    }
  }

  const analyticsItems = getArrayTranslation('information.analytics.items')
  const sessionItems = getArrayTranslation('information.session.items')
  const usageItems = getArrayTranslation('usage.items')
  const rightsItems = getArrayTranslation('rights.items')
  const cookieTypes = getCookieTypes()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
      
      <section className="prose dark:prose-invert max-w-none space-y-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
          <p>{t('introduction.content')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('information.title')}</h2>
          <h3 className="text-xl font-semibold mb-2">{t('information.analytics.title')}</h3>
          <p className="mb-4">{t('information.analytics.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {analyticsItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
          <p className="mb-4">{t('cookies.description')}</p>
          <div className="space-y-4">
            {cookieTypes.map((type, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold">{type.name}</h4>
                <p>{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('usage.title')}</h2>
          <p className="mb-4">{t('usage.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {usageItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('protection.title')}</h2>
          <p>{t('protection.content')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('rights.title')}</h2>
          <p className="mb-4">{t('rights.description')}</p>
          <ul className="list-disc pl-6 space-y-2">
            {rightsItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('preferences.title')}</h2>
          <p>{t('preferences.content')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('updates.title')}</h2>
          <p>{t('updates.content')}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
          <p className="mb-4">{t('contact.description')}</p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{t('contact.address.title')}</h3>
              <p>{t('contact.address.street')}</p>
              <p>{t('contact.address.postal')}</p>
              <p>{t('contact.address.country')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('contact.email')}</h3>
              <Link href="mailto:info@lastbot.ai" className="text-primary hover:underline">
                info@lastbot.ai
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 