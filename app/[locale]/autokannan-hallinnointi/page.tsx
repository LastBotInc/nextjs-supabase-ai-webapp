"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { Heading2 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { CallUs } from "../../components/v2/components/CallUs";
import Image from "next/image";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { List } from "@/app/components/v2/core/List";
import { Padding } from "@/app/components/v2/core/types";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";

export default async function FleetManagerPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "FleetManager" });

  return (
    <PageWrapper>
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src="/images/digitaaliset_palvelut.jpg" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      <FlexLayout
        padding={Padding.Block}
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="default"
        contentClassName="rounded-box"
      >
        <FlexLayout.Column>
          <Heading2>{t("mainView.title")}</Heading2>
          <Paragraph>{t("intro.description")}</Paragraph>
          <List className=" palette-text-color">
            {t.raw("mainView.features").map((feature: string) => (
              <List.Item key={feature}>{feature}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="beige"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <Heading2>{t("summary.title")}</Heading2>
          <Paragraph>{t("summary.description")}</Paragraph>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Benefits Section */}
      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="light-gray"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <Heading2>{t("benefits.title")}</Heading2>
          <List className="palette-text-color">
            {t.raw("benefits.items").map((item: string) => (
              <List.Item key={item}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="piki"
        contentPalette="kupari"
        contentClassName="rounded-box"
        padding={Padding.Block}
      >
        <FlexLayout.Column>
          <div className="relative space-y-8">
            <Heading2 className="text-piki">{t("allInOne.title")}</Heading2>
            <Paragraph className="text-piki">{t("allInOne.description")}</Paragraph>
          </div>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer>
            <Image
              src={"/images/home/iphone_05_sleep_image.png"}
              alt={"transparency.imageAlt"}
              width={566}
              height={727}
              layout="responsive"
              className="object-cover rounded-xl "
              sizes="100vw"
              quality={90}
            />
          </ImageContainer>
        </FlexLayout.Column>
      </FlexLayout>
    </PageWrapper>
  );
}
