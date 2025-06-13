"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { ContentArea } from "@/app/components/v2/core/ContentArea";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Table } from "@/app/components/v2/core/Table";
// Placeholder for image container, replace with actual ImageContainer if available
// import { ImageContainer } from "@/app/components/v2/core/ImageContainer";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "MachineLeasing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MachineLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "MachineLeasing" });
  // Terms list
  const terms: { term: string; description: string }[] = t.raw("terms.list");
  // Vehicles table
  const vehicleColumns: string[] = t.raw("vehicles.table.columns");
  const vehicleRows: string[][] = t.raw("vehicles.table.rows");
  // Benefits list
  const benefits: string[] = t.raw("benefits.list");
  // Examples
  const cases: { title: string; description: string }[] = t.raw("examples.cases");
  // FAQ
  const faqList: { question: string; answer: string }[] = t.raw("faq.list");

  return (
    <PageWrapper>
      {/* Hero Section */}

      <Hero isFirst>
        <Hero.Image src="/images/digitaaliset_palvelut.jpg" />
        <Hero.Heading>{t("title")}</Hero.Heading>
        <Hero.Text>{t("intro")}</Hero.Text>
        {/* Optionally add <Hero.Image src="/images/hero-handshake.jpg" alt="Car leasing" /> */}
      </Hero>

      {/* Terms Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{t("terms.heading")}</Heading2>
          <List>
            {terms.map((item, idx) => (
              <List.Item key={idx}>
                <strong>{item.term}:</strong> {item.description}
              </List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage width="large" height="max" src="/images/cropped_demo2.png" className="self-end" />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* Vehicles Section */}

      <BasicLayout palette="betoni">
        <Heading2>{t("vehicles.heading")}</Heading2>
        <Table headings={vehicleColumns} rows={vehicleRows} />
      </BasicLayout>

      {/* Benefits Section */}
      <BasicLayout>
        <Heading2>{t("benefits.heading")}</Heading2>
        <List>
          {benefits.map((item, idx) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* Examples Section */}
      <FlexLayout palette="piki">
        {cases.map((ex, idx) => (
          <BoxLayout.Box key={idx}>
            {/* Image Placeholder */}
            <div className="w-full h-32 bg-gray-900 flex items-center justify-center mb-2">Image Placeholder</div>
            <Heading3>{ex.title}</Heading3>
            <Paragraph>{ex.description}</Paragraph>
          </BoxLayout.Box>
        ))}
      </FlexLayout>

      {/* FAQ Section */}
      <BasicLayout palette="default">
        <Heading2>{t("faq.heading")}</Heading2>
        <Accordion>
          {faqList.map((item, idx) => (
            <Accordion.Item key={idx} heading={item.question}>
              <Paragraph>{item.answer}</Paragraph>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA Section */}
      <TwoColumnLayout palette="betoni">
        <FlexLayout.Column>
          <Heading2>{t("cta.heading")}</Heading2>
          <Paragraph>{t("cta.text")}</Paragraph>
          <LinkButton href="/contact">Ota yhteyttä</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          {/* Image Placeholder */}
          <div className="w-full md:w-1/3 h-40 bg-gray-900 flex items-center justify-center mt-4 md:mt-0">
            Image Placeholder
          </div>
        </FlexLayout.Column>
      </TwoColumnLayout>
    </PageWrapper>
  );
}
