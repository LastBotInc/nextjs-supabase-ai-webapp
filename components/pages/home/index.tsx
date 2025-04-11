'use client'

import Image from "next/image"
import { useTranslations } from 'next-intl'
import { Button } from '@/app/components/Button'
import { Link } from '@/app/i18n/navigation'
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs'
import { IconCode, IconBrain, IconDatabase, IconGlobe, IconRocket, IconShield, IconCar, IconTools, IconChart, IconPolicy, IconUser, IconLeaf, IconTruck, IconCalendar } from '@/app/components/Icons'
import heroBackground from '@/public/images/innolease/hero-background.png'
import leasingSolutionsImage from '@/public/images/innolease/leasing-solutions-updated.png'
import fleetManagementImage from '@/public/images/innolease/fleet-management-updated.png'

// Pre-calculate blur data URL for better performance
const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <Image
            src={heroBackground}
            alt={t('hero.backgroundAlt')}
            fill
            priority
            quality={90}
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="100vw"
            className="object-cover opacity-85"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/80" 
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-gradient-x">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                href="/contact"
                variant="gradient"
              >
                {t('hero.cta')}
              </Button>
              <Button 
                size="lg" 
                href="/leasing-solutions"
                variant="secondary"
              >
                {t('hero.learnMore')}
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

      {/* Campaigns Section - New */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t('campaigns.title')} 
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Campaign Card 1: Ford Transit */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
              <div className="relative h-52">
                <Image 
                  src="/images/campaigns/ford-transit-custom.webp"
                  alt="Ford Transit Custom Campaign"
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {t('campaigns.tagline1')} 
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-gray-900">Ford Transit Custom</h3>
                <p className="text-gray-700 text-sm mb-3">{t('campaigns.price1')}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('campaigns.tag1_1')}</span> 
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('campaigns.tag1_2')}</span> 
                   <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('campaigns.tag1_3')}</span> 
                </div>
                <Button href="#" variant="secondary" size="sm">
                  {t('campaigns.cta')}
                </Button>
              </div>
            </div>

            {/* Campaign Card 2: Polestar 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden group">
              <div className="relative h-52">
                <Image 
                  src="/images/campaigns/polestar-2.webp"
                  alt="Polestar 2 Campaign"
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                />
                <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                  {t('campaigns.tagline2')}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-gray-900">Polestar 2</h3>
                <p className="text-gray-700 text-sm mb-3">{t('campaigns.price2')}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('campaigns.tag2_1')}</span> 
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('campaigns.tag2_2')}</span> 
                </div>
                <Button href="#" variant="secondary" size="sm">
                   {t('campaigns.cta')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leasing Solutions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t('leasing.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('leasing.description')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            <div className="lg:w-1/2">
              <Image 
                src={leasingSolutionsImage}
                alt="Leasing solutions"
                className="rounded-lg shadow-xl"
                width={800}
                height={450}
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
            <div className="lg:w-1/2 grid md:grid-cols-2 gap-6">
              {/* Financial Leasing */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <IconCar className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('leasing.financial.title')}</h3>
                <p className="text-gray-700 mb-4">{t('leasing.financial.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.financial.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.financial.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.financial.feature3')}</span>
                  </li>
                </ul>
              </div>

              {/* Flexible Leasing */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <IconTruck className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('leasing.flexible.title')}</h3>
                <p className="text-gray-700 mb-4">{t('leasing.flexible.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.flexible.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.flexible.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.flexible.feature3')}</span>
                  </li>
                </ul>
              </div>

              {/* Maintenance Leasing */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <IconTools className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('leasing.maintenance.title')}</h3>
                <p className="text-gray-700 mb-4">{t('leasing.maintenance.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.maintenance.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.maintenance.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.maintenance.feature3')}</span>
                  </li>
                </ul>
              </div>

              {/* MiniLeasing */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <IconCalendar className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('leasing.mini.title')}</h3>
                <p className="text-gray-700 mb-4">{t('leasing.mini.description')}</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.mini.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.mini.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-800">{t('leasing.mini.feature3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button href="/leasing-solutions" variant="primary" size="lg">
              {t('leasing.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Fleet Management Tools Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t('fleet.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('fleet.description')}
            </p>
          </div>

          <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* InnoFleet Manager */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <IconChart className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('fleet.manager.title')}</h3>
                <p className="text-gray-700">{t('fleet.manager.description')}</p>
              </div>

              {/* Emission & Fleet Reports */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <IconChart className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('fleet.reports.title')}</h3>
                <p className="text-gray-700">{t('fleet.reports.description')}</p>
              </div>

              {/* Policy & Procurement */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <IconPolicy className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('fleet.policy.title')}</h3>
                <p className="text-gray-700">{t('fleet.policy.description')}</p>
              </div>

              {/* Driver Tools */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <IconUser className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{t('fleet.driver.title')}</h3>
                <p className="text-gray-700">{t('fleet.driver.description')}</p>
              </div>
            </div>
            <div className="lg:w-1/2">
              <Image 
                src={fleetManagementImage}
                alt="Fleet management dashboard"
                className="rounded-lg shadow-xl"
                width={800}
                height={450}
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button href="/fleet-management" variant="primary" size="lg">
              {t('fleet.cta')}
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 inline-block text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 font-medium">"{t('testimonials.testimonial1.quote')}"</p>
              <div>
                <p className="font-bold text-gray-900">{t('testimonials.testimonial1.author')}</p>
                <p className="text-gray-700">{t('testimonials.testimonial1.company')}</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 inline-block text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 font-medium">"{t('testimonials.testimonial2.quote')}"</p>
              <div>
                <p className="font-bold text-gray-900">{t('testimonials.testimonial2.author')}</p>
                <p className="text-gray-700">{t('testimonials.testimonial2.company')}</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 inline-block text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 font-medium">"{t('testimonials.testimonial3.quote')}"</p>
              <div>
                <p className="font-bold text-gray-900">{t('testimonials.testimonial3.author')}</p>
                <p className="text-gray-700">{t('testimonials.testimonial3.company')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Partners Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t('partners.title')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('partners.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl text-center shadow-md">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Vianor</h3>
              <p className="text-gray-700">{t('partners.vianor')}</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-md">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Euromaster</h3>
              <p className="text-gray-700">{t('partners.euromaster')}</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center shadow-md">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">A-Katsastus</h3>
              <p className="text-gray-700">{t('partners.katsastus')}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-semibold text-blue-700">{t('partners.coverage')}</p>
          </div>
        </div>
      </section>

      {/* Environmental Responsibility Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">
                  {t('environmental.title')}
                </h2>
                <p className="text-xl text-gray-700 mb-6">
                  {t('environmental.description')}
                </p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <IconLeaf className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                    <span className="text-gray-800">{t('environmental.feature1')}</span>
                  </li>
                  <li className="flex items-start">
                    <IconLeaf className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                    <span className="text-gray-800">{t('environmental.feature2')}</span>
                  </li>
                  <li className="flex items-start">
                    <IconLeaf className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                    <span className="text-gray-800">{t('environmental.feature3')}</span>
                  </li>
                  <li className="flex items-start">
                    <IconLeaf className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                    <span className="text-gray-800">{t('environmental.feature4')}</span>
                  </li>
                </ul>

                <Button 
                  href="/environmental"
                  variant="secondary"
                  size="lg"
                >
                  {t('environmental.cta')}
                </Button>
              </div>
              <div className="md:w-1/2 bg-green-50 p-8 rounded-xl">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Fleet Emissions Savings</h3>
                    <span className="text-sm text-green-700 font-medium">-32% CO₂</span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded-full mb-4">
                    <div className="h-4 rounded-full bg-green-500" style={{ width: '68%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-700">Current Fleet</p>
                      <p className="text-2xl font-bold text-gray-900">68<span className="text-sm">g/km</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Previous Fleet</p>
                      <p className="text-2xl font-bold text-gray-900">100<span className="text-sm">g/km</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Electric Vehicles</p>
                      <p className="text-2xl font-bold text-gray-900">24<span className="text-sm">%</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">Hybrid Vehicles</p>
                      <p className="text-2xl font-bold text-gray-900">38<span className="text-sm">%</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              {t('cta.description')}
            </p>
            <Button 
              href="/contact"
              variant="white"
              size="lg"
              className="mb-4"
            >
              {t('cta.button')}
            </Button>
            <p className="text-blue-100 font-medium">
              {t('cta.contact')}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
} 