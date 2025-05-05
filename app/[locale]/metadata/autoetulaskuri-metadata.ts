import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations({ locale, namespace: 'CarBenefitCalculator.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
} 