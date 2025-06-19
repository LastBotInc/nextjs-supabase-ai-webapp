"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { generateLocalizedMetadata } from "@/utils/metadata";

import { CallUs } from "@/app/components/v2/components/CallUs";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import React from "react";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";
import { List } from "@/app/components/v2/core/List";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Flex } from "@/app/components/v2/core/Flex";
import { Table } from "@/app/components/v2/core/Table";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Padding } from "@/app/components/v2/core/types";
import { LinkButton } from "@/app/components/v2/core/LinkButton";

interface TranslationFunction {
  (key: string): string;
  raw: (key: string) => unknown;
}

interface HeroData {
  heading: string;
  subheading: string;
  texts?: string[];
  numbers: Array<{ title: string; number: string }>;
  image: { src: string; alt: string };
}

interface SectionData {
  heading: string;
  texts?: string[];
}

interface BenefitsData {
  heading: string;
  list?: string[];
}

interface LeasingCard {
  title: string;
  texts?: string[];
  benefits?: string[];
  perfectFor?: string[];
  summary?: string;
  palette: string;
}

interface LeasingTypesData {
  heading: string;
  cards?: LeasingCard[];
}

interface EquipmentLeasingData {
  heading: string;
  texts?: string[];
  benefits?: string[];
  b2bSection: {
    heading: string;
    texts?: string[];
  };
}

interface ContactCtaData {
  heading: string;
  subheading: string;
  numbers: Array<{ title: string; number: string }>;
  image: { src: string; alt: string };
}

interface CtaData {
  heading: string;
  texts?: string[];
  link: { label: string; href: string };
}

interface AdditionalCtaData {
  calculator: {
    heading: string;
    text: string;
    buttonText: string;
  };
  rental: {
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

function LeasingComparisonTable({ t }: { t: TranslationFunction }) {
  const tableData = t.raw("comparisonTable.table") as {
    headings: string[];
    rows: string[][];
    explanations?: string[];
  };
  return (
    <Table
      headings={tableData.headings}
      rows={tableData.rows}
      explanations={tableData.explanations}
    />
  );
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const meta = t.raw("meta");
  return generateLocalizedMetadata({
    locale: params.locale,
    namespace: "CorporateLeasing",
    title: meta.title,
    description: meta.description,
    path: "/about",
  });
}

export default async function CorporateLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CorporateLeasing" });

  // Extract structured data with proper types
  const hero = t.raw("hero") as HeroData;
  const ourModel = t.raw("ourModel") as SectionData;
  const personalService = t.raw("personalService") as SectionData;
  const digitalServices = t.raw("digitalServices") as SectionData;
  const benefits = t.raw("benefits") as BenefitsData;
  const leasingTypes = t.raw("leasingTypes") as LeasingTypesData;
  const equipmentLeasing = t.raw("equipmentLeasing") as EquipmentLeasingData;
  const contactCta = t.raw("contactCta") as ContactCtaData;
  const cta = t.raw("cta") as CtaData;
  const additionalCta = t.raw("additionalCta") as AdditionalCtaData;

  return (
    <PageWrapper>
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
        <Hero.Text>
          {hero.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx} variant="large">{text}</Paragraph>
          ))}
        </Hero.Text>
        <Hero.ExtraContent>
          <CallUs numbers={hero.numbers} />
        </Hero.ExtraContent>
      </Hero>

      {/* Intro Section */}
      <FlexLayout oneColumnBreakpoint="lg" palette="default" className="with-overflowing-image">
        <FlexLayout.Column>
          <Heading2>{ourModel.heading}</Heading2>
          {ourModel.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}

          <Heading2>{personalService.heading}</Heading2>
          {personalService.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}

          <Heading2>{digitalServices.heading}</Heading2>
          {digitalServices.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}

          <Heading2>{benefits.heading}</Heading2>
          <List>
            {benefits.list?.map((item: string, idx: number) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage
            width="large"
            height="overflow-paddings"
            src="/images/cropped_demo.png"
            useMask
            className="self-end"
          />
        </FlexLayout.Column>
      </FlexLayout>

      {/* Leasing Types Section */}
      <BoxLayout palette="light-gray" fullSizeBoxes={true}>
        {leasingTypes.cards?.map((card: LeasingCard, idx: number) => (
          <BoxLayout.Box key={idx} gaps>
            <Heading3>{card.title}</Heading3>
            {card.texts?.map((text: string, textIdx: number) => (
              <Paragraph key={textIdx} className={textIdx === card.texts!.length - 1 ? "font-semibold" : ""}>
                {text}
              </Paragraph>
            ))}
            {card.benefits && (
              <List>
                {card.benefits.map((benefit: string, benefitIdx: number) => (
                  <List.Item key={benefitIdx}>{benefit}</List.Item>
                ))}
              </List>
            )}
            {card.perfectFor && (
              <>
                <Paragraph className="font-semibold">{t("labels.perfectFor")}</Paragraph>
                <List>
                  {card.perfectFor.map((item: string, itemIdx: number) => (
                    <List.Item key={itemIdx}>{item}</List.Item>
                  ))}
                </List>
              </>
            )}
            {card.summary && (
              <Paragraph className="font-semibold">{card.summary}</Paragraph>
            )}
          </BoxLayout.Box>
        ))}
      </BoxLayout>

      {/* Comparison Table */}
      <BasicLayout palette="default" padding={Padding.None} contentPadding={Padding.Block}>
        <FlexLayout.Column>
          <Heading2>{t("comparisonTable.heading")}</Heading2>
          <LeasingComparisonTable t={t} />
        </FlexLayout.Column>
      </BasicLayout>

      {/* Equipment Leasing Section */}
      <FlexLayout palette="piki">
        <FlexLayout.Column>
          <Heading2 className="color-kupari-heading">{equipmentLeasing.heading}</Heading2>
          {equipmentLeasing.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <List>
            {equipmentLeasing.benefits?.map((benefit: string, idx: number) => (
              <List.Item key={idx}>{benefit}</List.Item>
            ))}
          </List>
          
          <Heading3 className="color-kupari-heading">{equipmentLeasing.b2bSection.heading}</Heading3>
          {equipmentLeasing.b2bSection.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx} className={idx === equipmentLeasing.b2bSection.texts!.length - 1 ? "font-semibold" : ""}>
              {text}
            </Paragraph>
          ))}
        </FlexLayout.Column>
      </FlexLayout>

      {/* Contact CTA */}
      <FlexLayout palette="piki" mainImage={{ src: contactCta.image.src, backgroundPosition: "top center" }}>
        <FlexLayout.Column className="shadow-text-sharp">
          <Flex direction="column" gaps="large">
            <Heading2 className="max-w-2xl">{contactCta.heading}</Heading2>
            <Heading3 className="max-w-2xl">{contactCta.subheading}</Heading3>
            <div className="self-start">
              <CallUs className="justify-self-start" numbers={contactCta.numbers} />
            </div>
          </Flex>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Main CTA SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && (
          <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>
        )}
      </BasicLayout>

      {/* ADDITIONAL CTA SECTIONS */}
      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <Heading2>{additionalCta.calculator.heading}</Heading2>
          <Paragraph>{additionalCta.calculator.text}</Paragraph>
          <LinkButton href="/autoetulaskuri">{additionalCta.calculator.buttonText}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Heading2>{additionalCta.rental.heading}</Heading2>
          <Paragraph>{additionalCta.rental.text}</Paragraph>
          <LinkButton href="/auton-vuokraus">{additionalCta.rental.buttonText}</LinkButton>
        </FlexLayout.Column>
      </FlexLayout>

      {/* CONTACT CTA */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{additionalCta.contact.heading}</Heading2>
        <Paragraph>{additionalCta.contact.text}</Paragraph>
        <LinkButton href="/yhteystiedot">{additionalCta.contact.buttonText}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
