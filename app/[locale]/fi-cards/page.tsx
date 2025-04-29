import { setupServerLocale } from '@/app/i18n/server-utils'
import { LeasingOptionsCards } from '@/app/components/LeasingOptionsCards'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

type Props = {
  params: {
    locale: string
  }
}

export default async function FiCardsPage({ params }: Props) {
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Finnish Leasing Cards Example</h1>
      
      <LeasingOptionsCards />
    </main>
  )
} 