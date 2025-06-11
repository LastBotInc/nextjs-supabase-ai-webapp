"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Button } from "@/app/components/v2/core/Button";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { GridLayout } from "@/app/components/v2/layouts/GridLayout";
import { Heading2, Heading3, Heading3Small } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { ImagePlaceholder } from "@/app/components/v2/components/ImagePlaceholder";
import { Flex } from "@/app/components/v2/core/Flex";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
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
    <PageWrapper>
      {/* Hero Section */}
      <Hero fullWidth isFirst>
        <Hero.Image src="/images/Tietoa_meista.png" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.Text> </Hero.Text>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      {/* Introduction & Quick Help */}
      <TwoColumnLayout>
        {/* Left: Introduction */}
        <FlexLayout.Column>
          <Heading2>{t("intro.title")}</Heading2>
          <Paragraph>{t("intro.paragraph1")}</Paragraph>
          <Paragraph>{t("intro.paragraph2")}</Paragraph>
        </FlexLayout.Column>
        {/* Right: Quick Help */}
        <Card palette="beige">
          <Heading3>{t("quickHelp.title")}</Heading3>
          <Paragraph>
            {t("quickHelp.phone")}
            <br />
            {t("quickHelp.email")}
            <br />
            {t("quickHelp.hours")}
          </Paragraph>
          <LinkButton href="#contact-form">{t("quickHelp.contactButton")}</LinkButton>
        </Card>
      </TwoColumnLayout>

      {/* Support Categories */}
      <GridLayout columns={{ default: 1, md: 2, lg: 4 }} palette="light-gray">
        {supportCategories.map((category, index) => (
          <Card key={index} gaps="small">
            <ImagePlaceholder aspectRatio="4:3" />
            <Heading3>{category.title}</Heading3>
            <Paragraph>{category.description}</Paragraph>
            <LinkButton href="#">{t("supportCategories.learnMore")}</LinkButton>
          </Card>
        ))}
      </GridLayout>

      {/* Offices section */}
      <GridLayout columns={{ default: 1, md: 3 }} palette="beige">
        {contactOffices.map((office, index) => (
          <Card key={index} gaps="small">
            <Heading3>{office.name}</Heading3>
            <Paragraph>{office.address}</Paragraph>
            <Paragraph>{office.phone}</Paragraph>
            <Paragraph>{office.email}</Paragraph>
            <Paragraph>{office.hours}</Paragraph>
            <LinkButton href={`https://maps.google.com/?q=${office.name} ${office.address}`} target="_blank">
              {t("offices.viewMap")}
            </LinkButton>
          </Card>
        ))}
      </GridLayout>

      {/* Contact form and FAQ */}
      <FlexLayout palette="light-gray" direction="column">
        {/* Left: FAQ */}
        <FlexLayout.Column>
          <Flex direction="row">
            <FlexLayout.Column>
              <Heading2>{t("contactForm.title")}</Heading2>
              <Paragraph>{t("contactForm.description")}</Paragraph>
              <FlexLayout.Column>
                {[1, 2, 3].map((i) => (
                  <Flex direction="column" gaps="small" key={i}>
                    <Heading3Small>{t(`contactForm.faq.question${i}`)}</Heading3Small>
                    <Paragraph>{t(`contactForm.faq.answer${i}`)}</Paragraph>
                  </Flex>
                ))}
              </FlexLayout.Column>
            </FlexLayout.Column>

            <FlexLayout.Column>
              <Heading3>{t("contactForm.formTitle")}</Heading3>
              {/* The form can be further refactored to use v2/core components for inputs if available */}
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
                <Button>{t("contactForm.submit")}</Button>
              </form>
            </FlexLayout.Column>
          </Flex>
        </FlexLayout.Column>

        {/* Right: Contact Form */}
      </FlexLayout>

      {/* Call-to-action section */}
      <Hero fullWidth className="bg-piki text-white relative">
        <Hero.Image src="/images/innofleet-car-background.png" />
        <Hero.Heading>{t("cta.title")}</Hero.Heading>
        <Hero.Text>
          <Flex direction="column" gaps="small">
            {t("cta.description")}
            <LinkButton href={`/${locale}/fleet-management`}>{t("cta.fleetButton")}</LinkButton>
            <LinkButton href={`/${locale}/leasing-solutions`}>{t("cta.leasingButton")}</LinkButton>
          </Flex>
        </Hero.Text>
      </Hero>
    </PageWrapper>
  );
}
