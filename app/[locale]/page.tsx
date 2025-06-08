import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/utils/metadata'
import { Suspense } from 'react'
import Image from 'next/image'
import { Button } from '@/app/components/Button'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
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
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Index' })

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 px-4 text-center bg-gradient-to-br from-white via-gray-50 to-blue-50 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
            <Image
              src="/images/homepage/hero-background.webp"
              alt={t('hero.title')}
              fill
              className="object-cover opacity-10"
              quality={90}
              priority
            />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-gray-900 leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl lg:text-2xl mb-12 max-w-4xl mx-auto text-gray-600 leading-relaxed font-medium">
              {t('hero.subheadline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button variant="primary" size="lg" className="shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                {t('hero.ctaStartMigration')}
              </Button>
              <Button variant="secondary" size="lg" className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg font-semibold">
                {t('hero.ctaScheduleDemo')}
              </Button>
            </div>
          </div>
        </section>

        {/* Key Benefits Bar */}
        <section className="py-20 lg:py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-8 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  {t('keyBenefits.dataAccuracy.value')}
                </h3>
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  {t('keyBenefits.dataAccuracy.title')}
                </p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-8 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  {t('keyBenefits.fasterMigration.value')}
                </h3>
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  {t('keyBenefits.fasterMigration.title')}
                </p>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-8 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-lg group-hover:shadow-xl transform group-hover:-translate-y-1">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                  {t('keyBenefits.aiOptimization.value')}
                </h3>
                <p className="text-lg text-gray-600 font-medium leading-relaxed">
                  {t('keyBenefits.aiOptimization.title')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* "The Smartest Way to Move to Shopify" Section */}
        <section className="py-20 lg:py-28 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 lg:mb-24">
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 text-gray-900 tracking-tight">
                {t('smartestWay.title')}
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
                Our AI-powered process ensures seamless migration with continuous optimization
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-8 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('smartestWay.collectData.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('smartestWay.collectData.description')}
                </p>
              </div>
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-8 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('smartestWay.analyze.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('smartestWay.analyze.description')}
                </p>
              </div>
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-8 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('smartestWay.localize.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('smartestWay.localize.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Deep Dive Sections */}
        <section className="py-20 lg:py-28 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Content & SEO Optimization */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24 lg:mb-32">
              <div className="space-y-8">
                <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                  {t('featureDive.contentSeo.title')}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                  {t('featureDive.contentSeo.description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-semibold shadow-md">
                    Image Optimization
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-semibold shadow-md">
                    SEO Enhancement
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-sm font-semibold shadow-md">
                    Content Analysis
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-3 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transform rotate-1 opacity-30"></div>
                <div className="relative bg-white p-3 rounded-2xl shadow-2xl border border-gray-100">
                  <Image
                    src="/images/homepage/feature-content-seo.webp"
                    alt={t('featureDive.contentSeo.title')}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-xl"
                    quality={90}
                  />
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24 lg:mb-32">
              <div className="relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl transform -rotate-3 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl transform -rotate-1 opacity-30"></div>
                <div className="relative bg-white p-3 rounded-2xl shadow-2xl border border-gray-100">
                  <Image
                    src="/images/homepage/feature-collaboration.webp"
                    alt={t('featureDive.collaborate.title')}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-xl"
                    quality={90}
                  />
                </div>
              </div>
              <div className="space-y-8 order-1 lg:order-2">
                <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                  {t('featureDive.collaborate.title')}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                  {t('featureDive.collaborate.description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full text-sm font-semibold shadow-md">
                    Expert Partnership
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 rounded-full text-sm font-semibold shadow-md">
                    Real-time Collaboration
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 rounded-full text-sm font-semibold shadow-md">
                    Seamless Communication
                  </span>
                </div>
              </div>
            </div>

            {/* Succeed with Shopify */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <div className="space-y-8">
                <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
                  {t('featureDive.succeedWithShopify.title')}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                  {t('featureDive.succeedWithShopify.description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-5 py-3 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 rounded-full text-sm font-semibold shadow-md">
                    Future-Proof
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 rounded-full text-sm font-semibold shadow-md">
                    Scalable Growth
                  </span>
                  <span className="px-5 py-3 bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 rounded-full text-sm font-semibold shadow-md">
                    Optimized Performance
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl transform rotate-3 opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl transform rotate-1 opacity-30"></div>
                <div className="relative bg-white p-3 rounded-2xl shadow-2xl border border-gray-100">
                  <Image
                    src="/images/homepage/feature-succeed-shopify.webp"
                    alt={t('featureDive.succeedWithShopify.title')}
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-xl"
                    quality={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* "The Foundation for Intelligent eCommerce" Section */}
        <section className="py-20 lg:py-28 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-10 text-gray-900 tracking-tight">
              {t('foundation.title')}
            </h2>
            <p className="text-xl lg:text-2xl mb-20 max-w-4xl mx-auto text-gray-600 leading-relaxed font-medium">
              {t('foundation.description')}
            </p>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-20">
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('foundation.benefit1.title')}
                </h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('foundation.benefit1.description')}
                </p>
              </div>
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('foundation.benefit2.title')}
                </h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('foundation.benefit2.description')}
                </p>
              </div>
              <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('foundation.benefit3.title')}
                </h4>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t('foundation.benefit3.description')}
                </p>
              </div>
            </div>
            <Button variant="primary" size="lg" className="shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg font-semibold">
              {t('foundation.cta')}
            </Button>
          </div>
        </section>

        {/* "Why AI-Powered Migration?" Section */}
        <section className="py-20 lg:py-28 px-4 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-20 lg:mb-24 tracking-tight">
              {t('whyAI.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="p-10 lg:p-12 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 group">
                <h3 className="text-6xl lg:text-7xl font-bold text-blue-400 mb-6 tracking-tight group-hover:text-blue-300 transition-colors duration-300">
                  {t('whyAI.benefit1.value')}
                </h3>
                <p className="text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed">
                  {t('whyAI.benefit1.title')}
                </p>
              </div>
              <div className="p-10 lg:p-12 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 group">
                <h3 className="text-6xl lg:text-7xl font-bold text-green-400 mb-6 tracking-tight group-hover:text-green-300 transition-colors duration-300">
                  {t('whyAI.benefit2.value')}
                </h3>
                <p className="text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed">
                  {t('whyAI.benefit2.title')}
                </p>
              </div>
              <div className="p-10 lg:p-12 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/70 transition-all duration-300 transform hover:-translate-y-2 group">
                <h3 className="text-6xl lg:text-7xl font-bold text-purple-400 mb-6 tracking-tight group-hover:text-purple-300 transition-colors duration-300">
                  {t('whyAI.benefit3.value')}
                </h3>
                <p className="text-xl lg:text-2xl text-gray-300 font-medium leading-relaxed">
                  {t('whyAI.benefit3.title')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof/Testimonials Section */}
        <section className="py-20 lg:py-28 px-4 bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-16 text-gray-900 tracking-tight">
              {t('socialProof.title')}
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-12 lg:p-16 rounded-2xl border border-gray-200 shadow-lg">
              <p className="text-xl text-gray-500 italic leading-relaxed">
                {t('socialProof.placeholder')}
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 lg:py-32 px-4 text-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-5xl mx-auto">
            <h2 className="text-5xl lg:text-7xl font-bold mb-10 leading-tight tracking-tight">
              {t('finalCta.title')}
            </h2>
            <p className="text-xl lg:text-2xl mb-16 max-w-3xl mx-auto text-gray-300 leading-relaxed font-medium">
              {t('finalCta.description')}
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 text-xl px-12 py-6 font-bold"
            >
              {t('finalCta.cta')}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 lg:py-20 text-center bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-gray-600 text-lg font-medium">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          {/* Add other footer links here */}
        </div>
      </footer>
    </div>
  )
}
