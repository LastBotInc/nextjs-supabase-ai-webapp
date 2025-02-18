import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { defaultLocale, locales } from '@/app/i18n/config'

type SitemapEntry = {
  url: string
  lastModified: string
  changefreq: string
  priority: number
}

// Helper to generate URLs for each locale
const generateLocalizedUrls = (path: string): SitemapEntry[] => {
  return locales.map((locale: string) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}${path}`,
    lastModified: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0,
  }))
}

// Helper to generate blog post URLs
const generateBlogUrls = async (): Promise<SitemapEntry[]> => {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })

  if (!posts) return []

  return posts.flatMap(post => 
    locales.map((locale: string) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changefreq: 'weekly',
      priority: 0.8,
    }))
  )
}

export async function GET() {
  const supabase = await createClient()
  // Generate URLs for static pages
  const staticPages = [
    '',
    '/services',
    '/solutions',
    '/tech',
    '/about',
    '/contact',
    '/blog',
    '/domains/healthcare',
  ]

  const staticUrls = staticPages.flatMap(generateLocalizedUrls)
  const blogUrls = await generateBlogUrls()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticUrls, ...blogUrls]
    .map(
      ({ url, lastModified, changefreq, priority }) => `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
    },
  })
} 