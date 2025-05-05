'use server'

import { getTranslations, getFormatter } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid'
import { createClient } from '@/utils/supabase/server'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params
  const t = await getTranslations({ locale, namespace: 'CustomerStories.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function CustomerStoriesPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations('CustomerStories')
  const format = await getFormatter({ locale })

  // In a real implementation, these would likely come from a database
  // Here we'll create some mock customer stories for display purposes
  const featuredStory = {
    id: "featured-1",
    company: t('featured.company'),
    logo: "/images/customer-logos/featured-logo.svg",
    title: t('featured.title'),
    summary: t('featured.summary'),
    quote: t('featured.quote'),
    personName: t('featured.personName'),
    personTitle: t('featured.personTitle'),
    personImage: "/images/customers/featured-person.jpg",
    heroImage: "/images/customer-hero.jpg",
    results: [
      {
        stat: t('featured.results.stat1'),
        label: t('featured.results.label1')
      },
      {
        stat: t('featured.results.stat2'),
        label: t('featured.results.label2')
      },
      {
        stat: t('featured.results.stat3'),
        label: t('featured.results.label3')
      }
    ]
  };

  const customerStories = [
    {
      id: "cs-1",
      company: t('stories.story1.company'),
      logo: "/images/customer-logos/logo1.svg",
      title: t('stories.story1.title'),
      industry: t('stories.story1.industry'),
      excerpt: t('stories.story1.excerpt'),
      image: "/images/customers/customer1.jpg"
    },
    {
      id: "cs-2",
      company: t('stories.story2.company'),
      logo: "/images/customer-logos/logo2.svg",
      title: t('stories.story2.title'),
      industry: t('stories.story2.industry'),
      excerpt: t('stories.story2.excerpt'),
      image: "/images/customers/customer2.jpg"
    },
    {
      id: "cs-3",
      company: t('stories.story3.company'),
      logo: "/images/customer-logos/logo3.svg",
      title: t('stories.story3.title'),
      industry: t('stories.story3.industry'),
      excerpt: t('stories.story3.excerpt'),
      image: "/images/customers/customer3.jpg"
    },
    {
      id: "cs-4",
      company: t('stories.story4.company'),
      logo: "/images/customer-logos/logo4.svg",
      title: t('stories.story4.title'),
      industry: t('stories.story4.industry'),
      excerpt: t('stories.story4.excerpt'),
      image: "/images/customers/customer4.jpg"
    },
    {
      id: "cs-5",
      company: t('stories.story5.company'),
      logo: "/images/customer-logos/logo5.svg",
      title: t('stories.story5.title'),
      industry: t('stories.story5.industry'),
      excerpt: t('stories.story5.excerpt'),
      image: "/images/customers/customer5.jpg"
    },
    {
      id: "cs-6",
      company: t('stories.story6.company'),
      logo: "/images/customer-logos/logo6.svg",
      title: t('stories.story6.title'),
      industry: t('stories.story6.industry'),
      excerpt: t('stories.story6.excerpt'),
      image: "/images/customers/customer6.jpg"
    }
  ];

  // Industry filter options
  const industries = [
    { id: 'all', name: t('filters.industries.all') },
    { id: 'logistics', name: t('filters.industries.logistics') },
    { id: 'manufacturing', name: t('filters.industries.manufacturing') },
    { id: 'services', name: t('filters.industries.services') },
    { id: 'retail', name: t('filters.industries.retail') },
    { id: 'construction', name: t('filters.industries.construction') },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-piki mb-6 leading-tight">
              {t('hero.heading')}
            </h1>
            <p className="text-xl text-gray-700">
              {t('hero.subheading')}
            </p>
          </div>

          {/* Featured customer story card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left side - Image */}
              <div className="relative h-[300px] md:h-auto">
                <Image 
                  src={featuredStory.heroImage}
                  alt={featuredStory.company}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />
                <div className="absolute top-0 left-0 bg-kupari text-white px-4 py-2 text-sm font-medium">
                  {t('featured.label')}
                </div>
              </div>
              
              {/* Right side - Content */}
              <div className="p-8 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 relative mr-4">
                    <Image
                      src={featuredStory.logo}
                      alt={featuredStory.company}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-piki">
                    {featuredStory.company}
                  </h3>
                </div>
                
                <h2 className="text-2xl font-bold text-piki mb-4">
                  {featuredStory.title}
                </h2>
                
                <p className="text-gray-700 mb-6">
                  {featuredStory.summary}
                </p>
                
                {/* Results section */}
                <div className="flex flex-wrap gap-6 mb-6">
                  {featuredStory.results.map((result, index) => (
                    <div key={index} className="flex-1 min-w-[120px]">
                      <div className="text-2xl font-bold text-kupari">
                        {result.stat}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="border-l-4 border-kupari pl-4 italic text-gray-700 mb-6">
                  "{featuredStory.quote}"
                </blockquote>
                
                <div className="flex items-center mt-auto">
                  <div className="h-12 w-12 relative mr-3 rounded-full overflow-hidden">
                    <Image
                      src={featuredStory.personImage}
                      alt={featuredStory.personName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-piki">
                      {featuredStory.personName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {featuredStory.personTitle}
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="mt-8 bg-piki hover:bg-piki/90 text-white"
                  asChild
                >
                  <Link href={`/${locale}/asiakastarinat/${featuredStory.id}`}>
                    {t('featured.readMore')} <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial band */}
      <section className="w-full bg-beige py-16 has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="h-8 w-8 text-kupari" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-piki mb-6 leading-relaxed">
              "{t('testimonial.quote')}"
            </blockquote>
            <div className="font-bold text-kupari text-lg">
              {t('testimonial.author')}
            </div>
            <div className="text-gray-700">
              {t('testimonial.position')}
            </div>
          </div>
        </div>
      </section>
      
      {/* Customer stories grid */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-piki mb-4">
              {t('storiesSection.title')}
            </h2>
            <div className="h-1 w-16 bg-kupari mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl">
              {t('storiesSection.description')}
            </p>
          </div>
          
          {/* Filters */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.industryLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      className={`px-4 py-2 text-sm rounded-full border ${
                        industry.id === 'all' 
                          ? 'bg-piki text-white border-piki' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-kupari hover:text-kupari'
                      }`}
                    >
                      {industry.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.sortLabel')}
                </label>
                <select className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari">
                  <option value="newest">{t('filters.sortOptions.newest')}</option>
                  <option value="oldest">{t('filters.sortOptions.oldest')}</option>
                  <option value="company">{t('filters.sortOptions.company')}</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Stories grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {customerStories.map((story) => (
              <Link
                href={`/${locale}/asiakastarinat/${story.id}`}
                key={story.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <Image
                    src={story.image}
                    alt={story.company}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 relative mr-3">
                      <Image
                        src={story.logo}
                        alt={story.company}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="text-lg font-bold text-piki">
                      {story.company}
                    </div>
                  </div>
                  <div className="bg-beige text-piki text-xs font-medium inline-block px-2 py-1 rounded mb-3">
                    {story.industry}
                  </div>
                  <h3 className="text-xl font-bold text-piki mb-3">
                    {story.title}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {story.excerpt}
                  </p>
                  <div className="text-kupari font-medium flex items-center">
                    {t('stories.readMore')} <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Load more button */}
          <div className="flex justify-center mt-12">
            <Button 
              variant="outline"
              size="lg"
              className="border-kupari text-kupari hover:bg-kupari hover:text-white px-8"
            >
              {t('storiesSection.loadMore')}
            </Button>
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="w-full bg-piki py-16 text-white relative">
        <div className="absolute inset-0 opacity-70">
          <Image 
            src="/images/innofleet-car-background.png" 
            alt={t('cta.backgroundAlt')}
            fill 
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-piki/40 z-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold mb-4 font-['Inter_Tight']">
              {t('cta.title')}
            </h2>
            <p className="mb-6 text-lg text-white">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-kupari hover:bg-kupari/90 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href={`/${locale}/yhteystiedot`}>
                  {t('cta.contactButton')}
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-piki px-8 py-3 text-lg"
                asChild
              >
                <Link href={`/${locale}/leasing-solutions`}>
                  {t('cta.leasingButton')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 