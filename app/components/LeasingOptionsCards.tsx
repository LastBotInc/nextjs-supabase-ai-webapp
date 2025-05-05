'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

interface LeasingOptionsCardsProps {
  className?: string;
}

export function LeasingOptionsCards({ className = "" }: LeasingOptionsCardsProps) {
  const t = useTranslations('Home')
  const locale = useLocale()
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Left Card - Personal Leasing */}
      <div className="relative bg-kupari rounded-2xl overflow-hidden has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-15">
        <div className="p-6 pb-16 relative">
          <div className="max-w-[50%]">
            <h3 className="text-2xl font-bold mb-2 text-left leading-tight">
              {t('leasingOptions.personalizedTitle')}
            </h3>
            <p className="text-sm mb-4 text-left">
              {t('leasingOptions.personalizedDescription')}
            </p>
            
            <Link 
              href={`/${locale}/personal-leasing`} 
              className="inline-block bg-white text-piki px-4 py-1.5 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm"
            >
              {t('leasingOptions.learnMore')}
            </Link>
          </div>
        </div>
        
        <div className="absolute right-[-5%] bottom-[-5%] w-[80%] h-[70%] z-0 pointer-events-none">
          <Image 
            src="/images/no-bg/mercedes-car.png"
            alt="Mercedes"
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 900px) 100vw, 50vw"
            quality={90}
          />
        </div>
      </div>
      
      {/* Right Card - Fleet Management */}
      <div className="relative bg-betoni rounded-2xl overflow-hidden has-overlay-pattern overlay-pattern-innolease-2 overlay-opacity-15 text-white">
        <div className="p-6 pb-16 relative">
          <div className="max-w-[50%]">
            <h3 className="text-2xl font-bold mb-2 text-left leading-tight">
              {t('leasingOptions.flexibleTitle')}
            </h3>
            <p className="text-sm mb-4 text-left">
              {t('leasingOptions.flexibleDescription')}
            </p>
            
            <Link 
              href={`/${locale}/business-leasing`}
              className="inline-block bg-kupari text-white px-4 py-1.5 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm"
            >
              {t('leasingOptions.learnMore')}
            </Link>
          </div>
        </div>
        
        <div className="absolute right-[-5%] bottom-[-5%] w-[80%] h-[70%] z-0 pointer-events-none">
          <Image 
            src="/images/no-bg/pickup-truck.png"
            alt="Pickup truck"
            fill
            className="object-contain object-bottom"
            sizes="(max-width: 900px) 100vw, 50vw"
            quality={90}
          />
        </div>
      </div>
    </div>
  )
} 