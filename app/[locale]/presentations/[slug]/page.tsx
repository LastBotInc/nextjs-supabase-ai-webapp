import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Locale } from '@/app/i18n/config'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { generateLocalizedMetadata } from '@/utils/metadata'
import StructuredData from '@/components/structured-data'
import PresentationViewer from '@/app/components/presentation/PresentationViewer'

interface Props {
  params: {
    locale: Locale
    slug: string
  }
}

// Types for presentations
interface Slide {
  id: string
  title: string
  content: string
  background_image: string
  transition: 'slide' | 'fade' | 'zoom'
}

interface Presentation {
  id: string
  slug: string
  title: string
  description: string
  preview_image: string
  created_at: string
  updated_at: string
  published: boolean
  locale: string
  slides: Slide[]
}

interface Presentations {
  [key: string]: Presentation
}

// Force static generation for this page
export const dynamic = 'force-static'

// Static presentation data
const presentations: Presentations = {
  'navigating-ai-transformation': {
    id: 'navigating-ai-transformation',
    slug: 'navigating-ai-transformation',
    title: 'Navigating AI Transformation',
    description: 'A comprehensive guide to understanding how AI is transforming software development, business operations, and user experiences',
    preview_image: '/images/presentations/ai-transformation-preview.webp',
    created_at: '2024-01-27T00:00:00Z',
    updated_at: '2024-01-27T00:00:00Z',
    published: true,
    locale: 'en',
    slides: [
      {
        id: '1',
        title: 'Title',
        content: `
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 class="text-7xl md:text-8xl lg:text-9xl font-bold mb-8">
              Navigating AI<br/>Transformation
            </h1>
            <div class="text-2xl md:text-3xl lg:text-4xl mb-12">
              A Guide to AI-Powered Enterprises
            </div>
            <div class="text-xl md:text-2xl opacity-80">
              By Pasi Vuorio<br/>
              Founder & CEO at LastBot
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'fade'
      },
      {
        id: '2',
        title: 'Three Layers of Transformation',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Three<br/>Layers of<br/>Change
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI-Assisted Development</h4>
                <p class="text-2xl leading-relaxed">
                  Software development costs will be reduced close to zero through AI automation and assistance
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI Agents at Work</h4>
                <p class="text-2xl leading-relaxed">
                  AI agents will take over human tasks, including customer service and business operations
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI-Native Applications</h4>
                <p class="text-2xl leading-relaxed">
                  Legacy systems will become obsolete as AI-native applications take over
                </p>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'slide'
      },
      {
        id: '3',
        title: 'AI-Assisted Development',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Zero-Cost<br/>Software<br/>Future
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Automated Development</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI handles entire development lifecycle
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Reduced human intervention to oversight
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Cost Reduction</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Near-zero development costs
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Automated testing and maintenance
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Quality Improvement</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Higher code quality and fewer bugs
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Continuous performance optimization
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'slide'
      },
      {
        id: '4',
        title: 'AI Agents at Work',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  AI Agents<br/>Take<br/>Control
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Customer Service Revolution</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    24/7 personalized support
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Human-like understanding and empathy
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Business Process Automation</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    End-to-end workflow management
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Data analysis to execution
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Human Augmentation</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Intelligent assistant capabilities
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Enhanced human productivity
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-agents.webp',
        transition: 'slide'
      },
      {
        id: '5',
        title: 'AI-Native Applications',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Legacy<br/>Systems<br/>Die
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Adaptive Intelligence</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Continuous learning and evolution
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Static systems become obsolete
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Seamless Integration</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Natural AI communication
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    No traditional integration challenges
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Predictive Operations</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Real-time adaptation to needs
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Reactive systems become outdated
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ux-transformation.webp',
        transition: 'slide'
      },
      {
        id: '6',
        title: 'Preparing for AI Transformation',
        content: `
          <div class="absolute inset-0 flex flex-col">
            <div class="relative flex items-center justify-center p-16 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
              <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                How to<br/>Prepare
              </h3>
            </div>
            <div class="relative flex-1 grid md:grid-cols-3 gap-12 px-16 pt-8 pb-32 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">For Zero-Cost Development</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Train developers in AI-first practices
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Adopt AI development tools early
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Focus on architecture and oversight
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Build AI-ready infrastructure
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">For AI Agents</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Map processes suitable for AI agents
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Start with simple, focused agents
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Define clear agent boundaries
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Plan human-AI collaboration
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">For AI-Native Systems</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Audit legacy system dependencies
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Design for continuous learning
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Implement AI-first architecture
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Plan gradual system migration
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/company-transformation.webp',
        transition: 'slide'
      },
      {
        id: '7',
        title: 'LastBot Solutions',
        content: `
          <div class="absolute inset-0 flex flex-col">
            <div class="relative flex items-center justify-center p-16 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
              <div class="flex flex-col items-center gap-12">
                <div class="flex items-center gap-12">
                  <img src="/images/lastbot logo 480x480.jpg" alt="LastBot Logo" class="w-24 h-24 rounded-xl shadow-2xl" />
                  <h3 class="text-7xl md:text-8xl lg:text-9xl font-bold text-center leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                    LastBot
                  </h3>
                </div>
                <p class="text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100 font-light tracking-wide">
                  Your Guide To AI-Native Company
                </p>
              </div>
            </div>
            <div class="relative flex-1 grid md:grid-cols-3 gap-12 px-16 pt-8 pb-32 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI-First Customer Service</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Smart intent detection and routing
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI-powered instant responses
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Seamless human handoff
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    One-channel resolution
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Ready Solutions</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI-powered segmentation & insights
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Smart copywriting & content creation
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    24/7 automated sales agents
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI-powered sales coaching
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Custom Services</h4>
                <ul class="list-none space-y-6 text-xl">
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Strategic AI consulting
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI training programs
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    AI-assisted development (5x faster)
                  </li>
                  <li class="flex items-center">
                    <div class="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full mr-4 shadow-lg"></div>
                    Marketing automation solutions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/company-transformation.webp',
        transition: 'slide'
      }
    ]
  },
  'navigating-ai-transformation-fi': {
    id: 'navigating-ai-transformation',
    slug: 'navigating-ai-transformation',
    title: 'Tekoälyn transformaation navigointi',
    description: 'Kattava opas tekoälyn vaikutuksesta ohjelmistokehitykseen, liiketoimintaan ja käyttäjäkokemukseen',
    preview_image: '/images/presentations/ai-transformation-preview.webp',
    created_at: '2024-01-27T00:00:00Z',
    updated_at: '2024-01-27T00:00:00Z',
    published: true,
    locale: 'fi',
    slides: [
      {
        id: '1',
        title: 'Tekoälyn transformaation navigointi',
        content: `
          <div class="flex flex-col items-center justify-center h-full text-center">
            <div class="text-3xl mb-16">Opas tekoälypohjaisiin yrityksiin</div>
            <div class="text-2xl mb-4">Pasi Vuorio</div>
            <div class="text-xl text-gray-300">Perustaja & Toimitusjohtaja, LastBot</div>
          </div>
        `,
        background_image: '/images/presentations/ai-transformation-preview.webp',
        transition: 'fade'
      },
      {
        id: '2',
        title: 'Three Layers of Transformation',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Three<br/>Layers of<br/>Change
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI-Assisted Development</h4>
                <p class="text-2xl leading-relaxed">
                  AI handles entire development lifecycle from requirements to deployment, reducing human intervention to oversight only
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI Agents at Work</h4>
                <p class="text-2xl leading-relaxed">
                  AI agents will take over human tasks, including customer service and business operations
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">AI-Native Applications</h4>
                <p class="text-2xl leading-relaxed">
                  Legacy systems will become obsolete as AI-native applications take over
                </p>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'slide'
      },
      {
        id: '3',
        title: 'AI-Assisted Development',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Zero-Cost<br/>Software<br/>Future
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Automated Development</h4>
                <p class="text-2xl leading-relaxed">
                  AI handles entire development lifecycle from requirements to deployment, reducing human intervention to oversight only
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Cost Reduction</h4>
                <p class="text-2xl leading-relaxed">
                  Development costs approach zero through AI automation of coding, testing, debugging, and maintenance tasks
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Quality Improvement</h4>
                <p class="text-2xl leading-relaxed">
                  AI ensures higher code quality, fewer bugs, and better performance through continuous optimization
                </p>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-development.webp',
        transition: 'slide'
      },
      {
        id: '4',
        title: 'AI Agents at Work',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  AI Agents<br/>Take<br/>Control
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Customer Service Revolution</h4>
                <p class="text-2xl leading-relaxed">
                  AI agents provide 24/7 personalized support, handling complex queries with human-like understanding and empathy
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Business Process Automation</h4>
                <p class="text-2xl leading-relaxed">
                  Autonomous agents manage entire business workflows, from data analysis to decision-making and execution
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Human Augmentation</h4>
                <p class="text-2xl leading-relaxed">
                  AI agents become intelligent assistants, enhancing human capabilities rather than just replacing them
                </p>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-agents.webp',
        transition: 'slide'
      },
      {
        id: '5',
        title: 'AI-Native Applications',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-2/5 flex items-center justify-center bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="p-16">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Legacy<br/>Systems<br/>Die
                </h3>
              </div>
            </div>
            <div class="relative md:w-3/5 flex flex-col justify-center p-16 space-y-12 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Adaptive Intelligence</h4>
                <p class="text-2xl leading-relaxed">
                  AI-native systems continuously learn and evolve, making static legacy applications obsolete
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Seamless Integration</h4>
                <p class="text-2xl leading-relaxed">
                  New applications naturally connect and communicate through AI, eliminating traditional integration challenges
                </p>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Predictive Operations</h4>
                <p class="text-2xl leading-relaxed">
                  Systems anticipate needs and adapt in real-time, making traditional reactive applications outdated
                </p>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ux-transformation.webp',
        transition: 'slide'
      },
      {
        id: '6',
        title: 'Yrityksen transformaatio',
        content: `
          <div class="flex flex-col h-full w-full">
            <div class="h-1/4 flex items-center justify-center p-8 bg-gradient-to-b from-blue-900/50 to-transparent">
              <h3 class="text-4xl md:text-5xl font-bold text-center leading-tight">
                Embracing AI Across Organizations
              </h3>
            </div>
            <div class="flex-1 grid md:grid-cols-3 gap-8 p-8">
              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Cultural Shift</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Building AI-first mindset
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Continuous learning and adaptation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Cross-functional collaboration
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Data-driven decision making
                  </li>
                </ul>
              </div>

              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Operational Excellence</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Process optimization and automation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Resource utilization improvements
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Quality and compliance automation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Predictive analytics integration
                  </li>
                </ul>
              </div>

              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Innovation Acceleration</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Rapid prototyping and testing
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    AI-driven research and development
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Automated market analysis
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Smart product development
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/company-transformation.webp',
        transition: 'slide'
      },
      {
        id: '7',
        title: 'LastBotin ratkaisut',
        content: `
          <div class="flex flex-col md:flex-row h-full w-full items-center">
            <div class="md:w-1/3 h-full flex items-center justify-center p-8 bg-gradient-to-r from-blue-900/50 to-transparent">
              <h3 class="text-4xl md:text-5xl font-bold text-center md:text-left leading-tight">
                Your Partner in<br/>AI<br/>Transformation
              </h3>
            </div>
            <div class="md:w-2/3 h-full p-8 space-y-8">
              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Comprehensive Solutions</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    AI-powered development tools
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Intelligent automation platforms
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Custom AI agent development
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Integration and deployment support
                  </li>
                </ul>
              </div>

              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Expert Guidance</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Strategic transformation planning
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Technical implementation support
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Training and skill development
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Best practices and frameworks
                  </li>
                </ul>
              </div>

              <div class="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h4 class="text-2xl font-semibold mb-4 text-blue-300">Success Stories</h4>
                <ul class="list-none space-y-3">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Proven track record of transformation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Measurable business outcomes
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Industry-specific solutions
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Long-term partnership approach
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/lastbot-solutions.webp',
        transition: 'fade'
      }
    ]
  },
  'ai-in-etail': {
    id: 'ai-in-etail',
    slug: 'ai-in-etail',
    title: 'AI in eTail - Future Of Commerce',
    description: "Discover how generative AI is revolutionizing eCommerce, from personalized shopping experiences to intelligent operations and LastBot's cutting-edge solutions.",
    preview_image: '/images/presentations/ai-etail-preview.webp',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z',
    published: true,
    locale: 'en',
    slides: [
      {
        id: '1',
        title: 'Title',
        content: `
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <h1 class="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100">
              AI in eTail<br/>Future Of Commerce
            </h1>
            <div class="text-2xl md:text-3xl lg:text-4xl mb-12 text-blue-100">
              How Generative AI is Transforming Online Retail Forever
            </div>
            <div class="text-xl md:text-2xl opacity-80 mt-8">
              By Pasi Vuorio<br/>
              Founder & CEO at LastBot
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-etail-preview.webp',
        transition: 'fade'
      },
      {
        id: '2',
        title: 'Three Pillars of AI Commerce',
        content: `
          <div class="absolute inset-0 flex flex-col">
            <div class="relative flex-1 flex flex-col md:flex-row">
              <div class="relative md:w-1/2 flex items-center justify-center p-16 bg-gradient-to-r from-black/90 via-black/70 to-transparent">
                <h3 class="text-6xl md:text-7xl lg:text-8xl font-bold text-center md:text-left leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  The Future<br/>of Retail<br/>is Here
                </h3>
              </div>
              <div class="relative md:w-1/2 flex flex-col justify-center p-16 space-y-8 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
                <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                  <h4 class="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">1. Hyper-Personalization</h4>
                  <ul class="list-none space-y-3 text-lg">
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Real-time preference analysis
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Dynamic content adaptation
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Individual pricing strategies
                    </li>
                  </ul>
                </div>

                <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                  <h4 class="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">2. Intelligent Operations</h4>
                  <ul class="list-none space-y-3 text-lg">
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Predictive inventory management
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Smart supply chain optimization
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Automated vendor relationships
                    </li>
                  </ul>
                </div>

                <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                  <h4 class="text-3xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">3. Autonomous Commerce</h4>
                  <ul class="list-none space-y-3 text-lg">
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Self-optimizing systems
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Market trend adaptation
                    </li>
                    <li class="flex items-center">
                      <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Automated decision-making
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-commerce.webp',
        transition: 'slide'
      },
      {
        id: '3',
        title: 'Hyper-Personalization',
        content: `
          <div class="absolute inset-0 grid grid-cols-1 md:grid-cols-2 gap-8 p-16">
            <div class="flex flex-col justify-center space-y-8">
              <h3 class="text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                Personal<br/>Shopping<br/>Revolution
              </h3>
              <p class="text-xl text-blue-100 leading-relaxed">
                AI transforms every shopping experience into a unique journey tailored to individual preferences and behaviors.
              </p>
            </div>

            <div class="flex flex-col justify-center space-y-6">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Behavioral Analysis</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Real-time browsing pattern analysis
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Purchase history interpretation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Cross-device behavior tracking
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Social media preference integration
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Smart Recommendations</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    AI-powered product matching
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Style and preference learning
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Contextual suggestions
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Seasonal trend adaptation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-personalization.webp',
        transition: 'slide'
      },
      {
        id: '4',
        title: 'Intelligent Operations',
        content: `
          <div class="absolute inset-0 flex flex-col">
            <div class="relative p-16 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
              <h3 class="text-6xl font-bold text-center leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white mb-12">
                Smart Retail Operations
              </h3>
            </div>
            <div class="relative flex-1 grid md:grid-cols-3 gap-8 px-16 pb-16 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Inventory Intelligence</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Real-time stock monitoring
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Demand forecasting
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Automated reordering
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Stock level optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Seasonal adjustment
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Dynamic Pricing</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Competitive price monitoring
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Real-time price adjustments
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Margin optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Demand-based pricing
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Promotional automation
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Supply Chain</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Route optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Vendor performance tracking
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Risk prediction
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Cost optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Sustainability metrics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/ai-operations.webp',
        transition: 'slide'
      },
      {
        id: '5',
        title: 'Autonomous Commerce',
        content: `
          <div class="absolute inset-0 flex flex-col md:flex-row">
            <div class="relative md:w-1/2 flex items-center justify-center p-16 bg-gradient-to-r from-black/90 via-black/70 to-transparent">
              <div class="space-y-8">
                <h3 class="text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                  Self-Driving<br/>Commerce<br/>Platform
                </h3>
                <p class="text-xl text-blue-100 leading-relaxed">
                  The future of retail is autonomous systems that learn, adapt, and optimize themselves in real-time.
                </p>
              </div>
            </div>
            <div class="relative md:w-1/2 flex flex-col justify-center p-16 space-y-8 bg-gradient-to-l from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Self-Learning Systems</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Continuous performance optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Pattern recognition & adaptation
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Automated A/B testing
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Real-time strategy adjustment
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Market Intelligence</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Trend prediction & analysis
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Competitive landscape monitoring
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Consumer behavior forecasting
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Market opportunity detection
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Risk Management</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Fraud detection & prevention
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Supply chain risk assessment
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Market volatility protection
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Compliance automation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/autonomous-commerce.webp',
        transition: 'slide'
      },
      {
        id: '6',
        title: 'LastBot Solutions',
        content: `
          <div class="absolute inset-0 flex flex-col">
            <div class="relative flex items-center justify-center p-16 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
              <div class="flex flex-col items-center gap-8">
                <div class="flex items-center gap-8">
                  <img src="/images/lastbot logo 480x480.jpg" alt="LastBot Logo" class="w-24 h-24 rounded-xl shadow-2xl" />
                  <h3 class="text-7xl font-bold text-center leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                    LastBot
                  </h3>
                </div>
                <p class="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100 font-light tracking-wide">
                  Your Partner in AI Commerce Evolution
                </p>
              </div>
            </div>
            <div class="relative flex-1 grid md:grid-cols-3 gap-8 px-16 pt-8 pb-16 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Ready Solutions</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    24/7 AI Customer Service
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Smart Product Recommendations
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Dynamic Pricing Engine
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Inventory Optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Automated Marketing Tools
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Custom Development</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Personalized AI Solutions
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    System Integration Services
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Custom Analytics Platforms
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Automated Workflow Design
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    API Development
                  </li>
                </ul>
              </div>

              <div class="backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl bg-gradient-to-br from-blue-950/30 to-transparent hover:from-blue-900/30 transition-all duration-300">
                <h4 class="text-3xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-100">Strategic Services</h4>
                <ul class="list-none space-y-4 text-lg">
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    AI Transformation Consulting
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Team Training Programs
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Performance Optimization
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Technology Roadmapping
                  </li>
                  <li class="flex items-center">
                    <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    ROI Maximization Strategy
                  </li>
                </ul>
              </div>
            </div>
          </div>
        `,
        background_image: '/images/presentations/lastbot-solutions.webp',
        transition: 'slide'
      }
    ]
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = params;
  const presentationKey = `${slug}${locale === 'en' ? '' : '-' + locale}`
  const presentation = presentations[presentationKey]

  if (!presentation) {
    return {}
  }

  return {
    title: presentation.title,
    description: presentation.description,
    openGraph: {
      title: presentation.title,
      description: presentation.description,
      type: 'website',
      url: `/presentations/${slug}`,
      images: [
        {
          url: presentation.preview_image,
          width: 1200,
          height: 630,
          alt: presentation.title
        }
      ]
    },
    alternates: {
      canonical: `/presentations/${slug}`
    }
  }
}

export default async function PresentationPage({ params }: Props) {
  const { locale, slug } = params;
  await setupServerLocale(locale)
  const t = await getTranslations('Presentations')
  const presentationKey = `${slug}${locale === 'en' ? '' : '-' + locale}`
  const presentation = presentations[presentationKey]

  if (!presentation) {
    notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'PresentationDigitalDocument',
    name: presentation.title,
    description: presentation.description,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/presentations/${presentation.slug}`,
    image: presentation.preview_image,
    datePublished: presentation.created_at,
    dateModified: presentation.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'LastBot Inc',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    author: {
      '@type': 'Organization',
      name: 'LastBot Team'
    }
  }

  return (
    <>
      <StructuredData data={structuredData} />
      <PresentationViewer presentation={presentation} locale={locale} />
    </>
  )
} 