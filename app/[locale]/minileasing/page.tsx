"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Card } from "@/app/components/v2/core/Card";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MiniLeasing.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "MiniLeasing",
    path: "/minileasing",
  });
}

export default async function MiniLeasingPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "MiniLeasing" });

  // Extract data from translations
  const hero = t.raw("hero");
  const intro = t.raw("intro");
  const features = t.raw("features");
  const useCases = t.raw("useCases");
  const process = t.raw("process");
  const pricing = t.raw("pricing");
  const faq = t.raw("faq");
  const cta = t.raw("cta");
  const promotion = t.raw("promotion");

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero isFirst>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
        <Hero.Text>
          {hero.texts.map((text: string, index: number) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
        </Hero.Text>
      </Hero>

      {/* Introduction Section */}
      <BasicLayout>
        <Heading2>{intro.heading}</Heading2>
        {intro.texts.map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
      </BasicLayout>

      {/* Features Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{features.heading}</Heading2>
          {features.texts.map((text: string, index: number) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
          <List>
            {features.list.map((item: string, index: number) => (
              <List.Item key={index}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage width="large" height="max" src="/images/autonvuokraus.png" useMask className="self-end" />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* Use Cases Section */}
      <BasicLayout>
        <Heading2>{useCases.heading}</Heading2>
        {useCases.texts.map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {useCases.cases.map((useCase: { title: string; texts: string[] }, index: number) => (
            <Card key={index}>
              <Heading3>{useCase.title}</Heading3>
              {useCase.texts.map((text: string, textIndex: number) => (
                <Paragraph key={textIndex}>{text}</Paragraph>
              ))}
            </Card>
          ))}
        </div>
      </BasicLayout>

      {/* Process Section */}
      <BasicLayout palette="kupari">
        <Heading2>{process.heading}</Heading2>
        {process.texts.map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {process.steps.map((step: { step: string; title: string; description: string }, index: number) => (
            <Card key={index} palette="maantie">
              <div className="text-2xl font-bold text-center mb-2">{step.step}</div>
              <Heading3>{step.title}</Heading3>
              <Paragraph>{step.description}</Paragraph>
            </Card>
          ))}
        </div>
      </BasicLayout>

      {/* Pricing Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{pricing.heading}</Heading2>
          {pricing.texts.map((text: string, index: number) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
          <Heading3>Hinta sisältää:</Heading3>
          <List>
            {pricing.included.map((item: string, index: number) => (
              <List.Item key={index}>{item}</List.Item>
            ))}
          </List>
          <Paragraph className="text-sm text-gray-600 mt-4">
            <em>* {pricing.note}</em>
          </Paragraph>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage
            width="large"
            height="max"
            src="/images/campaigns/laskuri.png"
            useMask
            className="self-end"
          />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* FAQ Section */}
      <BasicLayout>
        <Heading2>{faq.heading}</Heading2>
        <Accordion>
          {faq.questions.map((item: { question: string; answer: string }, index: number) => (
            <Accordion.Item key={index} heading={item.question}>
              {item.answer}
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA Section */}
      <BasicLayout palette="piki">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts.map((text: string, index: number) => (
          <Paragraph key={index} className="mb-6">
            {text}
          </Paragraph>
        ))}
        <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>
      </BasicLayout>

      {/* Promotion Section */}
      <BasicLayout>
        <Heading2>{promotion.heading}</Heading2>
        {promotion.texts.map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {promotion.columns.map(
            (column: { title: string; texts: string[]; link: { label: string; href: string } }, index: number) => (
              <Card key={index}>
                <Heading3>{column.title}</Heading3>
                {column.texts.map((text: string, textIndex: number) => (
                  <Paragraph key={textIndex}>{text}</Paragraph>
                ))}
                <LinkButton href={column.link.href} className="mt-4">
                  {column.link.label}
                </LinkButton>
              </Card>
            )
          )}
        </div>
      </BasicLayout>
    </PageWrapper>
  );
}
