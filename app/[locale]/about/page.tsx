'use server';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from '@/components/contact/ContactForm';
import { Button } from '@/app/components/Button';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { setupServerLocale } from '@/app/i18n/server-utils';
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs';
import SectionContainer from '@/app/components/SectionContainer';
import { generateLocalizedMetadata } from '@/utils/metadata'

interface Props {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('About');
  return generateLocalizedMetadata(locale, 'About', {
    title: t('title'),
    description: t('description'),
    canonicalUrl: '/about'
  })
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations('About');

  const teamMembers = [
    { name: "Teemu Ruuska", title: t('team.title1'), image: "/images/team/teemu.jpg" },
    { name: "Sami Vuorio", title: t('team.title2'), image: "/images/team/sami.jpg" },
    { name: "Ville Vähäsaari", title: t('team.title3'), image: "/images/team/ville.jpg" },
    // Add more team members if available
  ];

  const partners = [
    { name: "Autolle.com", logo: "/images/partners/autolle.png", url: "https://autolle.com" },
    { name: "Vianor", logo: "/images/partners/vianor.png", url: "https://vianor.fi" },
    { name: "Euromaster", logo: "/images/partners/euromaster.png", url: "https://www.euromaster.fi" },
    { name: "A-Katsastus", logo: "/images/partners/a-katsastus.png", url: "https://www.a-katsastus.fi" },
    // Add more partners
  ];

  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
            <p className="text-xl text-gray-300">{t('subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Company History & Autolle.com Connection */}
      <SectionContainer>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t('history.title')}</h2>
            <p className="text-lg text-gray-700 mb-4">{t('history.paragraph1')}</p>
            <p className="text-gray-700 mb-6">{t('history.paragraph2')}</p>
            <Button href="https://autolle.com" target="_blank" variant="secondary">
              {t('history.autolleButton')}
            </Button>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            {/* Placeholder for an image related to Autolle.com or Innolease history */}
            <Image src="/images/office-building.jpg" alt={t('history.imageAlt')} fill className="object-cover" />
          </div>
        </div>
      </SectionContainer>

      {/* Our Values */}
      <SectionContainer bgColor="bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">{t('values.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-6 bg-white rounded-lg shadow">
              {/* Placeholder for icons related to values */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl">
                  {/* Example Icon Placeholder - replace with actual icons */}
                  {i === 1 && '🤝'} {i === 2 && '💡'} {i === 3 && '📈'}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(`values.value${i}.title`)}</h3>
              <p className="text-gray-600">{t(`values.value${i}.description`)}</p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Leadership Team */}
      <SectionContainer>
        <h2 className="text-3xl font-bold text-center mb-12">{t('team.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                <Image src={member.image} alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-blue-600 text-sm">{member.title}</p>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Service Coverage & Fleet Stats (Consider using a map component if available) */}
      <SectionContainer bgColor="bg-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t('coverage.title')}</h2>
            <p className="text-lg text-gray-700 mb-6">{t('coverage.description')}</p>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-blue-600">{t('stats.fleetSize')}</p>
                <p className="text-gray-600">{t('stats.fleetSizeLabel')}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-blue-600">{t('stats.satisfactionRate')}%</p>
                <p className="text-gray-600">{t('stats.satisfactionRateLabel')}</p>
              </div>
            </div>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
            {/* Placeholder for a map image or an interactive map component */}
            <span className="text-gray-500">{t('coverage.mapPlaceholder')}</span>
            {/* Example using an image:
            <Image src="/images/finland-map.png" alt={t('coverage.mapAlt')} fill className="object-contain p-4" /> */}
          </div>
        </div>
      </SectionContainer>

      {/* Partners */}
      <SectionContainer>
        <h2 className="text-3xl font-bold text-center mb-12">{t('partners.title')}</h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-12 w-32 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition duration-300"
            >
              <Image src={partner.logo} alt={partner.name} fill className="object-contain" />
            </a>
          ))}
        </div>
      </SectionContainer>

      {/* Call to Action */}
      <section className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-blue-100 mb-8">{t('cta.description')}</p>
            <Button href="/contact" variant="white" size="lg">
              {t('cta.button')}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
