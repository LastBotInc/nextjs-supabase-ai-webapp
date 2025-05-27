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
} from "../../components/layouts/Block";
import { TwoColumnCard } from "../../components/layouts/Card";
import { Heading1, Heading2, Heading3, Paragraph, LinkLikeButton } from "../../components/layouts/CommonElements";

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
    <main className="bg-betoni min-h-screen">
      {/* Meta Title & Description for SEO */}
      <FullScreenWidthBlock className="bg-kupari text-white py-12">
        <MaxWidthContentBlock>
          <Heading1>{t("meta.title")}</Heading1>
          <Paragraph className="mt-2 text-lg">{t("meta.description")}</Paragraph>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* Intro Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Placeholder image */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-48 h-48 flex items-center justify-center text-sahko text-2xl font-bold">
              {t("intro.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("intro.title")}</Heading2>
            <Paragraph className="mt-2 text-lg">{t("intro.description")}</Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Maintenance Section */}
      <CommonBlock className="bg-maantie text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("maintenance.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("maintenance.title")}</Heading2>
            <Paragraph className="mt-2">{t("maintenance.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("maintenance.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 font-semibold">
                  {tip}
                </li>
              ))}
            </ul>
            <Paragraph className="mt-2 italic text-sm">{t("maintenance.note")}</Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Replacement Car Section */}
      <CommonBlock className="bg-kupari text-white my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("replacementCar.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("replacementCar.title")}</Heading2>
            <Paragraph className="mt-2">{t("replacementCar.description")}</Paragraph>
            <Paragraph className="mt-2 italic text-sm">{t("replacementCar.note")}</Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Billing Section */}
      <CommonBlock className="bg-sahko text-white my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-piki text-lg font-bold">
              {t("billing.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("billing.title")}</Heading2>
            <Paragraph className="mt-2">{t("billing.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("billing.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 font-semibold">
                  {tip}
                </li>
              ))}
            </ul>
            <Paragraph className="mt-2 italic text-sm">{t("billing.note")}</Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Tires Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("tires.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("tires.title")}</Heading2>
            <Paragraph className="mt-2">{t("tires.description")}</Paragraph>
            <ul className="bg-maantie text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("tires.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 font-semibold">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CommonBlock>

      {/* Accidents Section */}
      <CommonBlock className="bg-kupari text-white my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("accidents.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("accidents.title")}</Heading2>
            <Paragraph className="mt-2">{t("accidents.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("accidents.steps").map((step: string, idx: number) => (
                <li key={idx} className="list-decimal ml-6 font-semibold">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CommonBlock>

      {/* Roadside Section */}
      <CommonBlock className="bg-maantie text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("roadside.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("roadside.title")}</Heading2>
            <Paragraph className="mt-2">{t("roadside.description")}</Paragraph>
            <ul className="bg-beige text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("roadside.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 font-semibold">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CommonBlock>

      {/* Export Section */}
      <CommonBlock className="bg-beige text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("export.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("export.title")}</Heading2>
            <Paragraph className="mt-2">{t("export.description")}</Paragraph>
            <ul className="bg-maantie text-piki rounded-lg p-4 mt-4 space-y-2">
              {t.raw("export.tips").map((tip: string, idx: number) => (
                <li key={idx} className="list-disc ml-6 font-semibold">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CommonBlock>

      {/* Return Section */}
      <CommonBlock className="bg-kupari text-white my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("return.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3 space-y-4">
            <Heading2>{t("return.title")}</Heading2>
            <Paragraph className="mt-2">{t("return.description")}</Paragraph>
            {/* Checklist */}
            <div className="bg-beige text-piki rounded-lg p-4">
              <Heading3>{t("return.checklist.title")}</Heading3>
              <ul className="space-y-1">
                {t.raw("return.checklist.items").map((item: string, idx: number) => (
                  <li key={idx} className="list-disc ml-6 font-semibold">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Must Have */}
            <div className="bg-maantie text-piki rounded-lg p-4">
              <Heading3>{t("return.mustHave.title")}</Heading3>
              <ul className="space-y-1">
                {t.raw("return.mustHave.items").map((item: string, idx: number) => (
                  <li key={idx} className="list-disc ml-6 font-semibold">
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
                  <li key={idx} className="list-disc ml-6 font-semibold">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CommonBlock>

      {/* FAQ Section */}
      <CommonBlock className="bg-sahko text-white my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-piki text-lg font-bold">
              {t("faq.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("faq.title")}</Heading2>
            <div className="space-y-4 mt-2">
              {t.raw("faq.sections").map((section: any, idx: number) => (
                <div key={idx} className="bg-beige text-piki rounded-lg p-4">
                  <Heading3>{section.title}</Heading3>
                  <Paragraph>{section.description}</Paragraph>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CommonBlock>

      {/* Contact Section */}
      <CommonBlock className="bg-maantie text-piki my-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="bg-betoni rounded-lg w-40 h-40 flex items-center justify-center text-sahko text-lg font-bold">
              {t("contact.image")}
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <Heading2>{t("contact.title")}</Heading2>
            <Paragraph className="mt-2">{t("contact.description")}</Paragraph>
            <Paragraph className="mt-2 italic text-sm">{t("contact.note")}</Paragraph>
          </div>
        </div>
      </CommonBlock>
    </main>
  );
}
