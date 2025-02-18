import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Database } from '@/types/database'
import { Metadata } from 'next'

type LandingPage = Database['public']['Tables']['landing_pages']['Row']

type Props = {
  params: {
    locale: string
    slug: string
  }
}

// Function to strip HTML tags from content
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations('LandingPages')
  const supabase = await createClient()
  const { data: page, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching landing page:', error)
    return {
      title: t('notFound'),
      description: t('notFoundDescription')
    }
  }

  const description = page.meta_description || stripHtmlTags(page.content).substring(0, 150)

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      type: 'website',
      ...(page.seo_data?.openGraph || {}),
      images: page.featured_image ? [
        {
          url: page.featured_image,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ] : undefined,
    },
    twitter: {
      title: page.title,
      description,
      images: page.featured_image ? [page.featured_image] : undefined,
      ...(page.seo_data?.twitter || {}),
    },
    ...page.seo_data?.metadata,
  }
}

async function getLandingPage(slug: string, locale: string): Promise<LandingPage | null> {
  const supabase = createClient()
  const { data: page, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching landing page:', error)
    return null
  }

  return page
}

export default async function LandingPage({ params }: Props) {
  const t = await getTranslations('LandingPages')
  const page = await getLandingPage(params.slug, params.locale)

  if (!page) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      {/* Custom head content */}
      {page.custom_head && (
        <div dangerouslySetInnerHTML={{ __html: page.custom_head }} />
      )}

      {/* Custom CSS */}
      {page.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: page.custom_css }} />
      )}

      {/* Main content */}
      <div 
        className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto max-w-4xl px-4 py-8"
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />

      {/* Custom scripts */}
      {page.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: page.custom_js }} />
      )}

      {/* Additional scripts */}
      {page.custom_scripts?.map((script, index) => (
        <script key={index} src={script} />
      ))}
    </main>
  )
} 