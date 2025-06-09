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
import { Flex } from "@/app/components/v2/core/Flex";
import { ContentArea } from "@/app/components/v2/core/ContentArea";
import LeasingCalculator from "@/app/components/v2/components/LeasingCalculator";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "CarLeasing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CarLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations("CarLeasing");

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero isFirst>
        <Hero.Image src="/images/autonvuokraus.png" />
        <Hero.Heading>{t("title")}</Hero.Heading>
        <Hero.Text>{t("intro")}</Hero.Text>
        {/* Optionally add <Hero.Image src="/images/hero-handshake.jpg" alt="Car leasing" /> */}
      </Hero>

      {/* Leasing Calculator Section */}
      <FlexLayout palette="default" direction="column">
        <FlexLayout.Column>
          <LeasingCalculator texts={t.raw("calculator")} />
        </FlexLayout.Column>
      </FlexLayout>

      {/* Personal and Corporate Sections */}
      <BoxLayout maxColumns={2} fullSizeBoxes>
        <BoxLayout.Box palette="maantie">
          <Flex direction="column">
            <Heading3>{t("personal.title")}</Heading3>
            <Paragraph>{t("personal.description")}</Paragraph>
          </Flex>
        </BoxLayout.Box>
        <BoxLayout.Box palette="kupari">
          <Flex direction="column">
            <Heading3>{t("corporate.title")}</Heading3>
            <Paragraph>{t("corporate.description")}</Paragraph>
          </Flex>
        </BoxLayout.Box>
        <BoxLayout.Box palette="piki">
          <Flex direction="column">
            <Heading3>{t("terms.title")}</Heading3>
            <Paragraph>{t("terms.description")}</Paragraph>
          </Flex>
        </BoxLayout.Box>
        <BoxLayout.Box palette="piki">
          <Flex direction="column">
            <Heading3>{t("vehicles.title")}</Heading3>
            <Paragraph>{t("vehicles.description")}</Paragraph>
          </Flex>
        </BoxLayout.Box>
      </BoxLayout>

      {/* Benefits and Examples Sections */}
      <BoxLayout maxColumns={2} fullSizeBoxes>
        <BoxLayout.Box palette="default">
          <Flex direction="column">
            <Heading3>{t("benefits.title")}</Heading3>
            <List>
              {t.raw("benefits.list").map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Flex>
        </BoxLayout.Box>
        <BoxLayout.Box palette="default">
          <Flex direction="column">
            <Heading3>{t("examples.title")}</Heading3>
            <List>
              {t.raw("examples.list").map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Flex>
        </BoxLayout.Box>
      </BoxLayout>

      {/* FAQ Section */}
      <FlexLayout palette="default" direction="column">
        <FlexLayout.Column>
          <Heading2>{t("faq.title")}</Heading2>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Accordion>
            <Accordion.Item heading={t("faq.q1")}>
              {" "}
              <Paragraph>{t("faq.a1")}</Paragraph>{" "}
            </Accordion.Item>
            <Accordion.Item heading={t("faq.q2")}>
              {" "}
              <Paragraph>{t("faq.a2")}</Paragraph>{" "}
            </Accordion.Item>
            <Accordion.Item heading={t("faq.q3")}>
              {" "}
              <Paragraph>{t("faq.a3")}</Paragraph>{" "}
            </Accordion.Item>
          </Accordion>
        </FlexLayout.Column>
      </FlexLayout>

      {/* CTA Section */}
      <FlexLayout palette="piki">
        <ContentArea>
          <Flex direction="column" autoFlexChildren={false}>
            <Heading2>{t("cta.title")}</Heading2>
            <Paragraph>{t("cta.description")}</Paragraph>
            <LinkButton href="/contact">{t("cta.button")}</LinkButton>
            {/* Optionally, add CallUs for direct contact */}
            {/* <CallUs numbers={[{ title: "Customer Service", number: "+358 10 123 4567" }]} /> */}
          </Flex>
        </ContentArea>
      </FlexLayout>
    </PageWrapper>
  );
}
