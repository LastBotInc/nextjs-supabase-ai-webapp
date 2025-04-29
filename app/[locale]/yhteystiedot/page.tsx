'use server'

import { getTranslations, getFormatter } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'Contact.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations('Contact')
  const format = await getFormatter({ locale })

  // Office locations data
  const offices = [
    {
      city: 'Helsinki',
      address: 'Mannerheimintie 10',
      postCode: '00100 Helsinki',
      phone: '+358 10 123 4567',
      email: 'helsinki@innolease.fi'
    },
    {
      city: 'Oulu',
      address: 'Ratamotie 24',
      postCode: '90630 Oulu',
      phone: '+358 10 123 4568',
      email: 'oulu@innolease.fi'
    },
    {
      city: 'Vantaa',
      address: 'Äyritie 8 C',
      postCode: '01510 Vantaa',
      phone: '+358 10 123 4569',
      email: 'vantaa@innolease.fi'
    },
    {
      city: 'Raisio',
      address: 'Kauppakatu 2',
      postCode: '21200 Raisio',
      phone: '+358 10 123 4570',
      email: 'raisio@innolease.fi'
    }
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('intro')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">{t('form.title')}</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('form.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                {t('form.subject')}
              </label>
              <select
                id="subject"
                name="subject"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="leasing">{t('form.subjects.leasing')}</option>
                <option value="service">{t('form.subjects.service')}</option>
                <option value="fleet">{t('form.subjects.fleet')}</option>
                <option value="other">{t('form.subjects.other')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                {t('form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              ></textarea>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                {t('form.submit')}
              </button>
            </div>
          </form>
        </div>

        {/* Office Locations */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">{t('offices.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offices.map((office) => (
              <div key={office.city} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{office.city}</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{office.address}</p>
                  <p>{office.postCode}</p>
                  <p className="mt-3">{office.phone}</p>
                  <p>{office.email}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('hours.title')}
            </h3>
            <div className="text-gray-600 space-y-1">
              <p>
                {t('hours.weekdays')}: 8:00 - 17:00
              </p>
              <p>
                {t('hours.saturday')}: 10:00 - 14:00
              </p>
              <p>
                {t('hours.sunday')}: {t('hours.closed')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 