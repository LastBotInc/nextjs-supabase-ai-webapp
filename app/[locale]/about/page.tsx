"use server";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { Flex } from "@/app/components/v2/core/Flex";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return generateLocalizedMetadata({
    locale,
    namespace: "About",
    title: t("title"),
    description: "description", // Non existing translation:|| t("description"),
    path: "/about",
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <PageWrapper>
      <Hero palette="piki" fullWidth isFirst>
        <Hero.Image src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" />
        <Hero.Heading>{t("title")}</Hero.Heading>
        <Hero.SubHeading>{t("subtitle")}</Hero.SubHeading>
      </Hero>

      <TwoColumnLayout palette="betoni" columnWidths={["70%", "30%"]}>
        <FlexLayout.Column>
          <Heading2>{t("our_story_title")}</Heading2>
          <Paragraph>{t("introduction.paragraph1")}</Paragraph>
          <Paragraph>{t("introduction.paragraph2")}</Paragraph>
          <Paragraph>{t("introduction.paragraph3")}</Paragraph>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center">
            <Image src="/images/innolease-car.png" alt={t("history.imageAlt") as string} width={320} height={240} />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>
      <BasicLayout palette="beige">
        <Heading2>{t("our_story_title")}</Heading2>
        <Paragraph>{t("our_story")}</Paragraph>
      </BasicLayout>
      <BasicLayout contentPalette="betoni">
        <Heading2>{t("our_mission_title")}</Heading2>
        <Paragraph>{t("our_mission")}</Paragraph>
      </BasicLayout>
      <BasicLayout contentPalette="maantie">
        <Heading2>{t("our_values_title")}</Heading2>
        <Paragraph>{t("our_values")}</Paragraph>
        <Flex direction="row" gaps="large">
          {t.raw("values_list").map((value: { title: string; description: string }, idx: number) => (
            <Card palette="beige" key={idx}>
              <Heading3>{value.title}</Heading3>
              <Paragraph>{value.description}</Paragraph>
            </Card>
          ))}
        </Flex>
      </BasicLayout>
      <TwoColumnLayout contentPalette="piki">
        <Heading2>{t("why_choose_us_title")}</Heading2>
        <List>
          {t.raw("why_choose_us").map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </TwoColumnLayout>
      <BasicLayout contentPalette="default">
        <Heading2>{t("digital_services_title")}</Heading2>
        <List>
          {t.raw("digital_services").map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>
      <BasicLayout palette="kupari">
        <Heading2>{t("offerings_title")}</Heading2>
        <Flex direction="row" gaps="large">
          <Card>
            <Heading3>Yrityksille</Heading3>
            <List>
              {t.raw("offerings.corporate").map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Card>
          <Card>
            <Heading3>Yksityisasiakkaille</Heading3>
            <List>
              {t.raw("offerings.private").map((item: string, idx: number) => (
                <List.Item key={idx}>{item}</List.Item>
              ))}
            </List>
          </Card>
        </Flex>
      </BasicLayout>
      <TwoColumnLayout contentPalette="betoni">
        <FlexLayout.Column>
          <Heading2>{t("history_title")}</Heading2>
          <Paragraph>{t("history.paragraph1")}</Paragraph>
          <Paragraph>{t("history.paragraph2")}</Paragraph>
          <LinkButton href="https://autolle.com">{t("history.autolleButton")}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center mt-6">
            <Image src="/images/innolease-car.png" alt={t("history.imageAlt") as string} width={320} height={240} />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>
      <BasicLayout contentPalette="piki">
        <Heading2>{t("coverage_title")}</Heading2>
        <Paragraph>{t("coverage.description")}</Paragraph>
        <ImageContainer aspectRatio="4/3" className="flex items-center justify-center mt-6">
          <Image src="/images/placeholders/map.png" alt={t("coverage.mapAlt") as string} width={320} height={240} />
        </ImageContainer>
      </BasicLayout>
      <BasicLayout contentPalette="light-gray">
        <Heading2>{t("cta.title")}</Heading2>
        <Paragraph>{t("cta.description")}</Paragraph>
        <LinkButton href="/contact">{t("cta.button")}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
