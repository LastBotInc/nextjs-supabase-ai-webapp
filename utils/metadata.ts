import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { locales } from '@/app/i18n/config'

export interface MetadataProps {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  noindex?: boolean
  alternateLocales?: string[]
  canonicalUrl?: string
  imageWidth?: number
  imageHeight?: number
}

export async function generateLocalizedMetadata(
  locale: string,
  namespace: string,
  props: MetadataProps
): Promise<Metadata> {
  const t = await getTranslations(namespace)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lastbot.com'
  const title = props.title || t('title')
  const description = props.description || t('description')
  const imageUrl = props.image 
    ? (props.image.startsWith('http') ? props.image : `${baseUrl}${props.image}`)
    : `${baseUrl}/images/og/home.webp`
  
  // Ensure canonical URL is always absolute and includes locale
  const canonicalPath = props.canonicalUrl || ''
  const canonicalUrl = `${baseUrl}/${locale}${canonicalPath}`
  
  // Generate alternate URLs for all locales
  const alternateUrls = locales.reduce((acc, l) => ({
    ...acc,
    [l]: `${baseUrl}/${l}${canonicalPath}`
  }), {})

  return {
    title: `${title} | LastBot - Human-Centric AI Solutions`,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'LastBot',
      type: props.type || 'website',
      locale,
      alternateLocale: props.alternateLocales || locales.filter(l => l !== locale),
      images: [{
        url: imageUrl,
        width: props.imageWidth || 1200,
        height: props.imageHeight || 630,
        alt: title,
        type: imageUrl.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
        secureUrl: imageUrl.replace('http://', 'https://'),
      }],
      ...(props.type === 'article' && {
        article: {
          publishedTime: props.publishedTime,
          modifiedTime: props.modifiedTime,
          authors: props.authors || ['LastBot Team'],
          tags: props.tags,
          section: 'Technology',
        },
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@lastbotai',
      site: '@lastbotai',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: alternateUrls
    },
    robots: props.noindex ? {
      index: false,
      follow: true,
    } : {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

// Helper function to strip HTML tags from content
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Helper function to generate JSON-LD structured data
export function generateArticleStructuredData({
  title,
  description,
  image,
  publishedTime,
  modifiedTime,
  authors,
  tags,
  url,
}: {
  title: string
  description: string
  image?: string
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: authors?.map(name => ({
      '@type': 'Person',
      name,
    })) || [{
      '@type': 'Organization',
      name: 'LastBot Team',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'LastBot Inc',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    keywords: tags?.join(', '),
    url: url,
  }
} 