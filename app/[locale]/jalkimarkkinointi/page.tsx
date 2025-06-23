"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";

import { Heading1, Heading2, Heading3, Heading3Small } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Table } from "@/app/components/v2/core/Table";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Card } from "@/app/components/v2/core/Card";
import { List } from "@/app/components/v2/core/List";
import { ThreeColumnLayout } from "@/app/components/v2/layouts/ThreeColumnLayout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PostMarketing.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "PostMarketing",
    path: "/jalkimarkkinointi",
  });
}

export default async function PostMarketingPage({ params }: { params: Promise<{ locale: string }> }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "PostMarketing" });

  return (
    <PageWrapper>
      {/* Section 1: Introduction */}
      <BasicLayout>
        <Heading1>{t("section1.heading")}</Heading1>
        {t.raw("section1.texts").map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
      </BasicLayout>

      {/* Section 2: Service Portfolio */}
      <BasicLayout>
        <Heading2>{t("section2.heading")}</Heading2>
        <Paragraph>{t("section2.texts.0")}</Paragraph>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {t.raw("section2.list").map((item: { term: string; description: string }, index: number) => (
            <div key={index} className="border-l-4 pl-6 py-4">
              <Heading3Small>{item.term}</Heading3Small>
              <Paragraph>{item.description}</Paragraph>
            </div>
          ))}
        </div>
      </BasicLayout>

      {/* Section 3: Service Benefits Table */}
      <BasicLayout>
        <Heading2>{t("section3.heading")}</Heading2>
        <Paragraph>{t("section3.texts.0")}</Paragraph>

        <Table headings={t.raw("section3.table.columns")} rows={t.raw("section3.table.rows")} className="mb-12" />
      </BasicLayout>

      {/* Section 4: Why Choose Us */}
      <FlexLayout palette="maantie" direction="column">
        <Heading2>{t("section4.heading")}</Heading2>
        <Paragraph className="mb-6">{t("section4.texts.0")}</Paragraph>

        <List className="space-y-4">
          {t.raw("section4.list").map((item: string, index: number) => (
            <List.Item key={index}>{item}</List.Item>
          ))}
        </List>
      </FlexLayout>

      {/* FAQ Section */}
      <BasicLayout>
        <Heading2>{t("faq.heading")}</Heading2>
        <Paragraph>{t("faq.texts.0")}</Paragraph>

        <Accordion>
          {t.raw("faq.questions").map((faq: { question: string; answer: string }, index: number) => (
            <Accordion.Item key={index} heading={faq.question}>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* Main CTA Section */}
      <FlexLayout palette="beige" direction="column">
        <Heading2>{t("cta.heading")}</Heading2>
        {t.raw("cta.texts").map((text: string, index: number) => (
          <Paragraph key={index}>{text}</Paragraph>
        ))}
        <LinkButton href={t("cta.link.href")}>{t("cta.link.label")}</LinkButton>
      </FlexLayout>

      {/* Additional CTA Cards */}
      <ThreeColumnLayout palette="piki">
        <Card>
          <Heading3>{t("additionalCta.calculator.heading")}</Heading3>
          <Paragraph>{t("additionalCta.calculator.text")}</Paragraph>
          <LinkButton href="/laskurit">{t("additionalCta.calculator.buttonText")}</LinkButton>
        </Card>

        <Card>
          <Heading3>{t("additionalCta.carLeasing.heading")}</Heading3>
          <Paragraph>{t("additionalCta.carLeasing.text")}</Paragraph>
          <LinkButton href="/autoleasing">{t("additionalCta.carLeasing.buttonText")}</LinkButton>
        </Card>

        <Card>
          <Heading3>{t("additionalCta.contact.heading")}</Heading3>
          <Paragraph>{t("additionalCta.contact.text")}</Paragraph>
          <LinkButton href="/asiakaspalvelu">{t("additionalCta.contact.buttonText")}</LinkButton>
        </Card>
      </ThreeColumnLayout>
    </PageWrapper>
  );
}
