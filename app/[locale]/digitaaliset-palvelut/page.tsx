"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { ThreeColumnLayout } from "@/app/components/v2/layouts/ThreeColumnLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { List } from "@/app/components/v2/core/List";
import { Table } from "@/app/components/v2/core/Table";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Columns } from "@/app/components/v2/core/Columns";
import { Padding } from "@/app/components/v2/core/types";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DigitalServices.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "DigitalServices",
    path: "/digitaaliset-palvelut",
  });
}

export default async function Page({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "DigitalServices" });

  // Get raw data objects
  const hero = t.raw("hero");
  const fleetManager = t.raw("fleetManager");
  const digitalPortal = t.raw("digitalPortal");
  const digitalDocumentation = t.raw("digitalDocumentation");
  const benefits = t.raw("benefits");
  const faq = t.raw("faq");
  const cta = t.raw("cta");
  const promotion = t.raw("promotion");

  return (
    <PageWrapper>
      {/* HERO SECTION */}
      <Hero isFirst>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
        <Hero.Text>{hero.texts?.[0]}</Hero.Text>
        <Hero.ExtraContent>
          <CallUs numbers={hero.numbers} />
        </Hero.ExtraContent>
      </Hero>

      {/* FLEETMANAGER SECTION */}
      <TwoColumnLayout contentPalette="light-gray">
        <FlexLayout.Column>
          <Heading2>{fleetManager.heading}</Heading2>
          <Paragraph>{fleetManager.subheading}</Paragraph>

          {fleetManager.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <List>
            {fleetManager.list?.map((item: { term: string; description: string }, idx: number) => (
              <List.Item key={idx}>
                <strong>{item.term}:</strong> {item.description}
              </List.Item>
            ))}
          </List>
          <DecorativeImage src={fleetManager.image.src} width="medium" height="max-block" />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* DIGITAL PORTAL SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{digitalPortal.heading}</Heading2>
        <Paragraph>{digitalPortal.subheading}</Paragraph>

        {digitalPortal.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <List>
          {digitalPortal.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* DIGITAL DOCUMENTATION SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{digitalDocumentation.heading}</Heading2>
        <Paragraph>{digitalDocumentation.subheading}</Paragraph>

        {digitalDocumentation.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <Columns>
          {digitalDocumentation.cases?.map(
            (caseItem: { title: string; texts: string[]; image: { src: string; alt: string } }, idx: number) => (
              <Card key={idx} padding={Padding.Block}>
                <Heading3>{caseItem.title}</Heading3>
                {caseItem.texts?.map((text: string, textIdx: number) => (
                  <Paragraph key={textIdx}>{text}</Paragraph>
                ))}
                <DecorativeImage src={caseItem.image.src} width="medium" height="medium" />
              </Card>
            )
          )}
        </Columns>
      </BasicLayout>

      {/* BENEFITS SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{benefits.heading}</Heading2>
        {benefits.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <Table headings={benefits.table?.columns || []} rows={benefits.table?.rows || []} />
      </BasicLayout>

      {/* FAQ SECTION */}
      <BasicLayout contentPalette="beige">
        <Heading2>{faq.heading}</Heading2>
        {faq.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <Accordion>
          {faq.questions?.map((qa: { question: string; answer: string }, idx: number) => (
            <Accordion.Item key={idx} heading={qa.question}>
              <Paragraph>{qa.answer}</Paragraph>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="kupari">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
        <DecorativeImage src={cta.image.src} width="medium" height="max-block" />
      </BasicLayout>

      {/* PROMOTION SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{promotion.heading}</Heading2>
        {promotion.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <ThreeColumnLayout padding={Padding.None}>
          {promotion.columns?.map(
            (column: { title: string; texts: string[]; link: { label: string; href: string } }, idx: number) => (
              <Card key={idx} padding={Padding.None}>
                <Heading3>{column.title}</Heading3>
                {column.texts?.map((text: string, textIdx: number) => (
                  <Paragraph key={textIdx}>{text}</Paragraph>
                ))}
                {column.link && <LinkButton href={column.link.href}>{column.link.label}</LinkButton>}
              </Card>
            )
          )}
        </ThreeColumnLayout>
      </BasicLayout>
    </PageWrapper>
  );
}
