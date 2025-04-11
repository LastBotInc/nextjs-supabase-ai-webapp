import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/app/i18n/navigation'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'
import { Metadata } from 'next'

interface Props {
  params: { locale: string }
}

// Static page
export const dynamic = 'force-static'

// Metadata generation for Presentations page
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return generateLocalizedMetadata({ 
    locale, 
    namespace: 'Presentations.meta', // Assuming a meta namespace exists
    path: '/presentations' // Specify path
  });
}

// Static presentation data
const presentations = [
  {
    slug: 'ai-leasing-solutions',
    title: 'AI-Powered Leasing Solutions',
    description: 'How AI streamlines vehicle leasing and fleet management for Innolease clients.',
    image: '/images/presentations/ai-leasing.webp'
  },
  {
    slug: 'digital-fleet-management',
    title: 'Innolease Digital Fleet Tools',
    description: 'Exploring the capabilities of InnoFleet Manager and reporting tools.',
    image: '/images/presentations/fleet-tools.webp'
  },
  {
    slug: 'ev-transition-strategies',
    title: 'Strategies for EV Fleet Transition',
    description: 'Innolease guidance on navigating the shift to electric vehicles.',
    image: '/images/presentations/ev-transition.webp'
  }
  // Add more presentations here as static data
]

export default async function PresentationsPage({ params: { locale } }: Props) {
  const t = await getTranslations('Presentations')

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('title'),
    description: t('description'),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/presentations`,
    publisher: {
      '@type': 'Organization',
      name: 'LastBot Inc',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    hasPart: presentations.map((presentation) => ({
      '@type': 'PresentationDigitalDocument',
      headline: presentation.title,
      description: presentation.description,
      image: presentation.image,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/presentations/${presentation.slug}`,
    }))
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          <AnimatedOrbs className="absolute inset-0 -z-10" />
          <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
          <p className="text-xl mb-12">{t('description')}</p>
        </div>

        {presentations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('noPresentations')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {presentations.map((presentation) => (
              <Link
                key={presentation.slug}
                href={`/presentations/${presentation.slug}`}
                locale={locale}
                className="group block"
              >
                <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="relative h-48">
                    <Image
                      src={presentation.image}
                      alt={presentation.title}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500">
                      {presentation.title}
                    </h2>
                    {presentation.description && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {presentation.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="text-blue-600 group-hover:underline">View Presentation &rarr;</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
} 