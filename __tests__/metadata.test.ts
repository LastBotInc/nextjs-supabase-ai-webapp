import { describe, test, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

// Define expected metadata structure
interface MetadataExpectation {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  canonical?: string
  locale?: string
  alternateLocales?: string[]
}

// Helper function to fetch and parse metadata from a page
async function getPageMetadata(path: string): Promise<Record<string, string>> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}${path}`)
  const html = await response.text()
  const dom = new JSDOM(html)
  const document = dom.window.document

  const metadata: Record<string, string> = {}
  
  // Get all meta tags
  const metaTags = document.getElementsByTagName('meta')
  for (const tag of metaTags) {
    const name = tag.getAttribute('name')
    const property = tag.getAttribute('property')
    const content = tag.getAttribute('content')
    
    if (name && content) {
      metadata[name] = content
    }
    if (property && content) {
      metadata[property] = content
    }
  }

  // Get title
  const titleTag = document.getElementsByTagName('title')[0]
  if (titleTag) {
    metadata['title'] = titleTag.textContent || ''
  }

  // Get canonical link
  const canonicalTag = document.querySelector('link[rel="canonical"]')
  if (canonicalTag) {
    metadata['canonical'] = canonicalTag.getAttribute('href') || ''
  }

  // Get alternate language links
  const alternateTags = document.querySelectorAll('link[rel="alternate"][hreflang]')
  metadata['alternateLocales'] = Array.from(alternateTags).map(tag => 
    tag.getAttribute('hreflang') || ''
  ).join(',')

  return metadata
}

// Helper function to validate metadata against expectations
function validateMetadata(metadata: Record<string, string>, expectations: MetadataExpectation) {
  // Basic metadata
  expect(metadata.title).toBe(expectations.title)
  expect(metadata['description']).toBe(expectations.description)
  
  // Open Graph
  if (expectations.ogTitle) {
    expect(metadata['og:title']).toBe(expectations.ogTitle)
  }
  if (expectations.ogDescription) {
    expect(metadata['og:description']).toBe(expectations.ogDescription)
  }
  if (expectations.ogImage) {
    expect(metadata['og:image']).toBe(expectations.ogImage)
  }
  if (expectations.ogType) {
    expect(metadata['og:type']).toBe(expectations.ogType)
  }
  
  // Twitter Card
  if (expectations.twitterCard) {
    expect(metadata['twitter:card']).toBe(expectations.twitterCard)
  }
  if (expectations.twitterTitle) {
    expect(metadata['twitter:title']).toBe(expectations.twitterTitle)
  }
  if (expectations.twitterDescription) {
    expect(metadata['twitter:description']).toBe(expectations.twitterDescription)
  }
  if (expectations.twitterImage) {
    expect(metadata['twitter:image']).toBe(expectations.twitterImage)
  }
  
  // Canonical and locales
  if (expectations.canonical) {
    expect(metadata.canonical).toBe(expectations.canonical)
  }
  if (expectations.locale) {
    expect(metadata['og:locale']).toBe(expectations.locale)
  }
  if (expectations.alternateLocales) {
    const locales = metadata.alternateLocales.split(',')
    expect(locales).toEqual(expect.arrayContaining(expectations.alternateLocales))
  }
}

describe('Page Metadata', () => {
  test('Blog post page has correct metadata', async () => {
    const metadata = await getPageMetadata('/en/blog/getting-started')
    
    validateMetadata(metadata, {
      title: 'Blog.notFound | LastBot - Human-Centric AI Solutions',
      description: 'Blog.notFoundDescription',
      ogTitle: 'Blog.notFound',
      ogDescription: 'Blog.notFoundDescription',
      ogType: 'website',
      ogImage: 'https://www.lastbot.com/images/og/blog-default.webp',
      twitterCard: 'summary_large_image',
      twitterImage: 'https://www.lastbot.com/images/og/blog-default.webp',
      locale: 'en',
      alternateLocales: ['fi', 'sv']
    })
  })

  test('Presentations page has correct metadata', async () => {
    const metadata = await getPageMetadata('/en/presentations')
    
    validateMetadata(metadata, {
      title: 'Presentations | LastBot - Human-Centric AI Solutions',
      description: 'Explore our interactive presentations about AI transformation and technology trends',
      ogTitle: 'Presentations',
      ogDescription: 'Explore our interactive presentations about AI transformation and technology trends',
      ogType: 'website',
      ogImage: 'https://www.lastbot.com/images/og/presentations.webp',
      twitterCard: 'summary_large_image',
      twitterImage: 'https://www.lastbot.com/images/og/presentations.webp',
      locale: 'en',
      alternateLocales: ['fi', 'sv']
    })
  })

  test('Home page has correct metadata', async () => {
    const metadata = await getPageMetadata('/en')
    
    validateMetadata(metadata, {
      title: 'LastBot - Fast-Track Your Business to AI-First | LastBot - Human-Centric AI Solutions',
      description: 'LastBot helps companies become AI-first while maintaining their focus on people. We provide a fast-track approach to AI integration, creating genuine connections and delivering autonomous solutions.',
      ogTitle: 'LastBot - Fast-Track Your Business to AI-First',
      ogDescription: 'LastBot helps companies become AI-first while maintaining their focus on people. We provide a fast-track approach to AI integration, creating genuine connections and delivering autonomous solutions.',
      ogType: 'website',
      ogImage: 'https://www.lastbot.com/images/og/home.webp',
      twitterCard: 'summary_large_image',
      twitterImage: 'https://www.lastbot.com/images/og/home.webp',
      locale: 'en',
      alternateLocales: ['fi', 'sv']
    })
  })
}) 