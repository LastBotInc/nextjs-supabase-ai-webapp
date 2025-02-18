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

interface Props {
  params: Promise<{
    locale: string
  }>
}

export default async function About({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations('About');

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
    <main className="flex min-h-screen flex-col bg-black">
      {/* About Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-80" />
        
        <AnimatedOrbs orbs={[
          {
            size: 'lg',
            color: 'indigo',
            blur: 'lg',
            animation: 'float',
            speed: 'slow',
            className: 'absolute top-1/4 right-1/4'
          },
          {
            size: 'lg',
            color: 'purple',
            blur: 'lg',
            animation: 'float',
            speed: 'medium',
            className: 'absolute bottom-1/4 left-1/3'
          }
        ]} />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-300 mb-16 text-center leading-relaxed max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tl from-gray-900 via-black to-gray-900 opacity-80" />
        
        <AnimatedOrbs orbs={[
          {
            size: 'lg',
            color: 'indigo',
            blur: 'lg',
            animation: 'float',
            speed: 'slow',
            className: 'absolute top-1/4 right-1/4'
          },
          {
            size: 'lg',
            color: 'purple',
            blur: 'lg',
            animation: 'float',
            speed: 'medium',
            className: 'absolute bottom-1/4 left-1/3'
          }
        ]} />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                {t('news.title')}
              </h2>
              <Link
                href={`/${locale}/blog?subject=news`}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {t('news.viewAll')} →
              </Link>
            </div>

            <div className="space-y-8">
              {latestNews?.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-800/50 hover:border-gray-700/50 transition-colors"
                >
                  <p className="text-gray-400 mb-4">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  <h3 className="text-2xl font-bold mb-6 text-gray-100">
                    {post.title}
                  </h3>
                  <p className="text-gray-300 mb-6">
                    {post.excerpt}
                  </p>
                  <Link 
                    href={`/${locale}/blog/${post.slug}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                    {t('news.readMore')} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-80" />
        
        <AnimatedOrbs orbs={[
          {
            size: 'lg',
            color: 'indigo',
            blur: 'lg',
            animation: 'float',
            speed: 'slow',
            className: 'absolute top-1/4 right-1/4'
          },
          {
            size: 'lg',
            color: 'purple',
            blur: 'lg',
            animation: 'float',
            speed: 'medium',
            className: 'absolute bottom-1/4 left-1/3'
          }
        ]} />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {t('contact.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-100">
                  {t('contact.info.title')}
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-100">
                      {t('contact.address.title')}
                    </h4>
                    <p className="text-gray-300">{t('contact.address.street')}</p>
                    <p className="text-gray-300">{t('contact.address.postal')}</p>
                    <p className="text-gray-300">{t('contact.address.country')}</p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-100">
                      {t('contact.social.title')}
                    </h4>
                    <div className="flex space-x-4">
                      <Link
                        href="https://www.linkedin.com/company/lastbot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* Contact Form */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-100">
                  {t('contact.form.title')}
                </h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
