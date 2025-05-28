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
import { Heading1, Heading2, Heading3, Paragraph, LinkLikeButton } from "../../components/layouts/CommonElements";
import { CallUs } from "@/app/components/CallUs";

import React from "react";
import { cn } from "@/utils/cn";

// Leasing comparison table for Finnish market
const leasingData = [
  {
    palvelu: "Oma yhteyshenkilö",
    rahoitus: true,
    jousto: true,
    huolto: true,
    mini: true,
    kone: true,
  },
  {
    palvelu: "Kuukausivuokra",
    rahoitus: "Kiinteä",
    jousto: "Kiinteä",
    huolto: "Kiinteä",
    mini: "Kiinteä",
    kone: "Kiinteä",
  },
  {
    palvelu: "Huollot & korjaukset",
    rahoitus: false,
    jousto: true,
    huolto: true,
    mini: true,
    kone: false,
  },
  {
    palvelu: "Renkaiden uusinnat",
    rahoitus: false,
    jousto: true,
    huolto: true,
    mini: true,
    kone: false,
  },
  {
    palvelu: "Rengashotelli & vaihdot",
    rahoitus: false,
    jousto: true,
    huolto: true,
    mini: true,
    kone: false,
  },
  {
    palvelu: "Sopimuskilometrit",
    rahoitus: "Avoin",
    jousto: "Budjetoitu",
    huolto: "Kiinteä",
    mini: "Suljettu",
    kone: false,
  },
  {
    palvelu: "Huolto­budjetti",
    rahoitus: "Ei sisälly",
    jousto: "Avoin tasataan sopimuskauden päättyessä",
    huolto: "Suljettu",
    mini: "Suljettu",
    kone: "Ei sisälly",
  },
  {
    palvelu: "Ylimeno­kilometri­veloitus",
    rahoitus: "Ei",
    jousto: "Budjetoitu",
    huolto: "Budjetoitu",
    mini: "Budjetoitu",
    kone: false,
  },
  {
    palvelu: "Jäännösarvo",
    rahoitus: "Asiakkaan",
    jousto: "Avoin tasataan sopimuskauden päättyessä",
    huolto: "Suljettu",
    mini: "Suljettu",
    kone: "Asiakkaan",
  },
  {
    palvelu: "Ennenaikainen sopimuksen katkaisu",
    rahoitus: "Pääomatasauksella",
    jousto: "Pääomatasauksella",
    huolto: "Pääomatasauksella",
    mini: false,
    kone: "Pääomatasauksella",
  },
  {
    palvelu: "Käytetty ajoneuvo",
    rahoitus: true,
    jousto: true,
    huolto: true,
    mini: true,
    kone: false,
  },
];

// Helper to render check/cross or text
const renderCell = (value: boolean | string) => {
  if (value === true)
    return (
      <span aria-label="Kyllä" title="Kyllä" className="text-green-600 text-xl">
        ✔️
      </span>
    );
  if (value === false)
    return (
      <span aria-label="Ei" title="Ei" className="text-red-500 text-xl">
        ✖️
      </span>
    );
  return <span>{value}</span>;
};

function LeasingComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white">
      <table className="min-w-full border-collapse rounded-lg">
        <thead>
          <tr className="border-b-2 border-white text-xl">
            <th className="bg-[#C49A6C] text-white font-semibold px-4 py-3 text-left sticky left-0 z-10">Palvelut</th>
            <th className="bg-gray-100 font-semibold px-4 py-3  text-piki">Rahoitusleasing</th>
            <th className="bg-gray-100 font-semibold px-4 py-3 text-piki">Joustoleasing</th>
            <th className="bg-gray-100 font-semibold px-4 py-3 text-piki">Huoltoleasing</th>
            <th className="bg-gray-100 font-semibold px-4 py-3 text-piki">Mini-leasing</th>
            <th className="bg-gray-100 font-semibold px-4 py-3 text-piki">Kone- ja laitteleasing</th>
          </tr>
        </thead>
        <tbody>
          {leasingData.map((row, idx) => (
            <tr key={row.palvelu} className={cn("text-piki", idx % 2 === 0 ? "bg-gray-50" : "bg-white")}>
              <th className="bg-[#C49A6C] text-piki font-medium px-4 py-2 text-left sticky left-0 z-10">
                {row.palvelu}
              </th>
              <td className="text-center px-4 py-2">{renderCell(row.rahoitus)}</td>
              <td className="text-center px-4 py-2">{renderCell(row.jousto)}</td>
              <td className="text-center px-4 py-2">{renderCell(row.huolto)}</td>
              <td className="text-center px-4 py-2">{renderCell(row.mini)}</td>
              <td className="text-center px-4 py-2">{renderCell(row.kone)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CorporateLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CorporateLeasing" });

  return (
    <main className="flex min-h-screen flex-col items-center bg-white pt-24">
      <FullScreenWidthBlock className="bg-tiki px-0 lg:px-0">
        <div
          style={{ backgroundImage: "url(/images/yritysleasing.png)" }}
          className={`min-h-[500px] lg:h-[600px] w-full relative background-image-fill ${spacing.responsivePadding} flex flex-col items-left justify-end`}
        >
          <BlockPadding>
            <MaxWidthContentBlock>
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-2 lg:justify-between lg:w-full shadow-text">
                <h1 className="text-6xl font-medium text-white leading-tight lg:w-1/2">
                  {t("hero.heading")}
                  <span className="block text-5xl font-light text-white hero-text-prefixed with-shadow">
                    {t("hero.subheading")}
                  </span>
                </h1>
                <CallUs numbers={t.raw("hero.numbers")} />
              </div>
              <div className="flex shadow-text pt-10">
                <Paragraph variant="large" className="text-white">
                  {t("intro.description")}
                </Paragraph>
              </div>
            </MaxWidthContentBlock>
          </BlockPadding>
        </div>
      </FullScreenWidthBlock>

      {/* Intro Section */}
      <FullScreenWidthBlock className="bg-piki">
        <BlockPadding>
          <MaxWidthContentBlock>
            <TwoColumnCard>
              <BlockPadding className="flex flex-col bg-white rounded-xl">
                <Heading2 className="text-piki">{t("openModel.title")}</Heading2>
                <Paragraph className="text-betoni">{t("openModel.description")}</Paragraph>
                <Heading3 className="mt-6 text-piki">{t("contactPerson.title")}</Heading3>
                <Paragraph className="text-betoni">{t("contactPerson.description")}</Paragraph>
                <Heading3 className="mt-6 text-piki">{t("digitalServices.title")}</Heading3>
                <Paragraph className="text-betoni">{t("digitalServices.description")}</Paragraph>
              </BlockPadding>
              <BlockPadding className="flex flex-col bg-white rounded-xl">
                <Heading2 className="text-piki">Edut</Heading2>
                <ul className="list-disc pl-6 text-lg text-piki space-y-2">
                  <li>{t("benefits.fixedPrice")}</li>
                  <li>{t("benefits.contractPeriod")}</li>
                  <li>{t("benefits.noDownPayment")}</li>
                  <li>{t("benefits.newCar")}</li>
                </ul>
              </BlockPadding>
            </TwoColumnCard>
          </MaxWidthContentBlock>
        </BlockPadding>
      </FullScreenWidthBlock>

      {/* Leasing Types Section */}
      <FullScreenWidthBlock className="bg-maantie pb-20">
        <MaxWidthContentBlock>
          <ColumnBlock>
            <BlockPadding className="flex flex-col items-center text-center">
              <Heading2 className="text-gray-900">Leasingvaihtoehdot</Heading2>
            </BlockPadding>
          </ColumnBlock>
        </MaxWidthContentBlock>
        <MaxWidthContentBlock>
          <TwoColumnCard>
            {/* Rahoitusleasing */}
            <BlockPadding className="flex flex-col bg-white rounded-xl gap-4">
              <Heading3 className="text-kupari">{t("leasingTypes.rahoitusleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.rahoitusleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.rahoitusleasing.suits")}</Paragraph>
            </BlockPadding>
            {/* Joustoleasing */}
            <BlockPadding className="flex flex-col bg-white rounded-xl gap-4">
              <Heading3 className="text-kupari">{t("leasingTypes.joustoleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.joustoleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.joustoleasing.suits")}</Paragraph>
            </BlockPadding>
          </TwoColumnCard>
          <TwoColumnCard className="mt-8">
            {/* Huoltoleasing */}
            <BlockPadding className="flex flex-col bg-white rounded-xl gap-4">
              <Heading3 className="text-kupari">{t("leasingTypes.huoltoleasing.title")}</Heading3>
              <Paragraph className="text-betoni">{t("leasingTypes.huoltoleasing.description")}</Paragraph>
              <Paragraph className="font-semibold text-piki">{t("leasingTypes.huoltoleasing.suits")}</Paragraph>
            </BlockPadding>
            {/* Minileasing */}
            <BlockPadding className="flex flex-col bg-white rounded-xl gap-4">
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
            </BlockPadding>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullScreenWidthBlock className="bg-tiki px-0 lg:px-0">
        <BlockPadding>
          <MaxWidthContentBlock>
            <LeasingComparisonTable />
          </MaxWidthContentBlock>
        </BlockPadding>
      </FullScreenWidthBlock>

      <FullWidthContentBlockWithBg image="/images/Tietoa_meista.png" backgroundPosition="top center">
        <MaxWidthContentBlock>
          <BlockPadding>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-2 lg:justify-between lg:w-full shadow-text-sharp">
              <h1 className="text-6xl font-medium text-white leading-tight lg:w-1/2">{t("contact.title")}</h1>
            </div>
            <div className="flex shadow-text pt-10 w-1/2">
              <CallUs numbers={t.raw("hero.numbers")} />
            </div>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      {/* Equipment Leasing Section */}
      <FullScreenWidthBlock className="bg-piki">
        <MaxWidthContentBlock>
          <BlockPadding className="flex flex-col gap-4">
            <Heading2 className="text-kupari">{t("equipmentLeasing.title")}</Heading2>
            <Paragraph className="text-white">{t("equipmentLeasing.description")}</Paragraph>
            <ul className="list-disc pl-6 text-lg text-white space-y-1 mb-2">
              {t.raw("equipmentLeasing.benefits").map((b: string) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <Heading3 className="text-kupari">{t("equipmentLeasing.businessToBusiness")}</Heading3>
            <Paragraph className="text-white">{t("equipmentLeasing.b2bDescription")}</Paragraph>
            <Paragraph className="text-white">{t("equipmentLeasing.process")}</Paragraph>
            <Paragraph className="font-semibold mt-4 text-kupari">{t("equipmentLeasing.contact")}</Paragraph>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>
    </main>
  );
}
