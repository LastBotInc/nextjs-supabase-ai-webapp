"use client";

import { BlockPadding, FullWidthContentBlockWithBg, MaxWidthContentBlock, spacing } from "./layouts/Block";
import { Heading1, LinkLikeButton, Paragraph } from "./layouts/CommonElements";
import { useTranslations } from "next-intl";
import { TwoColumnCard } from "./layouts/Card";
import Image from "next/image";

export default function InnoFleetSection() {
  const t = useTranslations("Home");

  return (
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
  );
}
