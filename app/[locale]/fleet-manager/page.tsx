"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { Heading2 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { CallUs } from "../../components/v2/components/CallUs";
import Image from "next/image";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { List } from "@/app/components/v2/core/List";
import { Padding } from "@/app/components/v2/core/types";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Card } from "@/app/components/v2/core/Card";
import { Flex } from "@/app/components/v2/core/Flex";

// TypeScript interfaces for the structured data
interface MetaData {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

interface HeroData {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
  numbers: Array<{ number: string; title: string }>;
}

interface MainViewData {
  heading: string;
  texts: string[];
  features: string[];
  image: { src: string; alt: string };
}

interface SummaryData {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
}

interface BenefitsData {
  heading: string;
  texts: string[];
  items: string[];
  image: { src: string; alt: string };
}

interface AllInOneData {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
}

interface CtaData {
  heading: string;
  texts: string[];
  link: { label: string; href: string };
}

interface AdditionalCtaData {
  leasing: {
    heading: string;
    text: string;
    buttonText: string;
    buttonHref: string;
  };
  contact: {
    heading: string;
    text: string;
    buttonText: string;
    buttonHref: string;
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FleetManager" });
  const meta = t.raw("meta") as MetaData;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{ url: meta.image }],
    },
  };
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function FleetManagerPage({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "FleetManager" });

  // Extract structured data
  const hero = t.raw("hero") as HeroData;
  const mainView = t.raw("mainView") as MainViewData;
  const summary = t.raw("summary") as SummaryData;
  const benefits = t.raw("benefits") as BenefitsData;
  const allInOne = t.raw("allInOne") as AllInOneData;
  const cta = t.raw("cta") as CtaData;
  const additionalCta = t.raw("additionalCta") as AdditionalCtaData;

  return (
    <PageWrapper>
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        {hero.texts?.map((text: string, idx: number) => (
          <Hero.Text key={idx}>{text}</Hero.Text>
        ))}
        <Hero.ExtraContent>
          <CallUs numbers={hero.numbers} />
        </Hero.ExtraContent>
      </Hero>

      <FlexLayout
        padding={Padding.Block}
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="default"
        contentClassName="rounded-box"
      >
        <FlexLayout.Column>
          <Heading2>{mainView.heading}</Heading2>
          {mainView.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <List className="palette-text-color">
            {mainView.features?.map((feature: string) => (
              <List.Item key={feature}>{feature}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="beige"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <Heading2>{summary.heading}</Heading2>
          {summary.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
      </FlexLayout>

      {/* Benefits Section */}
      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="light-gray"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <Heading2>{benefits.heading}</Heading2>
          {benefits.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <List className="palette-text-color">
            {benefits.items?.map((item: string) => (
              <List.Item key={item}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="kupari"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <div className="relative space-y-8">
            <Heading2 className="text-piki">{allInOne.heading}</Heading2>
            {allInOne.texts?.map((text: string, idx: number) => (
              <Paragraph key={idx} className="text-piki">
                {text}
              </Paragraph>
            ))}
          </div>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer>
            <Image
              src={"/images/home/iphone_05_sleep_image.png"}
              alt={allInOne.image.alt}
              width={566}
              height={727}
              layout="responsive"
              className="object-cover rounded-xl"
              sizes="100vw"
              quality={90}
            />
          </ImageContainer>
        </FlexLayout.Column>
      </FlexLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
      </BasicLayout>

      {/* Additional CTA Section */}
      <BasicLayout contentPalette="beige">
        <Flex direction="row" gaps="large">
          <Card palette="default">
            <Heading2>{additionalCta.leasing.heading}</Heading2>
            <Paragraph>{additionalCta.leasing.text}</Paragraph>
            <LinkButton href={`/${locale}${additionalCta.leasing.buttonHref}`}>
              {additionalCta.leasing.buttonText}
            </LinkButton>
          </Card>
          <Card palette="default">
            <Heading2>{additionalCta.contact.heading}</Heading2>
            <Paragraph>{additionalCta.contact.text}</Paragraph>
            <LinkButton href={`/${locale}${additionalCta.contact.buttonHref}`}>
              {additionalCta.contact.buttonText}
            </LinkButton>
          </Card>
        </Flex>
      </BasicLayout>
    </PageWrapper>
  );
}
