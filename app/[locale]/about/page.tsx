'use server';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/app/i18n/server-utils';
import ContactForm from '@/components/contact/ContactForm';
import { Button } from '@/app/components/Button';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { setupServerLocale, setupMetadataLocale } from '@/app/i18n/server-utils';
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs';
import { Metadata } from 'next';
import { generateLocalizedMetadata } from '@/utils/metadata';
import { Suspense } from 'react';

interface Props {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  await setupMetadataLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });
  const metaTranslations = t.raw('meta') as { title: string; description: string };

  return generateLocalizedMetadata(
    locale,
    'About',
    {
      title: metaTranslations.title,
      description: metaTranslations.description,
      canonicalUrl: '/about',
    }
  );
}

export default async function AboutPage({ params }: Props) {
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });

  // Updated image paths
  const heroImage = '/images/about/hero-about.webp';
  const teamImage = '/images/about/team-about.webp';
  // const valuesImage = '/images/about/values-about.webp'; // This variable is not directly used in an Image tag below

  // Fetch latest news posts
  const supabase = await createClient();
  const { data: latestNews } = await supabase
    .from('posts')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .eq('subject', 'news')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen bg-light-background text-light-text">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center bg-light-card overflow-hidden">
          {/* Optional: Background Image for Hero */}
          
          <div className="absolute inset-0 z-0 opacity-30">
            <Image
              src={heroImage}
              alt={t('hero.title')}
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
          
          <div className="relative z-10 container mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('hero.subheadline')}
            </p>
          </div>
        </section>

        {/* Our Story / Mission Section */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto text-center md:text-left">
            <h2 className="text-3xl font-semibold mb-8 text-center">
              {t('ourStory.title')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
              <p>{t('ourStory.paragraph1')}</p>
              <p>{t('ourStory.paragraph2')}</p>
            </div>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-8">
              {t('team.title')}
            </h2>
            <div className="max-w-3xl mx-auto text-gray-600">
              <p className="mb-6">{t('team.description')}</p>
              {/* Placeholder for team image or individual profiles */}
              
              <div className="w-full max-w-2xl mx-auto h-64 bg-light-card rounded-lg flex items-center justify-center overflow-hidden relative">
                <Image src={teamImage} alt={t('team.title')} layout="fill" objectFit="cover" className="rounded-lg" />
                {/* <span className="text-gray-400">Team Visual Coming Soon</span> */}
              </div>
              
            </div>
          </div>
        </section>

        {/* Our Values / Culture Section */}
        <section className="py-16 px-4 bg-dark-background text-dark-text">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-12">
              {t('values.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-dark-card p-6 rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold mb-3 text-brand-blue">
                    {t(`values.value${i}.title`)}
                  </h3>
                  <p className="text-gray-300">
                    {t(`values.value${i}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Partner with Brancoy Section */}
        <section className="py-16 px-4 bg-light-background">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-8">
              {t('whyPartner.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('whyPartner.description')}
            </p>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 px-4 bg-brand-blue text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
              {t('cta.description')}
            </p>
            <div className="space-x-4">
              <Button variant="secondary" className="bg-white text-brand-blue hover:bg-gray-100">
                {t('cta.buttonServices')}
              </Button>
              <Button variant="primary" className="bg-transparent border-2 border-white hover:bg-white hover:text-brand-blue">
                {t('cta.buttonContact')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer will be part of the main layout eventually */}
      <footer className="py-8 bg-light-background text-center text-gray-500 border-t border-gray-300">
        <p>&copy; {new Date().getFullYear()} Brancoy. All rights reserved.</p>
        {/* Add footer links here if not in global layout */}
      </footer>
    </div>
  );
}
