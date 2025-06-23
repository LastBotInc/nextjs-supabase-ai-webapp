"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale: params.locale,
    namespace: "Faq",
    path: "/ukk",
  });
}

export default async function FaqPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const tFaq = await getTranslations({ locale, namespace: "Faq" });

  // Import FAQ sections from different services
  const tCarLeasing = await getTranslations({ locale, namespace: "CarLeasing" });
  const tLeasingCalculator = await getTranslations({ locale, namespace: "LeasingCalculator" });
  const tCustomerService = await getTranslations({ locale, namespace: "CustomerService" });
  const tDigitalServices = await getTranslations({ locale, namespace: "DigitalServices" });
  const tServicePrices = await getTranslations({ locale, namespace: "ServicePrices" });
  const tMachineLeasing = await getTranslations({ locale, namespace: "MachineLeasing" });
  const tFinancialSolutions = await getTranslations({ locale, namespace: "FinancialSolutions" });
  const tLeasingSolutions = await getTranslations({ locale, namespace: "LeasingSolutions" });
  const tDriversGuide = await getTranslations({ locale, namespace: "DriversGuide" });

  // Extract structured data
  const hero = tFaq.raw("hero");
  const sections = tFaq.raw("sections");
  const contact = tFaq.raw("contact");

  // Extract FAQ data from each service
  const faqSections = [
    {
      ...sections.carLeasing,
      faq: tCarLeasing.raw("faq"),
    },
    {
      ...sections.leasingCalculator,
      faq: tLeasingCalculator.raw("faq"),
    },
    {
      ...sections.customerService,
      faq: tCustomerService.raw("contactForm.faq"),
    },
    {
      ...sections.digitalServices,
      faq: tDigitalServices.raw("faq"),
    },
    {
      ...sections.servicePrice,
      faq: tServicePrices.raw("faq"),
    },
    {
      ...sections.machineLeasing,
      faq: tMachineLeasing.raw("faq"),
    },
    {
      ...sections.financialSolutions,
      faq: tFinancialSolutions.raw("faq"),
    },
    {
      ...sections.leasingSolutions,
      faq: tLeasingSolutions.raw("faq"),
    },
    {
      ...sections.driversGuide,
      faq: tDriversGuide.raw("faq"),
    },
  ];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero isFirst>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.Text>
          {hero.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </Hero.Text>
      </Hero>

      {/* FAQ Sections */}
      {faqSections.map((section, sectionIdx) => {
        // Only render if FAQ exists and has questions
        if (!section.faq?.questions || section.faq.questions.length === 0) {
          return null;
        }

        return (
          <BasicLayout key={sectionIdx} contentPalette={sectionIdx % 2 === 0 ? "default" : "beige"}>
            <Heading2>{section.heading}</Heading2>
            <Paragraph>{section.description}</Paragraph>

            <Accordion>
              {section.faq.questions?.map((item: { question: string; answer: string }, idx: number) => (
                <Accordion.Item key={idx} heading={item.question}>
                  <Paragraph>{item.answer}</Paragraph>
                </Accordion.Item>
              ))}
            </Accordion>
          </BasicLayout>
        );
      })}

      {/* Contact Section */}
      <BasicLayout contentPalette="piki">
        <Heading2>{contact.heading}</Heading2>
        {contact.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <Card palette="beige">
          <Heading3>Yhteystiedot</Heading3>
          <Paragraph>
            <strong>Puhelin:</strong> {contact.phone}
          </Paragraph>
          <Paragraph>
            <strong>Sähköposti:</strong> {contact.email}
          </Paragraph>
          <Paragraph>
            <strong>Aukioloajat:</strong> {contact.hours}
          </Paragraph>
          {contact.link && <LinkButton href={contact.link.href}>{contact.link.label}</LinkButton>}
        </Card>
      </BasicLayout>
    </PageWrapper>
  );
}
