'use server'

import { getTranslations, getFormatter } from 'next-intl/server'
import { setupServerLocale } from '@/app/i18n/server-utils'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import CarBenefitCalculatorClient from './CarBenefitCalculatorClient' // Import the client component
import { Metadata } from 'next'

// Define generateMetadata directly in the server component
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations({ locale, namespace: 'CarBenefitCalculator.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

// Make the page component async
export default async function CarBenefitCalculatorPage({ params }: { params: { locale: string } }) {
  const { locale } = params
  await setupServerLocale(locale)
  const t = await getTranslations('CarBenefitCalculator')
  // Note: format is not used in the server part, it's needed in the client component

  return (
    <main className="flex flex-col">
      {/* Hero section - Server Rendered */}
      <section className="relative bg-gradient-to-r from-piki to-teal-700 py-24 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                {t('hero.heading')}
              </h1>
              <p className="max-w-[600px] text-white/90 md:text-xl">
                {t('hero.subheading')}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/images/car-benefit-hero.jpg"
                alt={t('hero.backgroundAlt')}
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
                priority // Added priority for LCP image
              />
            </div>
          </div>
        </div>
      </section>

      {/* Intro section - Server Rendered */}
      <section className="py-12 bg-beige">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('intro.title')}
            </h2>
            <p className="text-gray-700 mb-8">
              {t('intro.description')}
            </p>
            <Button
              className="bg-piki hover:bg-piki/90"
              // Scroll logic needs to be client-side, handled within the client component or via separate client script
              // For server component, link directly if possible or indicate action
              asChild
            >
              <a href="#calculator"> {/* Simple anchor link for server component */} 
                {t('intro.getStarted')} <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Calculator section - Use Client Component */}
      <section id="calculator" className="py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('calculator.title')}
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto">
              {t('calculator.description')}
            </p>
          </div>

          {/* Render the client component for the interactive parts */}
          <CarBenefitCalculatorClient 
            locale={locale} 
            // Pass required translations matching the Client component's expected structure
            translations={{
              calculatorTab: {
                selectBenefitType: t('calculator.selectBenefitType'),
                free: t('calculator.tabs.free'),
                limited: t('calculator.tabs.limited')
              },
              inputs: {
                title: t('calculator.parameters.title'),
                carValue: t('calculator.parameters.carValue'),
                annualDriving: t('calculator.parameters.annualDriving'),
                homeToWork: t('calculator.parameters.homeToWork'),
                monthlyCost: t('calculator.parameters.monthlyCost')
              },
              results: {
                title: t('calculator.results.title'),
                monthlyTitle: t('calculator.results.monthlyTitle'),
                annualTitle: t('calculator.results.annualTitle'),
                employerCost: t('calculator.results.employerCost'),
                employeeCost: t('calculator.results.employeeCost'),
                taxBenefit: t('calculator.results.taxBenefit'),
                totalCost: t('calculator.results.totalCost'),
                // Include benefit descriptions here if needed by the client component results section
                freeBenefit: {
                  description: t('calculator.freeBenefit.description'),
                  advantages: t('calculator.freeBenefit.advantages'),
                  advantage1: t('calculator.freeBenefit.advantage1'),
                  advantage2: t('calculator.freeBenefit.advantage2'),
                  advantage3: t('calculator.freeBenefit.advantage3'),
                  considerations: t('calculator.freeBenefit.considerations'),
                  consideration1: t('calculator.freeBenefit.consideration1'),
                  consideration2: t('calculator.freeBenefit.consideration2'),
                  consideration3: t('calculator.freeBenefit.consideration3')
                },
                limitedBenefit: {
                  description: t('calculator.limitedBenefit.description'),
                  advantages: t('calculator.limitedBenefit.advantages'),
                  advantage1: t('calculator.limitedBenefit.advantage1'),
                  advantage2: t('calculator.limitedBenefit.advantage2'),
                  advantage3: t('calculator.limitedBenefit.advantage3'),
                  considerations: t('calculator.limitedBenefit.considerations'),
                  consideration1: t('calculator.limitedBenefit.consideration1'),
                  consideration2: t('calculator.limitedBenefit.consideration2'),
                  consideration3: t('calculator.limitedBenefit.consideration3')
                },
                callToAction: t('cta.title') // Or wherever the CTA text is needed
              }
            }}
          />
          
          {/* Call to action - Server Rendered */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('cta.title')}
            </h3>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-piki hover:bg-piki/90" asChild>
                 {/* Assuming contact page exists */}
                <Link href={`/${locale}/yhteystiedot`}>
                  {t('cta.contactButton')} <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                {/* Assuming leasing solutions page exists */}
                <Link href={`/${locale}/leasing-solutions`}>
                  {t('cta.learnMoreButton')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 