import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/app/i18n/navigation'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'

interface Props {
  params: Promise<{
    locale: Locale
  }>
}

// Static page
export const dynamic = 'force-static'

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('Presentations')

  return generateLocalizedMetadata(locale, 'Presentations', {
    title: t('title'),
    description: t('description'),
    type: 'website',
    canonicalUrl: '/presentations'
  })
}

// Static presentation data
const presentations = [
  {
    slug: 'ai-in-etail',
    title: 'AI in eTail - Future Of Commerce',
    description: "Discover how generative AI is revolutionizing eCommerce, from personalized shopping experiences to intelligent operations and LastBot's cutting-edge solutions.",
    preview_image: '/images/presentations/ai-etail-preview.webp',
    slides_count: 6,
    created_at: '2024-03-19T00:00:00Z'
  },
  {
    slug: 'navigating-ai-transformation',
    title: 'Navigating AI Transformation',
    description: 'A comprehensive guide to understanding how AI is transforming software development, business operations, and user experiences',
    preview_image: '/images/presentations/ai-transformation-preview.webp',
    slides_count: 5,
    created_at: '2024-01-27T00:00:00Z'
  }
  // Add more presentations here as static data
]

export default async function PresentationsPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale)
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
      image: presentation.preview_image,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/presentations/${presentation.slug}`,
      author: {
        '@type': 'Organization',
        name: 'LastBot Team'
      }
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
                  {presentation.preview_image && (
                    <div className="relative h-48">
                      <Image
                        src={presentation.preview_image}
                        alt={presentation.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
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
                      <time dateTime={presentation.created_at}>
                        {new Date(presentation.created_at).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <div className="flex items-center">
                        <span className="text-sm">
                          {presentation.slides_count} {t('slides')}
                        </span>
                      </div>
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