import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateLocalizedMetadata } from '@/utils/metadata'
import HomePage from '@/components/pages/home/index'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = params
  const t = await getTranslations('home')
  
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function Page({ params }: Props) {
  const { locale } = params
  const t = await getTranslations('home')
  
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header/Nav */}
      <header className="w-full bg-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Image 
            src="/logo-innolease.svg" 
            alt="Innolease" 
            width={120} 
            height={40}
            className="mr-10"
          />
          <nav className="hidden md:flex space-x-6">
            <Link href="#" className="text-gray-700 hover:text-gray-900">{t('nav.leasingServices')}</Link>
            <Link href="#" className="text-gray-700 hover:text-gray-900">{t('nav.customers')}</Link>
            <Link href="#" className="text-gray-700 hover:text-gray-900">{t('nav.jobOpening')}</Link>
            <Link href="#" className="text-gray-700 hover:text-gray-900">{t('nav.news')}</Link>
          </nav>
        </div>
        <button className="bg-[#B87333] text-white px-4 py-2 rounded hover:bg-opacity-90">
          {t('nav.contact')}
        </button>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="relative overflow-hidden rounded-lg">
            <Image 
              src="/images/hero-handshake.jpg" 
              alt="Business partners shaking hands" 
              width={1200} 
              height={400} 
              className="w-full h-[300px] object-cover"
            />
          </div>
          
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div>
              <h1 className="text-3xl font-bold font-['Inter_Tight'] text-gray-900">
                {t('hero.title')}
              </h1>
              
              <button className="mt-4 bg-[#B87333] text-white px-4 py-2 rounded hover:bg-opacity-90">
                {t('hero.readMore')}
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                {t('hero.description1')}
              </p>
              <p className="text-gray-700">
                {t('hero.description2')}
              </p>
              <button className="mt-2 text-sm underline text-[#B87333]">
                {t('hero.readMore')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Leasing Options */}
      <section className="w-full bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="has-overlay-pattern overlay-pattern-wavy overlay-opacity-10 relative rounded-lg overflow-hidden bg-[#B87333]">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 font-['Inter_Tight']">{t('leasingOptions.leftCard.title')}</h2>
                <p className="text-sm mb-6">{t('leasingOptions.leftCard.description')}</p>
                <button className="bg-white text-[#B87333] px-4 py-2 rounded">
                  {t('leasingOptions.leftCard.readMore')}
                </button>
              </div>
              <div className="absolute right-0 bottom-0 h-[180px] w-[280px]">
                <Image 
                  src="/images/mercedes-car.jpg" 
                  alt="Mercedes car" 
                  width={280} 
                  height={180} 
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Right Card */}
            <div className="has-overlay-pattern overlay-pattern-tile-dense overlay-opacity-15 relative rounded-lg overflow-hidden bg-gray-600">
              <div className="p-6 text-white">
                <h2 className="text-2xl font-bold mb-2 font-['Inter_Tight']">{t('leasingOptions.rightCard.title')}</h2>
                <p className="text-sm mb-6">{t('leasingOptions.rightCard.description')}</p>
                <button className="bg-[#B87333] text-white px-4 py-2 rounded">
                  {t('leasingOptions.rightCard.readMore')}
                </button>
              </div>
              <div className="absolute right-0 bottom-0 h-[180px] w-[280px]">
                <Image 
                  src="/images/pickup-truck.jpg" 
                  alt="Pickup truck" 
                  width={280} 
                  height={180} 
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Links */}
      <section className="w-full bg-white py-4">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="#" className="flex items-center space-x-2 border border-gray-300 rounded p-4 hover:bg-gray-50">
              <span className="text-lg">→</span>
              <span className="font-medium">{t('serviceLinks.fleetManagerTools')}</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 border border-gray-300 rounded p-4 hover:bg-gray-50">
              <span className="text-lg">→</span>
              <span className="font-medium">{t('serviceLinks.carCalculator')}</span>
            </Link>
            <Link href="#" className="flex items-center space-x-2 border border-gray-300 rounded p-4 hover:bg-gray-50">
              <span className="text-lg">→</span>
              <span className="font-medium">{t('serviceLinks.companyCarGuide')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Offerings */}
      <section className="w-full bg-white py-8">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-4 flex items-center">
            <h2 className="text-2xl font-bold font-['Inter_Tight']">{t('news.title')}</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-[160px] relative">
                <Image 
                  src="/images/ford-transit.jpg" 
                  alt="Ford Transit" 
                  width={400} 
                  height={160} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2">{t('news.card1.title')}</h3>
                <p className="text-sm text-gray-600 mb-3">{t('news.card1.description')}</p>
                <Link href="#" className="text-sm text-[#B87333] font-medium">{t('news.card1.readMore')} →</Link>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-[160px] relative">
                <Image 
                  src="/images/sportscars.jpg" 
                  alt="Sport cars" 
                  width={400} 
                  height={160} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2">{t('news.card2.title')}</h3>
                <p className="text-sm text-gray-600 mb-3">{t('news.card2.description')}</p>
                <Link href="#" className="text-sm text-[#B87333] font-medium">{t('news.card2.readMore')} →</Link>
              </div>
            </div>
            
            {/* Card 3 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-[160px] relative">
                <Image 
                  src="/images/etruck.jpg" 
                  alt="Electric truck" 
                  width={400} 
                  height={160} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-2">{t('news.card3.title')}</h3>
                <p className="text-sm text-gray-600 mb-3">{t('news.card3.description')}</p>
                <Link href="#" className="text-sm text-[#B87333] font-medium">{t('news.card3.readMore')} →</Link>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button className="bg-black text-white px-6 py-2 rounded hover:bg-opacity-80">
              {t('news.viewAll')} →
            </button>
          </div>
        </div>
      </section>

      {/* InnoFleet Manager Section */}
      <section className="w-full bg-black py-12 text-white has-overlay-pattern overlay-pattern-shape overlay-opacity-10">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 font-['Inter_Tight']">{t('innoFleet.title')}</h2>
              <p className="mb-4">{t('innoFleet.description1')}</p>
              <p className="mb-6">{t('innoFleet.description2')}</p>
              <button className="bg-[#B87333] text-white px-4 py-2 rounded hover:bg-opacity-90">
                {t('innoFleet.readMore')}
              </button>
            </div>
            <div className="relative">
              <Image 
                src="/images/phone-mockup.png" 
                alt="InnoFleet Manager app" 
                width={400} 
                height={600} 
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-white py-12">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8 font-['Inter_Tight']">
            {t('team.title')}
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Image 
                  src={`/images/team-member-${index + 1}.jpg`} 
                  alt="Team member" 
                  width={220} 
                  height={220} 
                  className="mx-auto mb-4 rounded-lg"
                />
                <h3 className="font-bold">Jukka Mäkinen</h3>
                <p className="text-sm text-gray-600">{t('team.role')}</p>
                <p className="text-sm mt-2">+358 50 123 4567</p>
                <p className="text-sm text-[#B87333]">{t('team.email')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark CTA Section */}
      <section className="w-full bg-gray-900 py-12 text-white relative">
        <div className="absolute inset-0 opacity-50">
          <Image 
            src="/images/dark-car.jpg" 
            alt="Dark car" 
            fill 
            className="object-cover"
          />
        </div>
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold mb-4 font-['Inter_Tight']">
              {t('transparency.title')}
            </h2>
            <p className="mb-6">
              {t('transparency.description')}
            </p>
            <button className="bg-[#B87333] text-white px-4 py-2 rounded hover:bg-opacity-90">
              {t('transparency.readMore')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <Image 
              src="/logo-innolease.svg" 
              alt="Innolease" 
              width={120} 
              height={40} 
            />
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <p>Innolease Oy</p>
              <p>Lehtikatu 1</p>
              <p>01750 Vantaa</p>
              <p className="mt-2">Y-tunnus 2354-234-9</p>
            </div>
            
            <div>
              <p className="font-bold mb-2">{t('footer.exchange')}</p>
              <p>020 123 4567</p>
              <p>info@innolease.fi</p>
            </div>
            
            <div>
              <p className="font-bold mb-2">{t('footer.service')}</p>
              <p>020 123 4568</p>
              <p>huolto@innolease.fi</p>
              <p>{t('footer.openingHours')}</p>
            </div>
            
            <div>
              <p className="font-bold mb-2">{t('footer.publishingPlatform')}</p>
              <p>Tmi Verkkokauppa</p>
              <p>design@verkkokauppa.fi</p>
            </div>
          </div>
          
          <div className="mt-8 text-gray-500 text-sm">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </main>
  )
}
