"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { CallUs } from "@/app/components/CallUs";
import { Paragraph } from "@/app/components/core/Paragraph";
import React from "react";
import { cn } from "@/utils/cn";
import { Hero } from "@/app/components/Hero/Hero";
import { Heading2, Heading3 } from "@/app/components/core/Headings";
import { InnerBoxes } from "@/app/components/block/InnerBoxes";
import { CheckIcon } from "@heroicons/react/24/outline";
import { CustomizableBlock } from "@/app/components/block/CustomizableBlock";
import { ContentContainer } from "@/app/components/core/ContentContainer";
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
      <span aria-label="Kyllä" title="Kyllä" className="text-green-600 flex items-center justify-center">
        <CheckIcon className="w-6 h-6" strokeWidth={4} />
      </span>
    );
  if (value === false)
    return (
      <span aria-label="Ei" title="Ei" className=" text-2xl">
        -
      </span>
    );
  return <span>{value}</span>;
};

function LeasingComparisonTable() {
  return (
    <div className="overflow-x-auto  custom-table">
      <table className="min-w-full border-collapse rounded-xl">
        <thead>
          <tr>
            <th className=" sticky left-0 z-10">Palvelut</th>
            <th>Rahoitusleasing</th>
            <th>Joustoleasing</th>
            <th>Huoltoleasing</th>
            <th>Mini-leasing</th>
            <th>Kone- ja laitteleasing</th>
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
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src="/images/yritysleasing.png" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.Text>
          <Paragraph variant="large">{t("intro.description")}</Paragraph>
        </Hero.Text>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      {/* Intro Section */}
      <InnerBoxes palette="piki">
        <InnerBoxes.Box palette="default">
          <Heading2>{t("openModel.title")}</Heading2>
          <Paragraph>{t("openModel.description")}</Paragraph>
          <Heading2>{t("contactPerson.title")}</Heading2>
          <Paragraph>{t("contactPerson.description")}</Paragraph>
          <Heading2>{t("digitalServices.title")}</Heading2>
          <Paragraph>{t("digitalServices.description")}</Paragraph>

          <Heading2>Edut</Heading2>
          <ul className="list-disc pl-6 palette-text-color">
            <li>{t("benefits.fixedPrice")}</li>
            <li>{t("benefits.contractPeriod")}</li>
            <li>{t("benefits.noDownPayment")}</li>
            <li>{t("benefits.newCar")}</li>
          </ul>
        </InnerBoxes.Box>
      </InnerBoxes>

      <InnerBoxes palette="light-gray">
        <InnerBoxes.Box palette="maantie">
          <Heading2>{t("leasingTypes.rahoitusleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.rahoitusleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.rahoitusleasing.suits")}</Paragraph>
        </InnerBoxes.Box>
        <InnerBoxes.Box palette="kupari">
          <Heading2>{t("leasingTypes.joustoleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.joustoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.joustoleasing.suits")}</Paragraph>
        </InnerBoxes.Box>
        <InnerBoxes.Box palette="piki">
          <Heading2>{t("leasingTypes.huoltoleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.huoltoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.huoltoleasing.suits")}</Paragraph>
        </InnerBoxes.Box>
        <InnerBoxes.Box palette="betoni">
          <Heading2>{t("leasingTypes.minileasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.minileasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.minileasing.suits")}</Paragraph>
          <ul className="list-disc palette-text-color">
            {t.raw("leasingTypes.minileasing.benefits").map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Paragraph className="font-semibold">Täydellinen ratkaisu mm.:</Paragraph>
          <ul className="list-disc palette-text-color">
            {t.raw("leasingTypes.minileasing.perfectFor").map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </InnerBoxes.Box>
      </InnerBoxes>

      <CustomizableBlock>
        <ContentContainer noSpacing>
          <LeasingComparisonTable />
        </ContentContainer>
      </CustomizableBlock>

      {/* Equipment Leasing Section */}

      <CustomizableBlock palette="piki">
        <ContentContainer asBlock palette="piki">
          <Heading2 className="color-kupari-heading">{t("equipmentLeasing.title")}</Heading2>
          <Paragraph>{t("equipmentLeasing.description")}</Paragraph>
          <ul className="list-disc pl-6 color-palette-text-color">
            {t.raw("equipmentLeasing.benefits").map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Heading3 className="color-kupari-heading">{t("equipmentLeasing.businessToBusiness")}</Heading3>
          <Paragraph>{t("equipmentLeasing.b2bDescription")}</Paragraph>
          <Paragraph>{t("equipmentLeasing.process")}</Paragraph>
          <Paragraph className="font-semibold">{t("equipmentLeasing.contact")}</Paragraph>
        </ContentContainer>
      </CustomizableBlock>

      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src="/images/Tietoa_meista.png" backgroundPosition="top center" />
        <Hero.Heading>{t("contact.title")}</Hero.Heading>
        <Hero.Text>
          <Heading2 className="pb-20 max-w-2xl">{t("contact.subheading")}</Heading2>
        </Hero.Text>

        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>
    </main>
  );
}
