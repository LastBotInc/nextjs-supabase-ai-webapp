'use server'

import { getTranslations, getFormatter } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'CarLeasing.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function AutoleasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations('CarLeasing')
  const format = await getFormatter({ locale })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
          {t('title')}
        </h1>
        
        <div className="prose prose-lg prose-indigo mx-auto">
          <p className="lead">{t('intro')}</p>
          
          <h2>{t('personal.title')}</h2>
          <p>{t('personal.description')}</p>
          
          <h2>{t('corporate.title')}</h2>
          <p>{t('corporate.description')}</p>
          
          <h2>{t('terms.title')}</h2>
          <p>{t('terms.description')}</p>
          
          <h2>{t('vehicles.title')}</h2>
          <p>{t('vehicles.description')}</p>
          
          <div className="bg-gray-50 p-6 rounded-lg my-8">
            <h3 className="text-xl font-semibold mb-4">{t('cta.title')}</h3>
            <p>{t('cta.description')}</p>
            <a 
              href={`/${locale}/yhteystiedot`} 
              className="mt-4 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
            >
              {t('cta.button')}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
} 