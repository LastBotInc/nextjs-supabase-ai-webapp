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
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Table } from "@/app/components/v2/core/Table";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";

interface TermItem {
  term: string;
  description: string;
}

interface CaseItem {
  title: string;
  texts?: string[];
  image: { src: string; alt: string };
}

interface FaqItem {
  question: string;
  answer: string;
}

interface HeroData {
  heading: string;
  texts?: string[];
  image: { src: string; alt: string };
}

interface TermsData {
  heading: string;
  texts?: string[];
  list: TermItem[];
  image: { src: string; alt: string };
}

interface VehiclesData {
  heading: string;
  texts?: string[];
  table: {
    columns: string[];
    rows: string[][];
  };
}

interface BenefitsData {
  heading: string;
  texts?: string[];
  list: string[];
}

interface ExamplesData {
  heading: string;
  texts?: string[];
  cases: CaseItem[];
}

interface FaqData {
  heading: string;
  texts?: string[];
  questions: FaqItem[];
}

interface CtaData {
  heading: string;
  texts?: string[];
  link: { label: string; href: string };
  image: { src: string; alt: string };
}

interface AdditionalCtaData {
  calculator: {
    heading: string;
    text: string;
    buttonText: string;
  };
  carLeasing: {
    heading: string;
    text: string;
    buttonText: string;
  };
  contact: {
    heading: string;
    text: string;
    buttonText: string;
  };
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MachineLeasing" });
  const meta = t.raw("meta");
  return generateLocalizedMetadata({
    locale: params.locale,
    namespace: "MachineLeasing",
    title: meta.title,
    description: meta.description,
  });
}

export default async function MachineLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "MachineLeasing" });

  // Extract structured data
  const hero = t.raw("hero") as HeroData;
  const terms = t.raw("terms") as TermsData;
  const vehicles = t.raw("vehicles") as VehiclesData;
  const benefits = t.raw("benefits") as BenefitsData;
  const examples = t.raw("examples") as ExamplesData;
  const faq = t.raw("faq") as FaqData;
  const cta = t.raw("cta") as CtaData;
  const additionalCta = t.raw("additionalCta") as AdditionalCtaData;

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero isFirst fullWidth>
        <Hero.Image src={hero.image.src} backgroundPosition="bottom left" />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.Text>
          {hero.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </Hero.Text>
      </Hero>

      {/* Terms Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{terms.heading}</Heading2>
          {terms.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <List>
            {terms.list?.map((item: TermItem, idx: number) => (
              <List.Item key={idx}>
                <strong>{item.term}:</strong> {item.description}
              </List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage width="full" height="max" src={terms.image.src} className="self-end" />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* Vehicles Section */}
      <BasicLayout palette="betoni">
        <Heading2>{vehicles.heading}</Heading2>
        {vehicles.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Table headings={vehicles.table.columns} rows={vehicles.table.rows} />
      </BasicLayout>

      {/* Benefits Section */}
      <BasicLayout>
        <Heading2>{benefits.heading}</Heading2>
        {benefits.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <List>
          {benefits.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* Examples Section */}
      <FlexLayout palette="piki">
        <FlexLayout.Column>
          <Heading2>{examples.heading}</Heading2>
          {examples.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
      </FlexLayout>

      <BoxLayout maxColumns={2} fullSizeBoxes>
        {examples.cases?.map((caseItem: CaseItem, idx: number) => (
          <BoxLayout.Box key={idx}>
            <ImageContainer aspectRatio="16/9">
              <img
                src={caseItem.image.src}
                alt={caseItem.image.alt}
                className="w-full h-full object-cover"
              />
            </ImageContainer>
            <Heading3>{caseItem.title}</Heading3>
            {caseItem.texts?.map((text: string, textIdx: number) => (
              <Paragraph key={textIdx}>{text}</Paragraph>
            ))}
          </BoxLayout.Box>
        ))}
      </BoxLayout>

      {/* FAQ Section */}
      <BasicLayout palette="default">
        <Heading2>{faq.heading}</Heading2>
        {faq.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Accordion>
          {faq.questions?.map((item: FaqItem, idx: number) => (
            <Accordion.Item key={idx} heading={item.question}>
              <Paragraph>{item.answer}</Paragraph>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA Section */}
      <TwoColumnLayout
        palette="betoni"
        mainImage={{ src: cta.image.src, backgroundPosition: "top left" }}
      >
        <FlexLayout.Column className="shadow-text min-h-[400px] justify-center">
          <Heading2>{cta.heading}</Heading2>
          {cta.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          {cta.link && (
            <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>
          )}
        </FlexLayout.Column>
        <div></div>
      </TwoColumnLayout>

      {/* Additional CTA Sections */}
      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <Heading2>{additionalCta.calculator.heading}</Heading2>
          <Paragraph>{additionalCta.calculator.text}</Paragraph>
          <LinkButton href="/autoetulaskuri">{additionalCta.calculator.buttonText}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Heading2>{additionalCta.carLeasing.heading}</Heading2>
          <Paragraph>{additionalCta.carLeasing.text}</Paragraph>
          <LinkButton href="/autoleasing">{additionalCta.carLeasing.buttonText}</LinkButton>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Contact CTA */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{additionalCta.contact.heading}</Heading2>
        <Paragraph>{additionalCta.contact.text}</Paragraph>
        <LinkButton href="/yhteystiedot">{additionalCta.contact.buttonText}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
