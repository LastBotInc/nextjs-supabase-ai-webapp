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
  const meta = t.raw("meta");
  return generateLocalizedMetadata({
    locale,
    namespace: "About",
    title: meta.title,
    description: meta.description,
    path: "/about",
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });

  // Raw data blocks
  const hero = t.raw("hero");
  const introduction = t.raw("introduction");
  const ourStory = t.raw("ourStory");
  const ourMission = t.raw("ourMission");
  const ourValues = t.raw("ourValues");
  const whyChooseUs = t.raw("whyChooseUs");
  const digitalServices = t.raw("digitalServices");
  const offerings = t.raw("offerings");
  const history = t.raw("history");
  const coverage = t.raw("coverage");
  const cta = t.raw("cta");

  return (
    <PageWrapper>
      {/* HERO SECTION */}
      <Hero palette="piki" fullWidth isFirst>
        <Hero.Image src={hero.image?.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
      </Hero>

      {/* INTRODUCTION SECTION */}
      <TwoColumnLayout palette="betoni" columnWidths={["70%", "30%"]}>
        <FlexLayout.Column>
          <Heading2>{introduction.heading}</Heading2>
          {introduction.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center">
            <Image
              src={introduction.image?.src || "/images/innolease-car.png"}
              alt={introduction.image?.alt || "Innolease"}
              width={320}
              height={240}
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* OUR STORY SECTION */}
      <BasicLayout palette="beige">
        <Heading2>{ourStory.heading}</Heading2>
        {ourStory.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
      </BasicLayout>

      {/* OUR MISSION SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{ourMission.heading}</Heading2>
        {ourMission.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
      </BasicLayout>

      {/* OUR VALUES SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{ourValues.heading}</Heading2>
        {ourValues.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Flex direction="row" gaps="large">
          {ourValues.cards?.map((value: { title: string; texts: string[] }, idx: number) => (
            <Card palette="beige" key={idx}>
              <Heading3>{value.title}</Heading3>
              {value.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx}>{text}</Paragraph>
              ))}
            </Card>
          ))}
        </Flex>
      </BasicLayout>

      {/* WHY CHOOSE US SECTION */}
      <TwoColumnLayout contentPalette="piki">
        <Heading2>{whyChooseUs.heading}</Heading2>
        <List>
          {whyChooseUs.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </TwoColumnLayout>

      {/* DIGITAL SERVICES SECTION */}
      <BasicLayout contentPalette="default">
        <Heading2>{digitalServices.heading}</Heading2>
        <List>
          {digitalServices.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* OFFERINGS SECTION */}
      <BasicLayout palette="kupari">
        <Heading2>{offerings.heading}</Heading2>
        <Flex direction="row" gaps="large">
          {offerings.columns?.map((column: { subheading: string; list: string[] }, idx: number) => (
            <Card key={idx}>
              <Heading3>{column.subheading}</Heading3>
              <List>
                {column.list?.map((item: string, itemIdx: number) => (
                  <List.Item key={itemIdx}>{item}</List.Item>
                ))}
              </List>
            </Card>
          ))}
        </Flex>
      </BasicLayout>

      {/* HISTORY SECTION */}
      <TwoColumnLayout contentPalette="betoni">
        <FlexLayout.Column>
          <Heading2>{history.heading}</Heading2>
          {history.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          {history.link && <LinkButton href={history.link.href}>{history.link.label}</LinkButton>}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center mt-6">
            <Image
              src={history.image?.src || "/images/innolease-car.png"}
              alt={history.image?.alt || "Innolease"}
              width={320}
              height={240}
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* COVERAGE SECTION */}
      <BasicLayout contentPalette="piki">
        <Heading2>{coverage.heading}</Heading2>
        {coverage.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <ImageContainer aspectRatio="4/3" className="flex items-center justify-center mt-6">
          <Image
            src={coverage.image?.src || "/images/placeholders/map.png"}
            alt={coverage.image?.alt || "Palveluverkosto"}
            width={320}
            height={240}
          />
        </ImageContainer>
      </BasicLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
      </BasicLayout>

      {/* ADDITIONAL CTA SECTIONS */}
      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <Heading2>{t("additionalCta.services.heading")}</Heading2>
          <Paragraph>{t("additionalCta.services.text")}</Paragraph>
          <LinkButton href={t("additionalCta.services.buttonHref")}>
            {t("additionalCta.services.buttonText")}
          </LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Heading2>{t("additionalCta.calculator.heading")}</Heading2>
          <Paragraph>{t("additionalCta.calculator.text")}</Paragraph>
          <LinkButton href={t("additionalCta.calculator.buttonHref")}>
            {t("additionalCta.calculator.buttonText")}
          </LinkButton>
        </FlexLayout.Column>
      </FlexLayout>

      <TwoColumnLayout palette="piki">
        <FlexLayout.Column>
          <Heading2>{t("additionalCta.team.heading")}</Heading2>
          <Paragraph>{t("additionalCta.team.text")}</Paragraph>
          <LinkButton href={t("additionalCta.team.buttonHref")}>{t("additionalCta.team.buttonText")}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center">
            <Image
              src="/images/team/team-meeting.jpg"
              alt={t("additionalCta.team.imageAlt")}
              width={320}
              height={240}
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>
    </PageWrapper>
  );
}
