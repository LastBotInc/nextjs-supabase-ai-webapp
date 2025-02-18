import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/utils/metadata'
import HomePage from '@/components/pages/home/index'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('Index')
  const metadata = await generateLocalizedMetadata(locale, 'Index', {
    title: t('meta.title'),
    description: t('meta.description'),
    type: 'website',
    canonicalUrl: '/',
    image: '/images/og/home.webp'
  })
  return metadata
}

export default async function Page({ params }: Props) {
  const { locale } = await params
  return <HomePage params={{ locale }} />
}
