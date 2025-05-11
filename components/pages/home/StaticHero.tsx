'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/Button'
import heroBackground from '@/public/images/hero-bg-template.webp'

interface StaticHeroProps {
  locale: string;
}

export default function StaticHero({ locale }: StaticHeroProps) {
  const t = useTranslations('Index')

  return (
    <section className="relative min-h-[95vh] overflow-hidden bg-gray-900">
      {/* Background gradient for the entire section */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/60 z-10" />
      
      {/* Content split into two columns */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 min-h-[95vh]">
        {/* Left Side - Text Content */}
        <div className="flex flex-col justify-center px-6 md:px-12 py-10">
          <div className="max-w-lg mx-auto md:mx-0 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
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
        
        {/* Right Side - Image Only for now */}
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={heroBackground}
              alt={t('hero.backgroundAlt')}
              fill
              priority
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-80"
            />
            
            {/* Gradient overlay for image */}
            <div className="absolute inset-0 bg-gradient-to-l from-gray-900/40 via-gray-900/20 to-transparent" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  )
} 