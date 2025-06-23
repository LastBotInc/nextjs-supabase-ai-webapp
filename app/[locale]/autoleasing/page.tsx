"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Flex } from "@/app/components/v2/core/Flex";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import LeasingCalculator from "@/app/components/v2/components/LeasingCalculator";

interface HeroData {
  heading: string;
  texts?: string[];
  image: { src: string; alt: string };
}

interface CalculatorData {
  heading: string;
  texts?: string[];
  fields: Record<string, string>;
}

interface LeasingCard {
  title: string;
  texts?: string[];
  palette: string;
}

interface LeasingOptionsData {
  heading: string;
  cards?: LeasingCard[];
}

interface BenefitsData {
  heading: string;
  list?: string[];
}

interface ExamplesData {
  heading: string;
  list?: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqData {
  heading: string;
  questions?: FaqItem[];
}

interface CtaData {
  heading: string;
  texts?: string[];
  link?: { label: string; href: string };
}

interface AdditionalCtaData {
  calculator: {
    heading: string;
    text: string;
    buttonText: string;
    href: string;
  };
  corporate: {
    heading: string;
    text: string;
    buttonText: string;
    href: string;
  };
  contact: {
    heading: string;
    text: string;
    buttonText: string;
    href: string;
  };
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const meta = t.raw("meta");
  return generateLocalizedMetadata({
    locale: params.locale,
    namespace: "CarLeasing",
    title: meta.title,
    description: meta.description,
  });
}

export default async function CarLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CarLeasing" });

  // Extract structured data
  const hero = t.raw("hero") as HeroData;
  const calculator = t.raw("calculator") as CalculatorData;
  const leasingOptions = t.raw("leasingOptions") as LeasingOptionsData;
  const benefits = t.raw("benefits") as BenefitsData;
  const examples = t.raw("examples") as ExamplesData;
  const faq = t.raw("faq") as FaqData;
  const cta = t.raw("cta") as CtaData;
  const additionalCta = t.raw("additionalCta") as AdditionalCtaData;

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

      {/* Leasing Calculator Section */}
      <FlexLayout palette="default" direction="column">
        <FlexLayout.Column>
          <Heading2>{calculator.heading}</Heading2>
          {calculator.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <LeasingCalculator texts={calculator.fields} />
        </FlexLayout.Column>
      </FlexLayout>

      {/* Leasing Options Sections */}
      <BoxLayout maxColumns={2} fullSizeBoxes>
        {leasingOptions.cards?.map((card: LeasingCard, idx: number) => (
          <BoxLayout.Box key={idx} palette={card.palette as "maantie" | "kupari" | "piki" | "default"}>
            <Flex direction="column">
              <Heading3>{card.title}</Heading3>
              {card.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx}>{text}</Paragraph>
              ))}
            </Flex>
          </BoxLayout.Box>
        ))}
      </BoxLayout>

      {/* Benefits and Examples Sections */}
      <BoxLayout maxColumns={2} fullSizeBoxes>
        <BoxLayout.Box palette="default">
          <Flex direction="column">
            <Heading3>{benefits.heading}</Heading3>
            <List>
              {benefits.list?.map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Flex>
        </BoxLayout.Box>
        <BoxLayout.Box palette="default">
          <Flex direction="column">
            <Heading3>{examples.heading}</Heading3>
            <List>
              {examples.list?.map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Flex>
        </BoxLayout.Box>
      </BoxLayout>

      {/* FAQ Section */}
      <FlexLayout palette="default" direction="column">
        <FlexLayout.Column>
          <Heading2>{faq.heading}</Heading2>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Accordion>
            {faq.questions?.map((item: FaqItem, idx: number) => (
              <Accordion.Item key={idx} heading={item.question}>
                <Paragraph>{item.answer}</Paragraph>
              </Accordion.Item>
            ))}
          </Accordion>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Main CTA Section */}
      <FlexLayout palette="piki">
        <FlexLayout.Column>
          <Flex direction="column">
            <Heading2>{cta.heading}</Heading2>
            {cta.texts?.map((text: string, idx: number) => (
              <Paragraph key={idx}>{text}</Paragraph>
            ))}
            {cta.link && <LinkButton href={`/${locale}${cta.link.href}`}>{cta.link.label}</LinkButton>}
          </Flex>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Additional CTA Sections */}
      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <Heading2>{additionalCta.calculator.heading}</Heading2>
          <Paragraph>{additionalCta.calculator.text}</Paragraph>
          <LinkButton href={additionalCta.calculator.href}>{additionalCta.calculator.buttonText}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Heading2>{additionalCta.corporate.heading}</Heading2>
          <Paragraph>{additionalCta.corporate.text}</Paragraph>
          <LinkButton href={additionalCta.corporate.href}>{additionalCta.corporate.buttonText}</LinkButton>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Contact CTA */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{additionalCta.contact.heading}</Heading2>
        <Paragraph>{additionalCta.contact.text}</Paragraph>
        <LinkButton href={additionalCta.contact.href}>{additionalCta.contact.buttonText}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
