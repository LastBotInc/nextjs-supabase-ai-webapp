import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Database } from '@/types/database'
import Comments from '@/components/blog/Comments'
import FloatingNav from '@/components/blog/FloatingNav'
import StructuredData from '@/components/structured-data'
import { generateLocalizedMetadata, generateArticleStructuredData } from '@/utils/metadata'
import BlogContent from '@/components/blog/BlogContent'

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
  return html.replace(/<[^>]*>/g, '')
}

async function getPost(slug: string, locale: string): Promise<Post | null> {
  const supabase = await createClient()
  
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
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
    authors: ['LastBot Team'],
    tags: post.tags || undefined,
    canonicalUrl
  })
}

// Get similar posts
async function getSimilarPosts(postId: string, locale: string): Promise<SimilarPost[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
    // For server-side absolute URLs, ensure we have a valid base URL
    const apiUrl = baseUrl.startsWith('http') 
      ? `${baseUrl}/api/blog/similar` 
      : `/api/blog/similar`
    
    const response = await fetch(`${apiUrl}?postId=${postId}&locale=${locale}`)
    if (!response.ok) return []
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
      <div className="container mx-auto px-4 py-12 max-w-4xl bg-light-background text-light-text">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-8 text-light-text">{t('notFound')}</h1>
        <p className="text-xl text-gray-600 mb-8">{t('notFoundDescription')}</p>
        <Link 
          href={`/${locale}/blog`} 
          className="inline-flex items-center text-lg font-semibold text-brand-blue hover:text-blue-700 transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          {t('backToBlog')}
        </Link>
      </div>
    )
  }

  const similarPosts = await getSimilarPosts(post.id, locale)

  const structuredData = generateArticleStructuredData({
    title: post.title,
    description: post.excerpt || stripHtmlTags(post.content).substring(0, 150),
    image: post.featured_image || undefined,
    publishedTime: post.created_at,
    modifiedTime: post.updated_at,
    authors: ['LastBot Team'],
    tags: post.tags || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${post.slug}`
  })

  return (
    <>
      <StructuredData data={structuredData} />
      <article className="container mx-auto px-4 py-12 max-w-5xl bg-light-background text-light-text">
        {post.featured_image && (
          <div className="relative w-full h-[300px] md:h-[500px] mb-12 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-8 text-light-text">{post.title}</h1>
        <div className="prose prose-lg max-w-none text-gray-700 prose-headings:text-light-text prose-a:text-brand-blue hover:prose-a:text-blue-700 prose-strong:text-light-text">
          <BlogContent content={post.content} />
        </div>
        <div className="mt-12 pt-8 border-t border-gray-300">
          <Comments postId={post.id} />
        </div>
      </article>
      <FloatingNav locale={locale} />
      {similarPosts.length > 0 && (
        <div className="mt-16 mb-12 max-w-5xl mx-auto px-4 bg-light-background text-light-text">
          <h2 className="text-3xl font-bold leading-tight mb-8 text-light-text">{t('similarPosts')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarPosts.map((similar: SimilarPost) => (
              <Link
                key={similar.id}
                href={`/${locale}/blog/${similar.slug}`}
                className="block group"
              >
                <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col">
                  <h3 className="font-semibold text-xl mb-3 text-light-text group-hover:text-brand-blue transition-all duration-300">
                    {similar.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 flex-grow">
                    {stripHtmlTags(similar.content).substring(0, 150)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="text-center mb-12 bg-light-background">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-lg font-semibold text-brand-blue hover:text-blue-700 transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          {t('backToBlog')}
        </Link>
      </div>
    </>
  )
}
