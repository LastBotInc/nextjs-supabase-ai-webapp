import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import LeasingSolutionsPage from '@/components/pages/leasing-solutions'

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('LeasingSolutions.meta')
  
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LeasingSolutions({ params }: Props) {
  return <LeasingSolutionsPage locale={params.locale} />
} 