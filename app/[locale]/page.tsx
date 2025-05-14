import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/utils/metadata'
import { Suspense } from 'react'
import Image from 'next/image'
import { Button } from '@/app/components/Button'

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Index' })
  const metadata = await generateLocalizedMetadata(locale, 'Index', {
    title: t('hero.title'),
    description: t('hero.subheadline'),
    type: 'website',
    canonicalUrl: '/',
    image: '/images/og/home.webp'
  })
  return metadata
}

export default async function Page({ params }: Props) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Index' })

  return (
    <div className="flex flex-col min-h-screen bg-light-background text-light-text">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center bg-light-card overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src="/images/homepage/hero-background.webp"
              alt={t('hero.title')}
              layout="fill"
              objectFit="cover"
              quality={90}
              priority
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-6">{t('hero.title')}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{t('hero.subheadline')}</p>
            <div className="space-x-4">
              <Button variant="primary">{t('hero.ctaStartMigration')}</Button>
              <Button variant="secondary">{t('hero.ctaScheduleDemo')}</Button>
            </div>
          </div>
        </section>

        {/* Key Benefits Bar */}
        <section className="py-12 bg-light-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-2xl font-semibold text-light-text">{t('keyBenefits.dataAccuracy.title')}</h3>
                <p className="text-gray-600">{t('keyBenefits.dataAccuracy.value')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-light-text">{t('keyBenefits.fasterMigration.title')}</h3>
                <p className="text-gray-600">{t('keyBenefits.fasterMigration.value')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-light-text">{t('keyBenefits.aiOptimization.title')}</h3>
                <p className="text-gray-600">{t('keyBenefits.aiOptimization.value')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* "The Smartest Way to Move to Shopify" Section */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12 text-light-text">{t('smartestWay.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-3 text-light-text">{t('smartestWay.collectData.title')}</h3>
                <p className="text-gray-600">{t('smartestWay.collectData.description')}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-3 text-light-text">{t('smartestWay.analyze.title')}</h3>
                <p className="text-gray-600">{t('smartestWay.analyze.description')}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-3 text-light-text">{t('smartestWay.localize.title')}</h3>
                <p className="text-gray-600">{t('smartestWay.localize.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Deep Dive Sections */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="lg:col-span-1">
                <h3 className="text-3xl font-bold mb-4 text-light-text">{t('featureDive.contentSeo.title')}</h3>
                <p className="mb-4 text-gray-600">{t('featureDive.contentSeo.description')}</p>
              </div>
              <div className="lg:col-span-1 relative h-80 rounded-lg overflow-hidden">
                <Image
                  src="/images/homepage/feature-content-seo.webp"
                  alt={t('featureDive.contentSeo.title')}
                  layout="fill"
                  objectFit="cover"
                  quality={80}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16">
              <div className="lg:col-span-1 relative h-80 rounded-lg overflow-hidden order-first lg:order-last">
                <Image
                  src="/images/homepage/feature-collaboration.webp"
                  alt={t('featureDive.collaborate.title')}
                  layout="fill"
                  objectFit="cover"
                  quality={80}
                  className="rounded-lg"
                />
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-3xl font-bold mb-4 text-light-text">{t('featureDive.collaborate.title')}</h3>
                <p className="mb-4 text-gray-600">{t('featureDive.collaborate.description')}</p>
              </div>
            </div>
             <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="lg:col-span-1">
                <h3 className="text-3xl font-bold mb-4 text-light-text">{t('featureDive.succeedWithShopify.title')}</h3>
                <p className="mb-4 text-gray-600">{t('featureDive.succeedWithShopify.description')}</p>
              </div>
              <div className="lg:col-span-1 relative h-80 rounded-lg overflow-hidden">
                <Image
                  src="/images/homepage/feature-succeed-shopify.webp"
                  alt={t('featureDive.succeedWithShopify.title')}
                  layout="fill"
                  objectFit="cover"
                  quality={80}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* "The Foundation for Intelligent eCommerce" Section */}
        <section className="py-16 px-4 text-center bg-light-background">
          <h2 className="text-4xl font-bold mb-6 text-light-text">{t('foundation.title')}</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-gray-600">{t('foundation.description')}</p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 text-light-text">{t('foundation.benefit1.title')}</h4>
              <p className="text-gray-600">{t('foundation.benefit1.description')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 text-light-text">{t('foundation.benefit2.title')}</h4>
              <p className="text-gray-600">{t('foundation.benefit2.description')}</p>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2 text-light-text">{t('foundation.benefit3.title')}</h4>
              <p className="text-gray-600">{t('foundation.benefit3.description')}</p>
            </div>
          </div>
          <Button variant="primary">{t('foundation.cta')}</Button>
        </section>

        {/* "Why AI-Powered Migration?" Section */}
        <section className="py-16 px-4 bg-dark-background text-dark-text">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold mb-12">{t('whyAI.title')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
                {/* Reusing keyBenefits structure for consistency, or can be custom */}
              <div className="p-6">
                <h3 className="text-5xl font-bold text-brand-blue mb-2">{t('whyAI.benefit1.value')}</h3>
                <p className="text-xl">{t('whyAI.benefit1.title')}</p>
              </div>
              <div className="p-6">
                <h3 className="text-5xl font-bold text-brand-blue mb-2">{t('whyAI.benefit2.value')}</h3>
                <p className="text-xl">{t('whyAI.benefit2.title')}</p>
              </div>
              <div className="p-6">
                <h3 className="text-5xl font-bold text-brand-blue mb-2">{t('whyAI.benefit3.value')}</h3>
                 <p className="text-xl">{t('whyAI.benefit3.title')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof/Testimonials Section (Placeholder) */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-light-text">{t('socialProof.title')}</h2>
            <p className="italic text-gray-500">{t('socialProof.placeholder')}</p>
            {/* Placeholder for testimonials or logos */}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 text-center bg-light-card">
          <h2 className="text-4xl font-bold mb-4 text-light-text">{t('finalCta.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">{t('finalCta.description')}</p>
          <Button variant="darkCta">{t('finalCta.cta')}</Button>
        </section>
      </main>

      {/* <Footer /> */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-300 bg-light-background">
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        {/* Add other footer links here */}
      </footer>
    </div>
  )
}
