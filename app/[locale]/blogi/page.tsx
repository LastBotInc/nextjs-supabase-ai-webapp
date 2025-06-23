import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'
import SectionContainer from '@/app/components/SectionContainer'

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
  const t = await getTranslations('Blog')

  return generateLocalizedMetadata(locale, 'Blog', {
    title: t('title'),
    description: t('description'),
    type: 'website',
    canonicalUrl: '/blog'
  })
}

const subjects = [
  { id: 'all', label: 'All' },
  { id: 'leasing-tips', label: 'Leasing Tips' },
  { id: 'ev', label: 'EV Transition' },
  { id: 'case-stories', label: 'Case Stories' },
  { id: 'news', label: 'Company News' },
  { id: 'research', label: 'Industry Research' },
]

async function getPosts(locale: string, subject?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('posts')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Adjust query to handle tags array for subject filtering
  if (subject && subject !== 'all') {
    // If you want exact match on subject field:
    // query = query.eq('subject', subject)
    // If subject is meant to filter by tags:
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
      name: 'Innolease', // Updated publisher name
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`, // Use correct logo path
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
        name: 'Innolease Team' // Updated author name
      }
    }))
  }

  return (
    <>
      <StructuredData data={structuredData} />
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('title')}</h1>
            <p className="text-xl text-gray-300 mb-10">{t('description')}</p>
          </div>
        </div>
      </section>
      
      <SectionContainer bgColor="bg-white">
        {/* Subject Filters */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {subjects.map(({ id, label }) => (
            <Link
              key={id}
              href={`/${locale}/blog${id === 'all' ? '' : `?subject=${id}`}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                subject === id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`subjects.${id}`)} {/* Assuming you have translations for subjects */}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('noPostsFound')}</h2>
            <p className="text-gray-500">{t('noPostsDescription')}</p>
            <Link href={`/${locale}/blog`} className="mt-6 inline-block text-blue-600 hover:underline">
              {t('viewAllPosts')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/blog/${post.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200"
              >
                <article>
                  {post.featured_image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-3 flex justify-between items-center text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                        {t(`subjects.${post.subject ?? 'news'}`)} {/* Display subject */}
                      </span>
                      <time dateTime={post.created_at}>
                        {new Date(post.created_at).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 line-clamp-3 text-sm mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="text-blue-600 font-medium text-sm group-hover:underline">
                      {t('readMore')} →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </SectionContainer>
    </>
  )
}
