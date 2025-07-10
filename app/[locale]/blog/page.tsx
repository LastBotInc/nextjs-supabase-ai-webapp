import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'

type Post = Database['public']['Tables']['posts']['Row']

interface Props {
  params: Promise<{
    locale: Locale
  }>
  searchParams: {
    subject?: string
  }
}

// Disable caching for this page
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return generateLocalizedMetadata(locale, 'Blog', {
    title: t('title'),
    description: t('description'),
    type: 'website',
    canonicalUrl: '/blog'
  })
}

const subjects = [
  { id: 'all' },
  { id: 'news' },
  { id: 'research' },
  { id: 'generative-ai' },
  { id: 'case-stories' }
];

async function getPosts(locale: string, subject?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('posts')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (subject && subject !== 'all') {
    query = query.contains('tags', [subject])
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return posts
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const subject = resolvedSearchParams.subject ?? 'all';
  await setupServerLocale(locale)
  const t = await getTranslations('Blog')
  const posts = await getPosts(locale, subject)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: t('title'),
    description: t('description'),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'LastBot Inc',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.created_at,
      dateModified: post.updated_at,
      image: post.featured_image,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${post.slug}`,
      author: {
        '@type': 'Organization',
        name: 'LastBot Team'
      }
    }))
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          <AnimatedOrbs className="absolute inset-0 -z-10" />
          <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
          <p className="text-xl mb-12">{t('description')}</p>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {subjects.map(({ id, label }) => (
            <Link
              key={id}
              href={`/${locale}/blog${id === 'all' ? '' : `?subject=${id}`}`}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                subject === id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
            >
              {t(`subjects.${id}`)}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">{t('noPosts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group block"
              >
                <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                  {post.featured_image && (
                    <div className="relative h-48">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-2">
                          {post.tags.slice(0, 2).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
