"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import {
  CommonBlock,
  FullScreenWidthBlock,
  MaxWidthContentBlock,
  ColumnBlock,
  spacing,
  BlockPadding,
} from "../../components/layouts/Block";
import { TwoColumnCard } from "../../components/layouts/Card";
import { Heading1, Heading2, Heading3, Paragraph, LinkLikeButton } from "../../components/layouts/CommonElements";
import { CallUs } from "../../components/CallUs";
import Image from "next/image";

export default async function FleetManagerPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "FleetManager" });

  return (
    <main className="flex flex-col gap-12 pt-24 bg-beige">
      <CommonBlock className="bg-tiki px-0 lg:px-0 flex flex-col gap-4">
        <div
          style={{ backgroundImage: "url(/images/digitaaliset_palvelut.jpg)" }}
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

      {/* Main View Section */}
      <FullScreenWidthBlock className="bg-beige">
        <MaxWidthContentBlock>
          <BlockPadding className="bg-white xl:rounded-lg gap-4 flex flex-col">
            <Heading2 className="text-piki mb-2">{t("mainView.title")}</Heading2>
            <Paragraph className="text-piki">{t("intro.description")}</Paragraph>
            <ul className="list-disc pl-6 text-lg text-piki space-y-2">
              {t.raw("mainView.features").map((feature: string) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullScreenWidthBlock className="bg-beige">
        <MaxWidthContentBlock>
          <BlockPadding className="bg-kupari/10 xl:rounded-lg gap-4 flex flex-col">
            <Heading3 className="text-kupari mb-2">{t("summary.title")}</Heading3>
            <Paragraph className="text-betoni">{t("summary.description")}</Paragraph>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* Benefits Section */}
      <FullScreenWidthBlock className="bg-maantie py-20">
        <MaxWidthContentBlock>
          <ColumnBlock className="bg-white rounded-xl shadow p-6">
            <Heading2 className="text-piki mb-4">{t("benefits.title")}</Heading2>
            <ul className="list-disc pl-6 text-lg text-piki space-y-2 mb-4">
              {t.raw("benefits.items").map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ColumnBlock>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullScreenWidthBlock className="bg-kupari">
        <MaxWidthContentBlock className={`${spacing.responsivePaddingY}`}>
          <BlockPadding>
            <TwoColumnCard className="bg-transparent" oneColumnBreak="md">
              <div className="relative">
                <Heading2 className="text-piki">{t("allInOne.title")}</Heading2>
                <Paragraph className="text-piki">{t("allInOne.description")}</Paragraph>
              </div>
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
            </TwoColumnCard>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>
    </main>
  );
}
