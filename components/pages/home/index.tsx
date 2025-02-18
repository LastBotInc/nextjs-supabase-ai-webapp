'use client'

import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/Button'
import { Link } from '@/app/i18n/navigation'
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs'
import { IconCode, IconBrain, IconDatabase, IconGlobe, IconRocket, IconShield } from '@/app/components/Icons'
import heroBackground from '@/public/images/hero-bg-template.webp'
import featuresIllustration from '@/public/images/features-illustration.webp'

// Pre-calculate blur data URL for better performance
const blurDataURL = 'data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAAAwAQCdASoBAAEADsD+JaQAA3AA/uaKSAB4AAAAVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AA/uaKSAB4AA=='

interface Props {
  params: {
    locale: string
  }
}

export default function HomePage({ params }: Props) {
  const { locale } = params
  const t = useTranslations('Index')

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <Image
            src={heroBackground}
            alt={t('hero.backgroundAlt')}
            fill
            priority
            quality={85}
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="100vw"
            className="object-cover opacity-40"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/80" 
            style={{ willChange: 'opacity' }}
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                href="https://github.com/LastBotInc/nextjs-supabase-ai-webapp"
                variant="gradient"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('hero.cta')}
              </Button>
              <Button 
                size="lg" 
                href="https://github.com/LastBotInc/nextjs-supabase-ai-webapp"
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('hero.docs')}
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Agentic Development Framework Section */}
      <section className="relative py-20 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                  {t('agentic.title')}
                </span>
                <br />
                <span className="text-2xl md:text-3xl text-gray-400 mt-2">
                  {t('agentic.subtitle')}
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {t('agentic.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Features */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  {t('agentic.features.title')}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('agentic.features.list.rules')}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('agentic.features.list.prompts')}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('agentic.features.list.tools')}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('agentic.features.list.validation')}
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('agentic.features.list.docs')}
                  </li>
                </ul>
              </div>

              {/* Benefits */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-2xl font-semibold mb-6 text-white">
                  {t('agentic.benefits.title')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                      <span className="text-gray-300">{t('agentic.benefits.quality')}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mr-3"></div>
                      <span className="text-gray-300">{t('agentic.benefits.completeness')}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-3"></div>
                      <span className="text-gray-300">{t('agentic.benefits.efficiency')}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-pink-400 mr-3"></div>
                      <span className="text-gray-300">{t('agentic.benefits.standards')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* AI Integration */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-indigo-500/50 transition-colors">
              <IconBrain className="w-12 h-12 text-indigo-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.ai.title')}</h3>
              <p className="text-gray-300">{t('features.ai.description')}</p>
            </div>

            {/* Development Tools */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/50 transition-colors">
              <IconCode className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.tools.title')}</h3>
              <p className="text-gray-300">{t('features.tools.description')}</p>
            </div>

            {/* Database & Auth */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-pink-500/50 transition-colors">
              <IconDatabase className="w-12 h-12 text-pink-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.database.title')}</h3>
              <p className="text-gray-300">{t('features.database.description')}</p>
            </div>

            {/* Internationalization */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-blue-500/50 transition-colors">
              <IconGlobe className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.i18n.title')}</h3>
              <p className="text-gray-300">{t('features.i18n.description')}</p>
            </div>

            {/* Performance */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-green-500/50 transition-colors">
              <IconRocket className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.performance.title')}</h3>
              <p className="text-gray-300">{t('features.performance.description')}</p>
            </div>

            {/* Security */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-yellow-500/50 transition-colors">
              <IconShield className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">{t('features.security.title')}</h3>
              <p className="text-gray-300">{t('features.security.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="relative py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {t('coreFeatures.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('coreFeatures.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Authentication & Users */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-indigo-400 transition-colors">
                {t('coreFeatures.auth.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.auth.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.auth.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Management */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-purple-400 transition-colors">
                {t('coreFeatures.content.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.content.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.content.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Internationalization */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-blue-400 transition-colors">
                {t('coreFeatures.i18n.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.i18n.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.i18n.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Analytics */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-green-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-green-400 transition-colors">
                {t('coreFeatures.analytics.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.analytics.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.analytics.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Booking System */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-pink-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-pink-400 transition-colors">
                {t('coreFeatures.booking.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.booking.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.booking.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Real-time Features */}
            <div className="group p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-yellow-400 transition-colors">
                {t('coreFeatures.realtime.title')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('coreFeatures.realtime.description')}
              </p>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map((num) => (
                  <li key={num} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`coreFeatures.realtime.feature${num}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Features */}
          <div className="mt-16 p-8 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800">
            <h3 className="text-2xl font-semibold mb-6 text-center text-white">
              {t('coreFeatures.technical.title')}
            </h3>
            <p className="text-gray-300 mb-8 text-center max-w-3xl mx-auto">
              {t('coreFeatures.technical.description')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num} className="flex items-center p-4 rounded-lg bg-gray-800/50">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300">{t(`coreFeatures.technical.feature${num}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="relative py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {t('getStarted.title')}
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {t('getStarted.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold">1</div>
                  <p className="text-gray-300">{t('getStarted.step1')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold">2</div>
                  <p className="text-gray-300">{t('getStarted.step2')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-semibold">3</div>
                  <p className="text-gray-300">{t('getStarted.step3')}</p>
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  variant="gradient"
                  href="https://github.com/LastBotInc/nextjs-supabase-ai-webapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('getStarted.cta')}
                </Button>
              </div>
            </div>
            <div className="relative h-[500px] group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Image
                src={featuresIllustration}
                alt={t('getStarted.imageAlt')}
                fill
                className="object-cover rounded-xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 