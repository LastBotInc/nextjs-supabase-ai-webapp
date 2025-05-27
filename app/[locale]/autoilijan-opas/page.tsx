"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import {
  BlockPadding,
  CommonBlock,
  FullScreenWidthBlock,
  MaxWidthContentBlock,
  ColumnBlock,
  spacing,
  FullWidthContentBlockWithBg,
} from "../../components/layouts/Block";
import { TwoColumnCard } from "../../components/layouts/Card";
import {
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  LinkLikeButton,
  Heading2Small,
} from "../../components/layouts/CommonElements";
import Image from "next/image";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "CarLeasing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DriversGuidePage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations("DriversGuide");

  return (
    <main className="flex min-h-screen flex-col items-center bg-white pt-24">
      <FullWidthContentBlockWithBg image="/images/autonvuokraus.png" backgroundPosition="bottom right">
        <MaxWidthContentBlock className="min-h-[500px] lg:h-[600px] shadow-text justify-end flex flex-col">
          <BlockPadding>
            <h1 className="text-6xl font-medium text-white leading-tight">
              {t("meta.title")}
              <span className="block text-5xl font-light text-white with-shadow">{t("meta.description")}</span>
            </h1>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      {/* Intro Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("intro.title")}</Heading2Small>
            <Paragraph className="mt-2 text-lg">{t("intro.description")}</Paragraph>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Maintenance Section */}
      <CommonBlock className="bg-black text-white my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("maintenance.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("maintenance.description")}</Paragraph>
            <ul className="">
              {t.raw("maintenance.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-4 pl-0">
                  {tip}
                </li>
              ))}
            </ul>
            <Paragraph className="mt-2 font-bold">{t("maintenance.note")}</Paragraph>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Replacement Car Section */}
      <CommonBlock className="bg-maantie text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("replacementCar.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("replacementCar.description")}</Paragraph>
            <Paragraph className="mt-2 italic text-sm">{t("replacementCar.note")}</Paragraph>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Billing Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("billing.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("billing.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("billing.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 ">
                  {tip}
                </li>
              ))}
            </ul>
            <Paragraph className="mt-2 italic text-sm">{t("billing.note")}</Paragraph>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Tires Section */}
      <CommonBlock className="bg-sahko text-white my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("tires.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("tires.description")}</Paragraph>
            <ul className="bg-black text-white rounded-lg p-4 mt-4 space-y-2">
              {t.raw("tires.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 ">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Accidents Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("accidents.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("accidents.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("accidents.steps").map((step: string, idx: number) => (
                <li key={idx} className="list-decimal ml-6 ">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Roadside Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("roadside.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("roadside.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("roadside.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 ">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Export Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("export.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("export.description")}</Paragraph>
            <ul className="bg-maantie text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("export.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 ">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* Return Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <TwoColumnCard className="md:grid-cols-[33%_67%]">
          {/* Placeholder image */}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"transparency.imageAlt"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
          <div className="flex flex-col gap-4">
            <Heading2Small>{t("return.title")}</Heading2Small>
            <Paragraph className="mt-2">{t("return.description")}</Paragraph>
            {/* Checklist */}
            <div className="bg-beige text-piki rounded-lg p-4">
              <Heading3>{t("return.checklist.title")}</Heading3>
              <ul className="space-y-1">
                {t.raw("return.checklist.items").map((item: string, idx: number) => (
                  <li key={idx} className="list-disc ml-6 ">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Must Have */}
            <div className="bg-beige text-piki rounded-lg p-4">
              <Heading3>{t("return.mustHave.title")}</Heading3>
              <ul className="space-y-1">
                {t.raw("return.mustHave.items").map((item: string, idx: number) => (
                  <li key={idx} className="list-disc ml-6 ">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Remove */}
            <div className="bg-beige text-piki rounded-lg p-4">
              <Heading3>{t("return.remove.title")}</Heading3>
              <ul className="space-y-1">
                {t.raw("return.remove.items").map((item: string, idx: number) => (
                  <li key={idx} className="list-disc ml-6 ">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TwoColumnCard>
      </CommonBlock>

      {/* FAQ Section */}
      <FullScreenWidthBlock className="bg-piki">
        <MaxWidthContentBlock>
          <BlockPadding className="flex flex-col gap-4">
            <Heading2>{t("faq.title")}</Heading2>
            <div className="flex flex-col gap-4">
              {t.raw("faq.sections").map((section: any, idx: number) => (
                <div key={idx} className="bg-beige text-piki rounded-lg p-4">
                  <Heading3>{section.title}</Heading3>
                  <Paragraph>{section.description}</Paragraph>
                </div>
              ))}
            </div>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullWidthContentBlockWithBg image="/images/Tietoa_meista.png" backgroundPosition="top center">
        <MaxWidthContentBlock>
          <BlockPadding>
            <div className="flex flex-col  gap-6 lg:gap-2 lg:w-full shadow-text-sharp">
              <Heading2 className="text-6xl font-medium text-white leading-tight lg:w-1/2">
                {t("contact.title")}
              </Heading2>
              <Paragraph variant="large">{t("contact.description")}</Paragraph>
              <Paragraph variant="large">{t("contact.note")}</Paragraph>
            </div>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>
    </main>
  );
}
