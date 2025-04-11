import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'
import PresentationViewer from '@/app/components/presentation/PresentationViewer'
import { Metadata } from 'next'

interface Props {
  params: {
    locale: Locale
    slug: string
    id: string
  }
}

interface Slide {
  id: string
  title: string
  content: string
  background_image: string
  transition: 'fade' | 'slide' | 'zoom'
}

interface Presentation {
  id: string
  title: string
  description: string
  preview_image: string
  slides: Slide[]
  created_at: string
  updated_at: string
  locale: string
}

type PresentationsData = {
  [key: string]: Presentation
}

// Static page
export const dynamic = 'force-static'

// Static presentation data
const presentations: PresentationsData = {
  'navigating-ai-transformation': {
    id: 'navigating-ai-transformation',
    title: 'Navigating AI Transformation',
    description: 'A comprehensive guide to understanding how AI is transforming software development, business operations, and user experiences',
    preview_image: '/images/presentations/ai-transformation-preview.webp',
    slides: [
      {
        id: '1',
        title: 'AI-Assisted Development',
        content: `
          <div class="space-y-6">
            <p>AI is revolutionizing how we build software:</p>
            <ul class="list-disc list-inside space-y-4">
              <li>Intelligent code completion and generation</li>
              <li>Automated testing and debugging</li>
              <li>Natural language to code translation</li>
              <li>Architecture and design suggestions</li>
              <li>Documentation generation</li>
            </ul>
            <p class="mt-8">Development speed has increased by 40% with AI assistance</p>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'fade'
      },
      {
        id: '2',
        title: 'AI Agents Integration',
        content: `
          <div class="space-y-6">
            <p>AI agents are becoming integral parts of modern systems:</p>
            <ul class="list-disc list-inside space-y-4">
              <li>Autonomous decision making</li>
              <li>Natural language understanding</li>
              <li>Context-aware responses</li>
              <li>Learning from interactions</li>
              <li>Multi-agent collaboration</li>
            </ul>
            <p class="mt-8">By 2025, 70% of enterprises will have AI agents in production</p>
          </div>
        `,
        background_image: '/images/presentations/ai-agents.webp',
        transition: 'slide'
      },
      {
        id: '3',
        title: 'UX Transformation',
        content: `
          <div class="space-y-6">
            <p>AI is reshaping user expectations:</p>
            <ul class="list-disc list-inside space-y-4">
              <li>Personalized experiences at scale</li>
              <li>Natural conversations with systems</li>
              <li>Predictive assistance</li>
              <li>Adaptive interfaces</li>
              <li>Emotional intelligence</li>
            </ul>
            <p class="mt-8">85% of customer interactions will be AI-powered by 2025</p>
          </div>
        `,
        background_image: '/images/presentations/ux-transformation.webp',
        transition: 'zoom'
      },
      {
        id: '4',
        title: 'Company Transformation',
        content: `
          <div class="space-y-6">
            <p>Steps for successful AI transformation:</p>
            <ul class="list-disc list-inside space-y-4">
              <li>Develop AI strategy and roadmap</li>
              <li>Build AI-ready infrastructure</li>
              <li>Upskill workforce</li>
              <li>Create AI governance framework</li>
              <li>Foster AI-first culture</li>
            </ul>
            <p class="mt-8">Companies with AI strategy see 50% higher growth rate</p>
          </div>
        `,
        background_image: '/images/presentations/company-transformation.webp',
        transition: 'fade'
      },
      {
        id: '5',
        title: 'LastBot Solutions',
        content: `
          <div class="space-y-6">
            <p>How we help companies navigate AI transformation:</p>
            <ul class="list-disc list-inside space-y-4">
              <li>AI Strategy Consulting</li>
              <li>Custom AI Development</li>
              <li>AI Integration Services</li>
              <li>Training and Support</li>
              <li>Continuous Innovation</li>
            </ul>
            <p class="mt-8">Partner with LastBot for your AI journey</p>
          </div>
        `,
        background_image: '/images/presentations/lastbot-solutions.webp',
        transition: 'slide'
      }
    ],
    created_at: '2024-01-27T00:00:00Z',
    updated_at: '2024-01-27T00:00:00Z',
    locale: 'en'
  }
  // Add more presentations here as static data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale;
  const slug = params.slug;
  const slideId = params.id;
  const presentation = presentations[slug];
  const slide = presentation?.slides.find(s => s.id.toString() === slideId);

  if (!presentation || !slide) {
    return generateLocalizedMetadata({ 
      locale, 
      namespace: 'Presentations.meta', 
      title: 'Presentation Slide Not Found' 
    }); 
  }

  return generateLocalizedMetadata({ 
    locale, 
    namespace: 'Presentations.slideMeta', 
    title: slide.title,
    description: presentation.title,
    imageUrl: slide.background_image,
    path: `/presentations/${slug}/${slideId}`,
    type: 'article' 
  });
}

export default async function PresentationSlidePage({ params }: Props) {
  const locale = params.locale;
  const slug = params.slug;
  const slideId = params.id;
  const presentation = presentations[slug];
  const slide = presentation?.slides.find(s => s.id.toString() === slideId);

  if (!slide || !presentation) {
    notFound();
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: slide.title,
    image: slide.background_image,
    publisher: {
      '@type': 'Organization',
      name: 'Innolease Oy',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <PresentationViewer presentation={presentation} locale={locale} />
    </>
  )
} 