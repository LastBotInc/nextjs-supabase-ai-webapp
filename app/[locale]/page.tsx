import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { TwoColumnCard } from "../components/layouts/Card";
import { CallUs } from "../components/CallUs";
import {
  BlockPadding,
  CommonBlock,
  FullScreenWidthBlock,
  FullWidthContentBlockWithBg,
  MaxWidthContentBlock,
  ColumnBlock,
  spacing,
} from "../components/layouts/Block";
import { LinkLikeButton, Paragraph } from "../components/layouts/CommonElements";
import { Heading1, Heading2, Heading3, ShapedContentFlowInParagraph } from "../components/layouts/CommonElements";
type Props = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  await setupServerLocale(locale);
  const tMeta = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

// Dynamically import heavy sections as client components
const DynamicContent = dynamic(() => import("../components/DynamicContent"));

export default async function Page({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    /* Main container should have a pt-24 to account for the fixed header */
    <main className="flex min-h-screen flex-col items-center bg-white pt-24">
      <CommonBlock className="bg-tiki px-0 lg:px-0">
        <div
          style={{ backgroundImage: "url(/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png)" }}
          className={`min-h-[500px] lg:h-[600px] w-full relative background-image-fill xl:rounded-lg ${spacing.responsivePadding} flex flex-col items-left justify-end`}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-2 lg:justify-between lg:w-full shadow-text">
            <h1 className="text-6xl font-medium text-white leading-tight lg:w-1/3">
              {t("hero.heading")}
              <span className="block text-5xl font-light text-white hero-text-split-to-lines with-shadow">
                {t("hero.subheading")}
              </span>
            </h1>
            <CallUs numbers={t.raw("hero.numbers")} />
          </div>
        </div>
      </CommonBlock>

      <CommonBlock className="bg-white">
        <TwoColumnCard className="bg-transparent gap-0">
          <div className="text-center md:text-left pr-10">
            <Heading2 className="text-piki">{t("topTeam.heading")}</Heading2>
            <div className="aspect-ratio-4/3">
              <Image
                src="/images/home/542c1cb86dab162e495da68f95bb1172db8497fb.png"
                alt={t("topTeam.imageAlt", { defaultValue: "Top team" })}
                layout="responsive"
                width={1893}
                height={1262}
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
                quality={90}
              />
            </div>
          </div>

          <div>
            <div className="space-y-5 text-gray-700 text-lg">
              <Paragraph className="text-piki" variant="large">
                {t("topTeam.paragraph1")}
              </Paragraph>
              <Paragraph className="text-piki" variant="large">
                {t("topTeam.paragraph2")}
              </Paragraph>
            </div>

            <LinkLikeButton className="mt-8 bg-piki text-white" href="#">
              {t("topTeam.readMore")}
            </LinkLikeButton>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      <FullScreenWidthBlock className={`bg-gray-200 lg:px-${spacing.md}`}>
        <MaxWidthContentBlock>
          <ColumnBlock>
            <BlockPadding className="flex flex-col items-center text-center">
              <Heading2 className="text-gray-900">{t("leasingOptions.heading")}</Heading2>
              <p className="text-3xl font-light text-gray-900">{t("leasingOptions.description")}</p>
            </BlockPadding>
          </ColumnBlock>
        </MaxWidthContentBlock>
        <MaxWidthContentBlock>
          <TwoColumnCard className="bg-transparent" oneColumnBreak="lg">
            <ColumnBlock className="bg-kupari overlay-pattern-innolease-1" noPadding>
              <div className="leasing-option-content">
                <Image
                  src="/images/home/leasing1.png"
                  alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                  layout="responsive"
                  width={1077}
                  height={397}
                  className="lg:hidden pb-6"
                  quality={90}
                  aria-hidden={true}
                />

                <Heading3 className={`text-piki font-medium`}>{t("leasingOptions.personalizedTitle")}</Heading3>
                <ShapedContentFlowInParagraph
                  image={{
                    src: "/images/home/0f6632b90d20d9cb3e1d6f218e043f46b58094e1.png",
                    alt: "Leasing options shape",
                    shape: "polygon(0% 100%, 0% 54%, 24% 17%, 33% 0%, 100% 0%, 100% 100%)",
                    aspectRatio: "1025/496",
                  }}
                  className={`text-piki`}
                >
                  {t("leasingOptions.personalizedDescription")}
                </ShapedContentFlowInParagraph>
                <LinkLikeButton className="bg-white text-piki" href="#">
                  {t("leasingOptions.readMore")}
                </LinkLikeButton>
              </div>
            </ColumnBlock>
            <ColumnBlock className="bg-betoni overlay-pattern-innolease-2" noPadding>
              <div className="leasing-option-content">
                <Image
                  src="/images/home/leasing2.png"
                  alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                  layout="responsive"
                  width={703}
                  height={392}
                  className="lg:hidden pb-6"
                  quality={90}
                  aria-hidden={true}
                />
                <Heading3 className="font-medium">{t("leasingOptions.flexibleTitle")}</Heading3>
                <ShapedContentFlowInParagraph
                  image={{
                    src: "/images/home/09b138d95425dda02cfc752cc17328ca2e0f8a2c_x.png",
                    alt: "Leasing options shape",
                    shape: "polygon(30% 100%, 30% 0%, 100% 0%, 100% 100%)",
                    aspectRatio: "1025/496",
                  }}
                >
                  {t("leasingOptions.flexibleDescription")}
                </ShapedContentFlowInParagraph>
                <LinkLikeButton className="bg-kupari text-piki" href="#">
                  {t("leasingOptions.readMore")}
                </LinkLikeButton>
              </div>
            </ColumnBlock>
          </TwoColumnCard>
        </MaxWidthContentBlock>
        <MaxWidthContentBlock className={`flex flex-col items-center py-${spacing.md}`}>
          <BlockPadding>
            <LinkLikeButton href="#" className="bg-piki hover:bg-piki/90 text-white">
              {t("leasingOptions.allSolutions")}
            </LinkLikeButton>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullWidthContentBlockWithBg
        image="/images/home/9460b1df285683cc7b8700f34fe521e13acee9c4.png"
        backgroundPosition="bottom right"
      >
        <MaxWidthContentBlock>
          <BlockPadding>
            <TwoColumnCard className="bg-transparent shadow-text">
              <div>
                <Heading1>{t("transparency.title")}</Heading1>
                {t.raw("transparency.description").map((description: string) => (
                  <Paragraph key={description}>{description}</Paragraph>
                ))}
                <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                  {t("transparency.readMore")}
                </LinkLikeButton>
              </div>
              <div></div>
            </TwoColumnCard>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      <FullWidthContentBlockWithBg
        image="/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png"
        backgroundPosition={{ default: "0% 0%", md: "0% 0%", lg: "50vw 50%", xl: "97% 50%" }}
        backgroundSize={{ default: "0%", md: "0%", lg: "90%", xl: "40%" }}
        className="bg-gray-200"
      >
        <MaxWidthContentBlock className={spacing.responsivePaddingY}>
          <TwoColumnCard className="bg-transparent gap-0" oneColumnBreak="lg">
            <BlockPadding>
              <Image
                src="/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png"
                alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                layout="responsive"
                width={1893}
                height={1262}
                className="object-contain lg:hidden pb-6"
                sizes="(max-width: 768px) 100vw, 400px"
                quality={90}
              />
              <Heading1
                className="text-piki"
                dangerouslySetInnerHTML={{ __html: t.raw("searchingFor.title") }}
              ></Heading1>
              {t.raw("searchingFor.description").map((description: string) => (
                <Paragraph key={description} className="text-piki">
                  {description}
                </Paragraph>
              ))}
              <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                {t("searchingFor.readMore")}
              </LinkLikeButton>
            </BlockPadding>
            <div className="relative w-full flex"></div>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      <FullWidthContentBlockWithBg
        image="/images/home/oogee01150_Close-up_of_the_front_wheel_and_headlight_design_o_9c38ffea-2dc7-44c8-aa69-241256430d63_3_1.png"
        backgroundPosition={{ default: "center left", md: "center left", lg: "center right", xl: "center right" }}
        backgroundSize={{ default: "0%", md: "0%", lg: "cover" }}
        className="bg-gray-900"
      >
        <MaxWidthContentBlock>
          <BlockPadding>
            <TwoColumnCard className="bg-transparent shadow-text">
              <div className={`pt-${spacing.md} md:pt-0`}>
                <Heading3 className="uppercase text-xl pb-4">{t("innoFleet.subtitle")}</Heading3>
                <Heading1>{t("innoFleet.title")}</Heading1>
                <Paragraph>{t("innoFleet.description1")}</Paragraph>
                <Paragraph>{t("innoFleet.description2")}</Paragraph>
                <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                  {t("transparency.readMore")}
                </LinkLikeButton>
              </div>
              <div className="relative h-[300px] md:h-[600px] w-full z-10">
                <Image
                  src="/images/home/iphone_05_sleep_image.png"
                  alt={t("innoFleet.imageAlt", { defaultValue: "InnoFleet Manager app" })}
                  fill
                  className="object-contain scale-100 md:scale-150"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={90}
                />
              </div>
            </TwoColumnCard>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>
      <DynamicContent locale={locale} />
    </main>
  );
}
