import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/utils/metadata'
import HomePage from '@/components/pages/home/index'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { setupServerLocale } from '@/app/i18n/server-utils'
import { LeasingOptionsCards } from '@/app/components/LeasingOptionsCards'
import { Locale } from '@/app/i18n/config'
import SectionContainer from '@/app/components/SectionContainer'
import { BlogCardList } from '@/app/components/BlogCardList'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  await setupServerLocale(locale)
  const tMeta = await getTranslations({ locale, namespace: 'Home.meta' })
  
  return {
    title: tMeta('title'),
    description: tMeta('description'),
  }
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Home' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  // Fetch the latest 3 news blog posts
  const supabase = await createClient()
  const { data: blogPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, featured_image, slug, created_at')
    .eq('locale', locale)
    .eq('subject', 'news')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Transform blog posts for the BlogCardList component
  const blogPostsFormatted = (blogPosts || []).map(post => ({
    id: post.id,
    title: post.title,
    description: post.excerpt,
    imageSrc: post.featured_image || '/images/no-bg/etruck.png', // Fallback image if none provided
    imageAlt: post.title,
    date: new Date(post.created_at).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    href: `/blog/${post.slug}`
  }))

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section - Updated layout: Full-width image within container */}
      <section className="w-full bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Image container - Full width */}
          <div className="w-full relative h-[400px] md:h-[500px] mb-12"> {/* Added bottom margin */}
            <Image 
              src="/images/hero-handshake.jpg" 
              alt={t('hero.backgroundAlt')}
              fill
              className="object-cover" // Standard corners
              priority
              sizes="100vw" // Let it adapt based on container width
              quality={90}
            />
          </div>

          {/* Text content container - Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Left Column: Heading (centered) */}
            <div className="text-center md:text-left">
              <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                {t('hero.heading')}
                <span className="block mt-3 text-4xl font-normal text-gray-800">
                  {t('hero.subheading')}
                </span>
              </h1>
            </div>

            {/* Right Column: Paragraphs and Button */}
            <div>
              <div className="space-y-5 text-gray-700 text-lg">
                <p>
                  {t('hero.paragraph1')}
                </p>
                <p>
                  {t('hero.paragraph2')}
                </p>
              </div>
              
              <Button 
                size="default"
                className="mt-8 bg-piki hover:bg-piki/90 text-white px-8 py-3 rounded-md"
                asChild
              >
                <Link href="#">{t('hero.readMore')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Leasing Options */}
      <section className="w-full bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <LeasingOptionsCards />
        </div>
      </section>

      {/* Service Links */}
      <section className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/fleet-manager"
            className="rounded-lg overflow-hidden block p-6 bg-piki text-white hover:opacity-90 transition-all"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">{t("serviceLinks.fleetManagerTools")}</h3>
              <p className="text-sm mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
              <div className="mt-auto text-sm font-medium flex items-center">
                {tCommon("learnMore")} <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
          
          <Link 
            href="/car-calculator"
            className="rounded-lg overflow-hidden block p-6 bg-beige text-piki hover:opacity-90 transition-all"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">{t("serviceLinks.carCalculator")}</h3>
              <p className="text-sm mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
              <div className="mt-auto text-sm font-medium flex items-center">
                {tCommon("learnMore")} <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
          
          <Link 
            href="/company-car-guide"
            className="rounded-lg overflow-hidden block p-6 bg-maantie text-piki hover:opacity-90 transition-all"
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-2">{t("serviceLinks.companyCarGuide")}</h3>
              <p className="text-sm mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
              <div className="mt-auto text-sm font-medium flex items-center">
                {tCommon("learnMore")} <ArrowRightIcon className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* News Section (replaced with BlogCardList) */}
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-['Inter_Tight'] text-piki">{t('news.title')}</h2>
            <div className="h-1 w-16 bg-kupari mt-2"></div>
          </div>
          
          {blogPostsFormatted.length > 0 ? (
            <BlogCardList 
              posts={blogPostsFormatted} 
              className="pt-0"
            />
          ) : (
            // Fallback to hardcoded cards if no blog posts are available
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10">
                <div className="h-[240px] relative">
                  <div className="absolute inset-0 bg-beige"></div>
                  <Image 
                    src="/images/no-bg/ford-transit.png" 
                    alt={t('news.card1.imageAlt', {defaultValue: "Ford Transit"})}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm font-medium text-kupari mb-2 block">12.06.2024</span>
                  <h3 className="text-xl font-bold mb-3 text-piki">{t('news.card1.title')}</h3>
                  <p className="text-betoni mb-4">{t('news.card1.description')}</p>
                  <Link href="#" className="text-kupari font-medium flex items-center">
                    {t('news.card1.readMore')} <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              {/* Card 2 */}
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10">
                <div className="h-[240px] relative">
                  <div className="absolute inset-0 bg-beige"></div>
                  <Image 
                    src="/images/no-bg/sportscars.png" 
                    alt={t('news.card2.imageAlt', {defaultValue: "Sport cars"})}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm font-medium text-kupari mb-2 block">05.06.2024</span>
                  <h3 className="text-xl font-bold mb-3 text-piki">{t('news.card2.title')}</h3>
                  <p className="text-betoni mb-4">{t('news.card2.description')}</p>
                  <Link href="#" className="text-kupari font-medium flex items-center">
                    {t('news.card2.readMore')} <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              {/* Card 3 */}
              <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10">
                <div className="h-[240px] relative">
                  <div className="absolute inset-0 bg-beige"></div>
                  <Image 
                    src="/images/no-bg/etruck.png" 
                    alt={t('news.card3.imageAlt', {defaultValue: "Electric truck"})}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    quality={90}
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm font-medium text-kupari mb-2 block">28.05.2024</span>
                  <h3 className="text-xl font-bold mb-3 text-piki">{t('news.card3.title')}</h3>
                  <p className="text-betoni mb-4">{t('news.card3.description')}</p>
                  <Link href="#" className="text-kupari font-medium flex items-center">
                    {t('news.card3.readMore')} <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-10">
            <Button variant="default" size="lg" className="bg-piki hover:bg-piki/90 text-white px-8 py-3 text-lg">
              <Link href={`/${locale}/blog`}>
                {t('news.viewAll')} <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* InnoFleet Manager Section */}
      <section className="w-full py-16 text-white relative">
        {/* Dark background image with car */}
        <div className="absolute inset-0">
          <Image 
            src="/images/innofleet-car-background.png" 
            alt={t('innoFleet.imageAlt', {defaultValue: "Luxury car background"})}
            fill
            className="object-cover" 
            sizes="100vw"
            quality={90}
          />
        </div>
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4 font-['Inter_Tight']">{t('innoFleet.title')}</h2>
              <p className="mb-4 text-xl text-gray-100">{t('innoFleet.description1')}</p>
              <p className="mb-6 text-lg text-gray-100">{t('innoFleet.description2')}</p>
              <Button variant="default" size="lg" className="bg-kupari hover:bg-kupari/90 text-white px-8 py-3 text-lg">
                {t('innoFleet.readMore')}
              </Button>
            </div>
            <div className="relative">
              <div className="relative h-[600px] w-full max-w-[400px] mx-auto">
                <Image 
                  src="/images/innofleet-app-mockup.png" 
                  alt={t('innoFleet.imageAlt', {defaultValue: "InnoFleet Manager app"})}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-['Inter_Tight'] text-piki">{t('team.title')}</h2>
            <div className="h-1 w-16 bg-kupari mt-2"></div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 w-[240px] h-[240px] relative">
                  <Image 
                    src={`/images/team-member-${index + 1}.jpg`} 
                    alt={t('team.memberAlt', {defaultValue: "Team member", id: index + 1})}
                    width={240}
                    height={240}
                    className="rounded-lg object-cover shadow-md"
                    quality={90}
                  />
                </div>
                <h3 className="text-xl font-bold text-piki">{t(`team.member${index + 1}.name`, {defaultValue: "Jukka Mäkinen"})}</h3>
                <p className="text-betoni">{t('team.role')}</p>
                <p className="mt-2 text-piki">{t(`team.member${index + 1}.phone`, {defaultValue: "+358 50 123 4567"})}</p>
                <p className="text-kupari font-medium">{t('team.email')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA Section */}
      <section className="w-full bg-piki py-16 text-white relative">
        <div className="absolute inset-0 opacity-70">
          <Image 
            src="/images/innofleet-car-background.png" 
            alt={t('transparency.imageAlt', {defaultValue: "Dark car"})}
            fill 
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-piki/40 z-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-4 font-['Inter_Tight']">
              {t('transparency.title')}
            </h2>
            <p className="mb-6 text-lg text-white">
              {t('transparency.description')}
            </p>
            <Button variant="default" size="lg" className="bg-kupari hover:bg-kupari/90 text-white px-8 py-3 text-lg">
              {t('transparency.readMore')}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
