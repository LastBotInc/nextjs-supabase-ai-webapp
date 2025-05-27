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

export default async function CorporateLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CorporateLeasing" });

  return (
    <main className="flex flex-col gap-12 pt-24 bg-beige">
      {/* Intro Section */}
      <CommonBlock className="bg-piki rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
          {/* Placeholder for main image */}
          <div className="w-full md:w-1/2 h-48 bg-maantie rounded-lg flex items-center justify-center">
            <span className="text-betoni">{t("images.main")}</span>
          </div>
          <div className="w-full md:w-1/2">
            <Heading1 className="text-kupari">{t("intro.title")}</Heading1>
            <Paragraph variant="large" className="text-white">
              {t("intro.description")}
            </Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Open Model, Contact Person, Digital Services, Benefits */}
      <FullScreenWidthBlock className="bg-beige">
        <MaxWidthContentBlock>
          <TwoColumnCard>
            <div className="bg-white rounded-xl shadow p-6">
              <Heading2 className="text-piki mb-2">{t("openModel.title")}</Heading2>
              <Paragraph className="text-betoni">{t("openModel.description")}</Paragraph>
              <Heading3 className="mt-6 text-kupari">{t("contactPerson.title")}</Heading3>
              <Paragraph className="text-betoni">{t("contactPerson.description")}</Paragraph>
              <Heading3 className="mt-6 text-sahko">{t("digitalServices.title")}</Heading3>
              <Paragraph className="text-betoni">{t("digitalServices.description")}</Paragraph>
            </div>
            <div className="bg-kupari/10 rounded-xl shadow p-6">
              <Heading2 className="text-kupari mb-2">Edut</Heading2>
              <ul className="list-disc pl-6 text-lg text-piki space-y-2">
                <li>{t("benefits.fixedPrice")}</li>
                <li>{t("benefits.contractPeriod")}</li>
                <li>{t("benefits.noDownPayment")}</li>
                <li>{t("benefits.newCar")}</li>
              </ul>
            </div>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* Leasing Types Section */}
      <FullScreenWidthBlock className="bg-maantie">
        <MaxWidthContentBlock>
          <Heading2 className="text-piki mb-8">Leasingvaihtoehdot</Heading2>
          <TwoColumnCard>
            {/* Rahoitusleasing */}
            <ColumnBlock className="bg-white rounded-xl shadow p-6">
              <Heading3 className="text-kupari">{t("leasingTypes.rahoitusleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.rahoitusleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.rahoitusleasing.suits")}</Paragraph>
            </ColumnBlock>
            {/* Joustoleasing */}
            <ColumnBlock className="bg-white rounded-xl shadow p-6">
              <Heading3 className="text-kupari">{t("leasingTypes.joustoleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.joustoleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.joustoleasing.suits")}</Paragraph>
            </ColumnBlock>
          </TwoColumnCard>
          <TwoColumnCard className="mt-8">
            {/* Huoltoleasing */}
            <ColumnBlock className="bg-beige rounded-xl shadow p-6">
              <Heading3 className="text-sahko">{t("leasingTypes.huoltoleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.huoltoleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.huoltoleasing.suits")}</Paragraph>
            </ColumnBlock>
            {/* Minileasing */}
            <ColumnBlock className="bg-kupari/10 rounded-xl shadow p-6">
              <Heading3 className="text-kupari">{t("leasingTypes.minileasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.minileasing.description")}</Paragraph>
              <ul className="list-disc pl-6 text-lg text-piki space-y-1 mb-2">
                {t.raw("leasingTypes.minileasing.benefits").map((b: string) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Paragraph className="font-semibold mb-2 text-piki">Täydellinen ratkaisu mm.:</Paragraph>
              <ul className="list-disc pl-6 text-lg text-piki space-y-1 mb-2">
                {t.raw("leasingTypes.minileasing.perfectFor").map((b: string) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Paragraph className="text-betoni">{t("leasingTypes.minileasing.summary")}</Paragraph>
            </ColumnBlock>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* Contact Section */}
      <CommonBlock className="bg-kupari rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
          <div className="w-full md:w-2/3">
            <Heading2 className="text-white">{t("contact.title")}</Heading2>
            <Paragraph className="text-beige">{t("contact.carRentalLink")}</Paragraph>
          </div>
        </div>
      </CommonBlock>

      {/* Equipment Leasing Section */}
      <FullScreenWidthBlock className="bg-betoni">
        <MaxWidthContentBlock>
          <div className="flex flex-col md:flex-row gap-8 items-center w-full">
            {/* Placeholder for equipment image */}
            <div className="w-full md:w-1/2 h-40 bg-maantie rounded-lg flex items-center justify-center">
              <span className="text-betoni">{t("images.equipment")}</span>
            </div>
            <div className="w-full md:w-1/2 bg-white rounded-xl shadow p-6">
              <Heading2 className="text-kupari">{t("equipmentLeasing.title")}</Heading2>
              <Paragraph className="text-betoni">{t("equipmentLeasing.description")}</Paragraph>
              <ul className="list-disc pl-6 text-lg text-piki space-y-1 mb-2">
                {t.raw("equipmentLeasing.benefits").map((b: string) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <Paragraph className="font-semibold mt-4 text-sahko">
                {t("equipmentLeasing.businessToBusiness")}
              </Paragraph>
              <Paragraph className="text-betoni">{t("equipmentLeasing.b2bDescription")}</Paragraph>
              <Paragraph className="text-betoni">{t("equipmentLeasing.process")}</Paragraph>
              <Paragraph className="font-semibold mt-4 text-kupari">{t("equipmentLeasing.contact")}</Paragraph>
            </div>
          </div>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>
    </main>
  );
}
