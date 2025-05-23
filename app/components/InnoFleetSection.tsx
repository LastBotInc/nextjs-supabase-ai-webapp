"use client";
import { BlockPadding, FullWidthContentBlockWithBg, MaxWidthContentBlock, spacing } from "./layouts/Block";
import { Heading1, Heading3, LinkLikeButton, Paragraph } from "./layouts/CommonElements";
import { useTranslations } from "next-intl";
import { TwoColumnCard } from "./layouts/Card";
import Image from "next/image";

export default function InnoFleetSection() {
  const t = useTranslations("Home");

  return (
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
  );
}
