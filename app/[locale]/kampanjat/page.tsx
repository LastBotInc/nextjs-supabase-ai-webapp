'use server'

import { getTranslations, getFormatter } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'
import Link from 'next/link'
import Image from 'next/image'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Campaigns.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

// Sample campaign data
const campaigns = [
  {
    id: 'ford-transit',
    title: 'Ford Transit Connect',
    tagline: 'Limited Stock',
    image: '/images/ford-transit.webp',
    price: '399',
    tags: ['Van', 'Diesel'],
    features: ['Bluetooth', 'GPS', 'Reverse Camera', 'Climate Control']
  },
  {
    id: 'polestar-2',
    title: 'Polestar 2',
    tagline: 'All-Electric',
    image: '/images/polestar-2.webp',
    price: '499',
    tags: ['Electric', 'AWD'],
    features: ['Autopilot', 'Smartphone Integration', 'Premium Sound', 'Leather Interior']
  },
  {
    id: 'volvo-xc40',
    title: 'Volvo XC40 Recharge',
    tagline: 'New Arrival',
    image: '/images/placeholder-car.webp',
    price: '579',
    tags: ['SUV', 'Electric'],
    features: ['AWD', 'Safety Package', 'Panoramic Roof', 'Heated Seats']
  },
  {
    id: 'skoda-enyaq',
    title: 'Škoda Enyaq iV',
    tagline: 'Business Edition',
    image: '/images/placeholder-car.webp',
    price: '449',
    tags: ['SUV', 'Electric'],
    features: ['80 kWh Battery', 'LED Matrix Headlights', 'Adaptive Cruise Control', 'Canton Sound System']
  }
]

export default async function CampaignsPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations('Campaigns')
  const format = await getFormatter({ locale })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('intro')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            <div className="relative h-64">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-amber-600 text-white px-2 py-1 rounded text-sm font-medium">
                {campaign.tagline}
              </div>
            </div>
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{campaign.title}</h2>
                <p className="text-amber-600 font-bold">
                  {t('from')} {campaign.price}€/{t('month')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <ul className="mb-6 space-y-1">
                {campaign.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600 flex items-center">
                    <svg className="h-4 w-4 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-6">
              <Link 
                href={`/${locale}/kampanjat/${campaign.id}`}
                className="w-full block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                {t('view_offer')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cta.title')}</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          {t('cta.description')}
        </p>
        <Link
          href={`/${locale}/yhteystiedot`}
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
        >
          {t('cta.button')}
        </Link>
      </div>
    </main>
  )
} 