"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { Table } from "@/app/components/v2/core/Table";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { Card } from "@/app/components/v2/core/Card";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import { Flex } from "@/app/components/v2/core/Flex";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ServicePrices.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "ServicePrices",
    path: "/palveluhinnasto",
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "ServicePrices" });

  // Get data for each section
  const section1 = t.raw("section1") as { heading: string; texts: string[]; image: { src: string; alt: string } };
  const section2 = t.raw("section2") as {
    heading: string;
    texts: string[];
    list: Array<{ term: string; description: string }>;
    image: { src: string; alt: string };
  };
  const section3 = t.raw("section3") as {
    heading: string;
    texts: string[];
    table: { columns: string[]; rows: string[][] };
  };
  const section4 = t.raw("section4") as { heading: string; texts: string[]; list: string[] };
  const section5 = t.raw("section5") as {
    heading: string;
    texts: string[];
    cases: Array<{ title: string; texts: string[]; image: { src: string; alt: string } }>;
  };
  const faq = t.raw("faq") as {
    heading: string;
    texts: string[];
    questions: Array<{ question: string; answer: string }>;
  };
  const cta = t.raw("cta") as {
    heading: string;
    texts: string[];
    link: { label: string; href: string };
    image: { src: string; alt: string };
  };
  const additionalCta = t.raw("additionalCta") as {
    calculator: { heading: string; text: string; buttonText: string; buttonHref: string };
    carLeasing: { heading: string; text: string; buttonText: string; buttonHref: string };
    contact: { heading: string; text: string; buttonText: string; buttonHref: string };
  };

  return (
    <PageWrapper>
      {/* SECTION 1 - Introduction */}
      <TwoColumnLayout contentPalette="default">
        <FlexLayout.Column>
          <Heading2>{section1.heading}</Heading2>
          {section1.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="16/9">
            <Image
              src={section1.image.src}
              alt={section1.image.alt}
              width={500}
              height={300}
              className="object-cover w-full h-full rounded-lg"
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* SECTION 2 - Setup Costs */}
      <TwoColumnLayout contentPalette="beige">
        <FlexLayout.Column>
          <Heading2>{section2.heading}</Heading2>
          {section2.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <List>
            {section2.list?.map((item: { term: string; description: string }, idx: number) => (
              <List.Item key={idx}>
                <strong>{item.term}:</strong> {item.description}
              </List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="16/9">
            <Image
              src={section2.image.src}
              alt={section2.image.alt}
              width={500}
              height={300}
              className="object-cover w-full h-full rounded-lg"
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* SECTION 3 - Monthly Rates Table */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{section3.heading}</Heading2>
        {section3.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Table headings={section3.table?.columns || []} rows={section3.table?.rows || []} />
      </BasicLayout>

      {/* SECTION 4 - Additional Services */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{section4.heading}</Heading2>
        {section4.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <List>
          {section4.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* SECTION 5 - Customer Cases */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{section5.heading}</Heading2>
        {section5.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Flex direction="row" gaps="large">
          {section5.cases?.map(
            (caseItem: { title: string; texts: string[]; image: { src: string; alt: string } }, idx: number) => (
              <Card key={idx} palette="beige">
                <ImageContainer aspectRatio="16/9">
                  <Image
                    src={caseItem.image.src}
                    alt={caseItem.image.alt}
                    width={400}
                    height={250}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </ImageContainer>
                <Heading3>{caseItem.title}</Heading3>
                {caseItem.texts?.map((text: string, textIdx: number) => (
                  <Paragraph key={textIdx}>{text}</Paragraph>
                ))}
              </Card>
            )
          )}
        </Flex>
      </BasicLayout>

      {/* FAQ SECTION */}
      <BasicLayout contentPalette="default">
        <Heading2>{faq.heading}</Heading2>
        {faq.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Accordion>
          {faq.questions?.map((item: { question: string; answer: string }, idx: number) => (
            <Accordion.Item key={idx} heading={item.question}>
              <Paragraph>{item.answer}</Paragraph>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA SECTION */}
      <TwoColumnLayout contentPalette="piki">
        <FlexLayout.Column>
          <Heading2>{cta.heading}</Heading2>
          {cta.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="16/9">
            <Image
              src={cta.image.src}
              alt={cta.image.alt}
              width={500}
              height={300}
              className="object-cover w-full h-full rounded-lg"
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* ADDITIONAL CTA SECTIONS */}
      <BasicLayout contentPalette="kupari">
        <Flex direction="row" gaps="large">
          <Card palette="default">
            <Heading3>{additionalCta.calculator.heading}</Heading3>
            <Paragraph>{additionalCta.calculator.text}</Paragraph>
            <LinkButton href={additionalCta.calculator.buttonHref}>{additionalCta.calculator.buttonText}</LinkButton>
          </Card>
          <Card palette="default">
            <Heading3>{additionalCta.carLeasing.heading}</Heading3>
            <Paragraph>{additionalCta.carLeasing.text}</Paragraph>
            <LinkButton href={additionalCta.carLeasing.buttonHref}>{additionalCta.carLeasing.buttonText}</LinkButton>
          </Card>
          <Card palette="default">
            <Heading3>{additionalCta.contact.heading}</Heading3>
            <Paragraph>{additionalCta.contact.text}</Paragraph>
            <LinkButton href={additionalCta.contact.buttonHref}>{additionalCta.contact.buttonText}</LinkButton>
          </Card>
        </Flex>
      </BasicLayout>
    </PageWrapper>
  );
}
