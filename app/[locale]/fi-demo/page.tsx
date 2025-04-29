import { LeasingOptionsCards } from "@/app/components/LeasingOptionsCards"
import { setupServerLocale } from '@/app/i18n/server-utils'

export const dynamic = 'force-dynamic'

type Props = {
  params: {
    locale: string
  }
}

export default async function FiDemoPage({ params }: Props) {
  const { locale } = params
  await setupServerLocale(locale)
  
  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-12 text-center">Finnish Cards Demo</h1>
        
        <div className="max-w-7xl mx-auto">
          <LeasingOptionsCards />
        </div>
      </div>
    </main>
  )
} 