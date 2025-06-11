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

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarRental" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/auton-vuokraus`,
    },
  };
}

export default async function CarRentalPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CarRental" });

  // Hero section
  const heroTitle = t("hero.title");
  const heroDescription = t("hero.description");

  // Benefits and examples lists
  const benefitsTitle = t("benefits.title");
  const benefitsList: string[] = t.raw("benefits.list");
  const examplesTitle = t("examples.title");
  const examplesList: string[] = t.raw("examples.list");

  // CTA section
  const ctaTitle = t("cta.title");
  const ctaDescription = t("cta.description");
  const ctaButton = t("cta.button");

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero>
        <Hero.Image src={`/images/yritysleasing.png`} backgroundSize="cover" backgroundPosition="center" />
        <Hero.Heading>{heroTitle}</Hero.Heading>
        <Hero.Text>{heroDescription}</Hero.Text>
      </Hero>

      {/* Intro Paragraph */}
      <BasicLayout>
        <Paragraph>{t("intro")}</Paragraph>
      </BasicLayout>

      {/* Benefits Section with TwoColumnLayout and image placeholder */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{benefitsTitle}</Heading2>
          <List className="mt-4">
            {benefitsList.map((item, idx) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        {/* Image placeholder using ImageContainer with an <img> */}
        <ImageContainer aspectRatio="4/3" className="rounded-xl shadow-lg">
          <img src="/images/autonvuokraus.png" alt="Auton vuokraus" className="object-cover w-full h-full rounded-xl" />
        </ImageContainer>
      </TwoColumnLayout>

      {/* Examples Section with TwoColumnLayout and image placeholder (reversed order) */}
      <TwoColumnLayout>
        {/* Image placeholder using ImageContainer with an <img> */}
        <ImageContainer aspectRatio="4/3" className="rounded-xl shadow-lg">
          <img src="/images/yritysleasing.png" alt="Yritysleasing" className="object-cover w-full h-full rounded-xl" />
        </ImageContainer>
        <div>
          <Heading3>{examplesTitle}</Heading3>
          <List className="mt-4">
            {examplesList.map((item, idx) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </div>
      </TwoColumnLayout>

      {/* Minileasing Section */}
      <BasicLayout>
        <Heading2>{t("minileasing.title")}</Heading2>
        <Paragraph>{t("minileasing.description")}</Paragraph>
        <List>
          {t.raw("minileasing.list").map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
        <Heading3>{t("minileasing.examplesTitle")}</Heading3>
        <List>
          {t.raw("minileasing.examples").map((item, idx) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
        <Paragraph>{t("minileasing.contactCta")}</Paragraph>
      </BasicLayout>

      {/* CTA Section */}
      <BasicLayout palette="piki">
        <Heading2>{ctaTitle}</Heading2>
        <Paragraph className="mt-2 mb-6">{ctaDescription}</Paragraph>
        <LinkButton href={`/${locale}/yhteydenotto`}>{ctaButton}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
