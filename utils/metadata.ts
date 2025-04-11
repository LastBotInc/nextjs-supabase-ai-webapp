import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { locales } from '@/app/i18n/config'

export interface MetadataProps {
  locale: string
  namespace: string
  title?: string
  description?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  path?: string
}

// Updated Keywords
const innoleaseKeywords = [
  'Innolease',
  'Vehicle Leasing',
  'Fleet Management',
  'Business Leasing',
  'Company Cars',
  'Finland',
  'Autolle.com',
  'Financial Leasing',
  'Flexible Leasing',
  'Maintenance Leasing',
  'MiniLeasing',
  'InnoFleet Manager',
];

export const defaultMetadata = {
  applicationName: 'Innolease',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Innolease',
    'Vehicle Leasing',
    'Fleet Management',
    'Business Leasing',
    'Company Cars',
    'Finland',
    'Autolle.com',
    'Financial Leasing',
    'Flexible Leasing',
    'Maintenance Leasing',
    'MiniLeasing',
    'InnoFleet Manager',
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.innolease.com'

export async function generateLocalizedMetadata(
  props: MetadataProps
): Promise<Metadata> {
  const t = await getTranslations(props.namespace)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.innolease.com' // Changed domain
  const title = props.title || t('Index.title')
  const description = props.description || t('Index.description')
  const locale = props.locale
  const canonicalUrl = props.path ? new URL(props.path, baseUrl).toString() : new URL(`/${locale}`, baseUrl).toString()
  const imageUrl = props.imageUrl || new URL('/images/og/default.webp', baseUrl).toString()

  return {
    metadataBase: new URL(baseUrl),
    title: `${title} | Innolease - Vehicle Leasing Solutions`, // Changed brand name
    description,
    applicationName: 'Innolease', // Changed application name
    authors: props.authors ? props.authors.map(name => ({ name })) : [{ name: 'Innolease Team' }], // Changed default team name
    creator: 'Innolease Oy', // Changed creator
    publisher: 'Innolease Oy', // Changed publisher
    generator: 'Next.js',
    keywords: innoleaseKeywords, // Use Innolease keywords
    referrer: 'origin-when-cross-origin', // Set referrer policy
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Innolease', // Changed site name
      type: props.type || 'website',
      locale,
      images: [
        {
          url: imageUrl,
          width: props.imageWidth || 1200,
          height: props.imageHeight || 630,
          alt: title, // Use page title as default alt
          type: imageUrl.endsWith('.webp') ? 'image/webp' : 'image/jpeg',
          secureUrl: imageUrl.replace('http://', 'https://'),
        },
      ],
      ...(props.type === 'article' && {
        publishedTime: props.publishedTime,
        modifiedTime: props.modifiedTime,
        authors: props.authors || ['Innolease Team'], // Changed default team name
        tags: props.tags,
        section: 'Leasing & Fleet Management', // Changed section
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      // Removed creator and site handles for Twitter
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': new URL('/en', baseUrl).toString(),
        'fi': new URL('/fi', baseUrl).toString(),
        'sv': new URL('/sv', baseUrl).toString(),
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    verification: {
      // Add verification codes if needed
    },
    appleWebApp: {
      title: 'Innolease', // Changed App name
      statusBarStyle: 'default',
      capable: true,
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    other: {
      // Add any other custom meta tags here
    },
    // JSON-LD Schema
    // Removed the jsonLd generation for simplicity, can be re-added if needed
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
      name: 'Innolease Team',
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Innolease Inc',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    keywords: tags?.join(', '),
    url: url,
  }
} 