"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneIcon, EnvelopeIcon, ClockIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { PersonnelCard } from "@/app/components/v2/components/PersonnelCard";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "CustomerService.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CustomerServicePage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CustomerService" });

  // Contact offices data could come from a database in a real implementation
  const contactOffices = [
    {
      name: t("offices.helsinki.name"),
      address: t("offices.helsinki.address"),
      phone: t("offices.helsinki.phone"),
      email: t("offices.helsinki.email"),
      hours: t("offices.helsinki.hours"),
    },
    {
      name: t("offices.tampere.name"),
      address: t("offices.tampere.address"),
      phone: t("offices.tampere.phone"),
      email: t("offices.tampere.email"),
      hours: t("offices.tampere.hours"),
    },
    {
      name: t("offices.oulu.name"),
      address: t("offices.oulu.address"),
      phone: t("offices.oulu.phone"),
      email: t("offices.oulu.email"),
      hours: t("offices.oulu.hours"),
    },
  ];

  // Support categories
  const supportCategories = [
    {
      title: t("supportCategories.categories.leasing.title"),
      description: t("supportCategories.categories.leasing.description"),
      icon: "/images/icons/leasing-icon.svg",
    },
    {
      title: t("supportCategories.categories.maintenance.title"),
      description: t("supportCategories.categories.maintenance.description"),
      icon: "/images/icons/maintenance-icon.svg",
    },
    {
      title: t("supportCategories.categories.billing.title"),
      description: t("supportCategories.categories.billing.description"),
      icon: "/images/icons/billing-icon.svg",
    },
    {
      title: t("supportCategories.categories.accounts.title"),
      description: t("supportCategories.categories.accounts.description"),
      icon: "/images/icons/accounts-icon.svg",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Image container - Full width */}
          <div className="w-full relative h-[300px] md:h-[400px] mb-12">
            <Image
              src="/images/customer-service-hero.jpg"
              alt={t("hero.backgroundAlt")}
              fill
              className="object-cover rounded-lg"
              priority
              sizes="100vw"
              quality={90}
            />
            {/* Text overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-piki/80 to-piki/20 rounded-lg flex items-center">
              <div className="text-white max-w-2xl pl-8 md:pl-16">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{t("hero.heading")}</h1>
                <p className="text-xl md:text-2xl font-light">{t("hero.subheading")}</p>
              </div>
            </div>
          </div>

          {/* Introduction section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-16">
            <div>
              <h2 className="text-3xl font-bold text-piki mb-4">{t("intro.title")}</h2>
              <div className="h-1 w-16 bg-kupari mb-6"></div>
              <div className="space-y-5 text-gray-700">
                <p className="text-lg">{t("intro.paragraph1")}</p>
                <p className="text-lg">{t("intro.paragraph2")}</p>
              </div>
            </div>
            <div className="bg-beige p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-piki mb-4">{t("quickHelp.title")}</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-kupari mr-3" />
                  <span className="text-lg font-medium">{t("quickHelp.phone")}</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-kupari mr-3" />
                  <span className="text-lg font-medium">{t("quickHelp.email")}</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-kupari mr-3" />
                  <span className="text-lg font-medium">{t("quickHelp.hours")}</span>
                </div>
              </div>
              <div className="mt-6">
                <Button size="default" className="bg-kupari hover:bg-kupari/90 text-white px-6 py-3 rounded-md" asChild>
                  <Link href="#contact-form">{t("quickHelp.contactButton")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-piki mb-4">{t("supportCategories.title")}</h2>
            <div className="h-1 w-16 bg-kupari mx-auto mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">{t("supportCategories.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-2 bg-beige inline-block rounded-full mb-4">
                  <Image src={category.icon} alt={category.title} width={40} height={40} className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold text-piki mb-3">{category.title}</h3>
                <p className="text-gray-700 mb-4">{category.description}</p>
                <Link href="#" className="text-kupari font-medium flex items-center hover:underline">
                  {t("supportCategories.learnMore")}
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices section */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-piki mb-4">{t("offices.title")}</h2>
            <div className="h-1 w-16 bg-kupari mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl">{t("offices.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOffices.map((office, index) => (
              <div
                key={index}
                className="bg-beige rounded-lg p-6 has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10"
              >
                <h3 className="text-xl font-bold text-piki mb-4">{office.name}</h3>
                <div className="space-y-3 text-gray-700">
                  <p>{office.address}</p>
                  <p className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-kupari mr-2" />
                    {office.phone}
                  </p>
                  <p className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-kupari mr-2" />
                    {office.email}
                  </p>
                  <p className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-kupari mr-2" />
                    {office.hours}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 border-kupari text-kupari hover:bg-kupari hover:text-white"
                  asChild
                >
                  <Link href={`https://maps.google.com/?q=${office.name} ${office.address}`} target="_blank">
                    {t("offices.viewMap")}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form section */}
      <section id="contact-form" className="w-full bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-piki mb-4">{t("contactForm.title")}</h2>
              <div className="h-1 w-16 bg-kupari mb-6"></div>
              <p className="text-lg text-gray-700 mb-4">{t("contactForm.description")}</p>
              <div className="mt-8 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-piki">{t("contactForm.faq.question1")}</h4>
                  <p className="text-gray-700 mt-2">{t("contactForm.faq.answer1")}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-piki">{t("contactForm.faq.question2")}</h4>
                  <p className="text-gray-700 mt-2">{t("contactForm.faq.answer2")}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-piki">{t("contactForm.faq.question3")}</h4>
                  <p className="text-gray-700 mt-2">{t("contactForm.faq.answer3")}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-piki mb-6">{t("contactForm.formTitle")}</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contactForm.firstName")}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contactForm.lastName")}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contactForm.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contactForm.phone")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contactForm.subject")}
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  >
                    <option value="">{t("contactForm.selectSubject")}</option>
                    <option value="leasing">{t("contactForm.subjects.leasing")}</option>
                    <option value="maintenance">{t("contactForm.subjects.maintenance")}</option>
                    <option value="billing">{t("contactForm.subjects.billing")}</option>
                    <option value="other">{t("contactForm.subjects.other")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contactForm.message")}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  ></textarea>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 h-4 w-4 border border-gray-300 rounded text-kupari focus:ring-kupari"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    {t("contactForm.privacyConsent")}
                  </label>
                </div>
                <Button type="submit" size="lg" className="w-full bg-piki hover:bg-piki/90 text-white py-3">
                  {t("contactForm.submit")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-action section */}
      <section className="w-full bg-piki py-16 text-white relative">
        <div className="absolute inset-0 opacity-70">
          <Image
            src="/images/innofleet-car-background.png"
            alt={t("cta.backgroundAlt")}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-piki/40 z-10"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 font-['Inter_Tight']">{t("cta.title")}</h2>
            <p className="mb-8 text-lg text-white">{t("cta.description")}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                className="bg-kupari hover:bg-kupari/90 text-white px-8 py-3 text-lg"
                asChild
              >
                <Link href={`/${locale}/fleet-management`}>{t("cta.fleetButton")}</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-piki px-8 py-3 text-lg"
                asChild
              >
                <Link href={`/${locale}/leasing-solutions`}>{t("cta.leasingButton")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <PersonnelCard people={t.raw("personnel")} />
    </main>
  );
}
