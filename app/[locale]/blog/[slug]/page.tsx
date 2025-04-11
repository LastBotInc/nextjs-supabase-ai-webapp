import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database'
import Comments from '@/components/blog/Comments'
import StructuredData from '@/components/structured-data'
import { generateLocalizedMetadata, generateArticleStructuredData } from '@/utils/metadata'
import BlogContent from '@/components/blog/BlogContent'
import SectionContainer from '@/app/components/SectionContainer'

type Post = Database['public']['Tables']['posts']['Row']
type SimilarPost = {
  id: string
  title: string
  slug: string
  content: string
  similarity: number
}

interface Props {
  params: Promise<{
    locale: string
    slug: string
  }>
}

// Helper function to strip HTML tags from content
function stripHtmlTags(html: string): string {
  return html ? html.replace(/<[^>]*>/g, '') : ''
}

async function getPost(slug: string, locale: string): Promise<Post | null> {
  const supabase = await createClient()
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return post
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('Blog')
  const post = await getPost(slug, locale)

  if (!post) {
    return generateLocalizedMetadata(locale, 'Blog', {
      title: t('notFound'),
      description: t('notFoundDescription'),
      noindex: true
    })
  }

  const description = post.excerpt || stripHtmlTags(post.content).substring(0, 150)
  const canonicalUrl = `/blog/${post.slug}`

  return generateLocalizedMetadata(locale, 'Blog', {
    title: post.title,
    description,
    image: post.featured_image || undefined,
    type: 'article',
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    authors: ['Innolease Team'],
    tags: post.tags || undefined,
    canonicalUrl
  })
}

// Get similar posts
async function getSimilarPosts(postId: string, locale: string): Promise<SimilarPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
    const apiUrl = baseUrl.startsWith('http') 
      ? `${baseUrl}/api/blog/similar` 
      : `/api/blog/similar`
    
    const response = await fetch(`${apiUrl}?postId=${postId}&locale=${locale}`, { cache: 'no-store' })
    if (!response.ok) {
      console.error('Similar posts API error:', response.status, await response.text());
      return [];
    }
    const { posts } = await response.json()
    return posts
  } catch (error) {
    console.error('Error fetching similar posts:', error)
    return []
  }
}

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations('Blog')
  const post = await getPost(slug, locale)

  if (!post) {
    return (
      <SectionContainer bgColor="bg-white">
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('notFound')}</h1>
          <p className="text-lg text-gray-600 mb-8">{t('notFoundDescription')}</p>
          <Link 
            href={`/${locale}/blog`} 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="mr-2">←</span>
            {t('backToBlog')}
          </Link>
        </div>
      </SectionContainer>
    )
  }

  const similarPosts = await getSimilarPosts(post.id, locale)

  const structuredData = generateArticleStructuredData({
    title: post.title,
    description: post.excerpt || stripHtmlTags(post.content).substring(0, 150),
    image: post.featured_image || undefined,
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    authors: ['Innolease Team'],
    tags: post.tags || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${post.slug}`
  })

  return (
    <>
      <StructuredData data={structuredData} />
      
      {/* Post Header */}
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
          <div className="text-gray-600 text-sm md:text-base mb-6">
            <span>{t('publishedOn')} </span>
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {post.subject && (
              <span className="mx-2">|</span>
            )}
            {post.subject && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium text-xs">
                {t(`subjects.${post.subject}`)}
              </span>
            )}
          </div>
          {post.featured_image && (
            <div className="relative w-full aspect-video mt-8 mb-12 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </section>

      {/* Post Content */}
      <SectionContainer bgColor="bg-white">
        <div className="max-w-3xl mx-auto">
          <BlogContent content={post.content} />
        </div>
      </SectionContainer>
      
      {/* Similar Posts Section */}
      {similarPosts.length > 0 && (
        <SectionContainer bgColor="bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('similarPosts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarPosts.map((similar: SimilarPost) => (
                <Link
                  key={similar.id}
                  href={`/${locale}/blog/${similar.slug}`}
                  className="group block bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200"
                >
                  <article>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {similar.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {stripHtmlTags(similar.content).substring(0, 120)}...
                      </p>
                      <span className="text-blue-600 font-medium text-sm group-hover:underline">
                        {t('readMore')} →
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </SectionContainer>
      )}

      {/* Back to Blog Link */}
      <SectionContainer bgColor="bg-white">
        <div className="text-center">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center text-blue-600 hover:underline font-medium"
          >
            <span className="mr-2">←</span>
            {t('backToBlog')}
          </Link>
        </div>
      </SectionContainer>
    </>
  )
}
