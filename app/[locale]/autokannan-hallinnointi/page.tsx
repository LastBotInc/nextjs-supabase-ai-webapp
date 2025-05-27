"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import {
  CommonBlock,
  FullScreenWidthBlock,
  MaxWidthContentBlock,
  ColumnBlock,
  spacing,
} from "../../components/layouts/Block";
import { TwoColumnCard } from "../../components/layouts/Card";
import { Heading1, Heading2, Heading3, Paragraph, LinkLikeButton } from "../../components/layouts/CommonElements";

export default async function FleetManagerPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "FleetManager" });

  return (
    <main className="flex flex-col gap-12 pt-24 bg-beige">
      {/* Intro Section */}
      <CommonBlock className="bg-piki rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
          {/* Placeholder for main image */}
          <div className="w-full md:w-1/2 h-48 bg-maantie rounded-lg flex items-center justify-center">
            <span className="text-betoni">{t("image.alt")}</span>
          </div>
          <div className="w-full md:w-1/2">
            <Heading1 className="text-kupari">{t("intro.title")}</Heading1>
            <Paragraph variant="large" className="text-white">
              {t("intro.description")}
            </Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Main View Section */}
      <FullScreenWidthBlock className="bg-beige">
        <MaxWidthContentBlock>
          <TwoColumnCard>
            <div className="bg-white rounded-xl shadow p-6">
              <Heading2 className="text-piki mb-2">{t("mainView.title")}</Heading2>
              <ul className="list-disc pl-6 text-lg text-piki space-y-2">
                {t.raw("mainView.features").map((feature: string) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
            <div className="bg-kupari/10 rounded-xl shadow p-6 flex flex-col justify-center">
              <Heading3 className="text-kupari mb-2">{t("summary.title")}</Heading3>
              <Paragraph className="text-betoni">{t("summary.description")}</Paragraph>
            </div>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* Benefits Section */}
      <FullScreenWidthBlock className="bg-maantie">
        <MaxWidthContentBlock>
          <ColumnBlock className="bg-white rounded-xl shadow p-6">
            <Heading2 className="text-sahko mb-4">{t("benefits.title")}</Heading2>
            <ul className="list-disc pl-6 text-lg text-piki space-y-2 mb-4">
              {t.raw("benefits.items").map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ColumnBlock>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* All-in-One Section */}
      <CommonBlock className="bg-kupari rounded-xl shadow-lg">
        <div className="flex flex-col gap-4 items-start w-full">
          <Heading2 className="text-white">{t("allInOne.title")}</Heading2>
          <Paragraph className="text-beige">{t("allInOne.description")}</Paragraph>
        </div>
      </CommonBlock>
    </main>
  );
}
