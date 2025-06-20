"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
interface Props {
  params: Promise<{
    locale: string;
  }>;
}

// TypeScript interfaces for the structured data
interface MetaData {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

interface ImageObject {
  src: string;
  alt: string;
}

interface LinkObject {
  label: string;
  href: string;
}

interface HeroSection {
  heading: string;
  texts: string[];
  image: ImageObject;
}

interface BenefitsSection {
  heading: string;
  texts: string[];
  list: string[];
  image: ImageObject;
}

interface ExamplesSection {
  heading: string;
  texts: string[];
  list: string[];
  image: ImageObject;
}

interface UseCases {
  heading: string;
  list: string[];
}

interface MinileasingSection {
  heading: string;
  texts: string[];
  benefits: string[];
  useCases: UseCases;
  cta: string;
}

interface CtaSection {
  heading: string;
  texts: string[];
  link: LinkObject;
}

interface AdditionalCtaItem {
  heading: string;
  text: string;
  buttonText: string;
}

interface AdditionalCta {
  leasing: AdditionalCtaItem;
  calculator: AdditionalCtaItem;
  contact: AdditionalCtaItem;
}

// interface CarRentalData {
//   meta: MetaData;
//   hero: HeroSection;
//   benefits: BenefitsSection;
//   examples: ExamplesSection;
//   minileasing: MinileasingSection;
//   cta: CtaSection;
//   additionalCta: AdditionalCta;
// }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarRental" });
  const meta = t.raw('meta') as MetaData;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/${locale}/auton-vuokraus`,
    },
  };
}

export default async function CarRentalPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CarRental" });

  // Extract structured data using specific keys
  const hero = t.raw('hero') as HeroSection;
  const benefits = t.raw('benefits') as BenefitsSection;
  const examples = t.raw('examples') as ExamplesSection;
  const minileasing = t.raw('minileasing') as MinileasingSection;
  const cta = t.raw('cta') as CtaSection;
  const additionalCta = t.raw('additionalCta') as AdditionalCta;

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero>
        <Hero.Image src={hero.image.src} backgroundSize="cover" backgroundPosition="center" />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        {hero.texts.map((text, index) => (
          <Hero.Text key={index}>{text}</Hero.Text>
        ))}
      </Hero>

      {/* Benefits Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{benefits.heading}</Heading2>
          {benefits.texts.map((text, index) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
          <List className="mt-4">
            {benefits.list.map((item, idx) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <ImageContainer aspectRatio="4/3" className="rounded-xl shadow-lg">
          <img src={benefits.image.src} alt={benefits.image.alt} className="object-cover w-full h-full rounded-xl" />
        </ImageContainer>
      </TwoColumnLayout>

      {/* Examples Section */}
      <TwoColumnLayout>
        <ImageContainer aspectRatio="4/3" className="rounded-xl shadow-lg">
          <img src={examples.image.src} alt={examples.image.alt} className="object-cover w-full h-full rounded-xl" />
        </ImageContainer>
        <div>
          <Heading3>{examples.heading}</Heading3>
          {examples.texts.map((text, index) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
          <List className="mt-4">
            {examples.list.map((item, idx) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </div>
      </TwoColumnLayout>

      {/* Minileasing Section */}
      <BasicLayout>
        <Heading2>{minileasing.heading}</Heading2>
        {minileasing.texts.map((text, index) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
        <List>
          {minileasing.benefits.map((item, idx) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
        <Heading3>{minileasing.useCases.heading}</Heading3>
        <List>
          {minileasing.useCases.list.map((item, idx) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
        <Paragraph>{minileasing.cta}</Paragraph>
      </BasicLayout>

      {/* Main CTA Section */}
      <BasicLayout palette="piki">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts.map((text, index) => (
          <Paragraph key={index} className="mt-2 mb-6">{text}</Paragraph>
        ))}
        <LinkButton href={`/${locale}${cta.link.href}`}>{cta.link.label}</LinkButton>
      </BasicLayout>

      {/* Additional CTA Sections */}
      <TwoColumnLayout>
        <BasicLayout palette="beige">
          <Heading3>{additionalCta.leasing.heading}</Heading3>
          <Paragraph>{additionalCta.leasing.text}</Paragraph>
          <LinkButton href={`/${locale}/autoleasing`} className="mt-4">
            {additionalCta.leasing.buttonText}
          </LinkButton>
        </BasicLayout>
        <BasicLayout palette="beige">
          <Heading3>{additionalCta.calculator.heading}</Heading3>
          <Paragraph>{additionalCta.calculator.text}</Paragraph>
          <LinkButton href={`/${locale}/autoetulaskuri`} className="mt-4">
            {additionalCta.calculator.buttonText}
          </LinkButton>
        </BasicLayout>
      </TwoColumnLayout>

      {/* Expert Contact CTA */}
      <BasicLayout palette="kupari">
        <Heading2>{additionalCta.contact.heading}</Heading2>
        <Paragraph className="mb-6">{additionalCta.contact.text}</Paragraph>
        <LinkButton href={`/${locale}/yhteystiedot`}>
          {additionalCta.contact.buttonText}
        </LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
