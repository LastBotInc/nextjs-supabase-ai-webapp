"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/core/PageWrapper";
import { MainBlock } from "@/app/components/v2/blocks/MainBlock";
import { ContentBlock } from "@/app/components/v2/blocks/ContentBlock";
import { BoxBlock } from "@/app/components/v2/blocks/BoxBlock";
import { CallUs } from "@/app/components/CallUs";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { GridLayout } from "@/app/components/v2/layouts/GridLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AutoleasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <PageWrapper>
      <Hero isFirst>
        <Hero.Image src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>
      <GridLayout
        mainImage={{ src: "/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" }}
        contentImage={{ src: "/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" }}
        contentPalette="piki"
        oneColumnBreakpoint="lg"
      >
        <GridLayout.Column>
          <h1>{t("hero.heading")}</h1>
        </GridLayout.Column>
        <GridLayout.Column>
          <h1>{t("hero.heading")}</h1>
        </GridLayout.Column>
        <GridLayout.Column>
          <h1>{t("hero.heading")}</h1>
        </GridLayout.Column>
        <GridLayout.Column>
          <h1>{t("hero.heading")}</h1>
        </GridLayout.Column>
      </GridLayout>

      <FlexLayout oneColumnBreakpoint="lg" palette="default">
        <h1>{t("hero.heading")}</h1>
        <FlexLayout.FixedWidthColumn width={{ default: "100%", md: "300px", lg: "300px", xl: "400px" }}>
          <h1>{t("hero.heading")}</h1>
        </FlexLayout.FixedWidthColumn>
        <h1>{t("hero.heading")}</h1>
      </FlexLayout>

      <MainBlock>
        <MainBlock.Content>
          <ContentBlock palette="kupari">
            <ContentBlock.Content>
              <h1>{t("hero.heading")}</h1>
              <BoxBlock>
                <BoxBlock.Content>
                  <h2>{t("hero.subheading")}</h2>
                </BoxBlock.Content>
              </BoxBlock>
            </ContentBlock.Content>
          </ContentBlock>
        </MainBlock.Content>
      </MainBlock>
    </PageWrapper>
  );
}
