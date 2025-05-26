"use client";
import { Heading1, Paragraph } from "../components/layouts/CommonElements";
import { LinkLikeButton } from "../components/layouts/CommonElements";
import { IconPlugCar } from "../components/Icons";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { BlockPadding, FullScreenWidthBlock, MaxWidthContentBlock, spacing } from "./layouts/Block";
import { TwoColumnCard } from "./layouts/Card";

export default function GreenLeasingSection() {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <FullScreenWidthBlock className="bg-kupari">
      <MaxWidthContentBlock className={`${spacing.responsivePaddingY}`}>
        <BlockPadding>
          <TwoColumnCard className="bg-transparent" oneColumnBreak="xl">
            <div className="relative">
              <Heading1 className="text-piki">{t("greenLeasing.title")}</Heading1>
              {t.raw("greenLeasing.description").map((description: string) => (
                <Paragraph key={description} className="text-piki">
                  {description}
                </Paragraph>
              ))}

              <ul className="text-piki list-disc list-inside">
                {t.raw("greenLeasing.list").map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <br></br>
              <LinkLikeButton className="bg-piki   text-white" href={"#"}>
                {t("greenLeasing.readMore")}
              </LinkLikeButton>
              <IconPlugCar className="absolute bottom-0 right-0" />
            </div>
            <Image
              src={"/images/home/514779a641a0c85ec74f7f81387290bd5d4de8a6.png"}
              alt={"transparency.imageAlt"}
              width={800}
              height={480}
              layout="responsive"
              className="object-cover rounded-xl "
              sizes="100vw"
              quality={90}
            />
          </TwoColumnCard>
        </BlockPadding>
      </MaxWidthContentBlock>
    </FullScreenWidthBlock>
  );
}
