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
import { Globe, BarChart, Users, ShieldCheck } from 'lucide-react';

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

      {/* Introduction / History - Updated */}
      <SectionContainer>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{t('intro.title')}</h2>
            <p className="text-lg text-gray-700 mb-4">{t('intro.paragraph1')}</p>
            <p className="text-gray-700 mb-6">{t('intro.paragraph2')}</p>
            <p className="text-gray-700 mb-6">{t('intro.paragraph3')}</p>
            <p className="font-semibold text-gray-800 mb-6">{t('intro.paragraph4')}</p>
            <p className="text-gray-700 mb-6">{t('intro.paragraph5')}</p>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
            <Image src="/images/innolease-car.png" alt={t('intro.imageAlt')} fill className="object-contain" />
          </div>
        </div>
      </SectionContainer>

      {/* Autollecom Facts Section - New */}
      <SectionContainer bgColor="bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">{t('facts.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start p-6 bg-white rounded-lg shadow">
            <Globe className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('facts.fact1.title')}</h3>
              <p className="text-gray-600">{t('facts.fact1.description')}</p>
            </div>
          </div>
          <div className="flex items-start p-6 bg-white rounded-lg shadow">
            <BarChart className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('facts.fact2.title')}</h3>
              <p className="text-gray-600">{t('facts.fact2.description')}</p>
            </div>
          </div>
          <div className="flex items-start p-6 bg-white rounded-lg shadow">
            <Users className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('facts.fact3.title')}</h3>
              <p className="text-gray-600">{t('facts.fact3.description')}</p>
            </div>
          </div>
          <div className="flex items-start p-6 bg-white rounded-lg shadow">
            <ShieldCheck className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('facts.fact4.title')}</h3>
              <p className="text-gray-600">{t('facts.fact4.description')}</p>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Our Values */}
      <SectionContainer bgColor="bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">{t('values.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-6 bg-white rounded-lg shadow">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl">
                  {i === 1 && '🤝'} {i === 2 && '💡'} {i === 3 && '📈'}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t(`values.value${i}.title`)}</h3>
              <p className="text-gray-600">{t(`values.value${i}.description`)}</p>
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
            <span className="text-gray-500">{t('coverage.mapPlaceholder')}</span>
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
