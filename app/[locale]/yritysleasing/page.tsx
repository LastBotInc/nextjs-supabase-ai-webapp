"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { CallUs } from "@/app/components/CallUs";
import { Paragraph } from "@/app/components/core/Paragraph";
import React from "react";
import { cn } from "@/utils/cn";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { Heading2, Heading3 } from "@/app/components/core/Headings";
import { CheckIcon } from "@heroicons/react/24/outline";
import { List } from "@/app/components/core/List";
import { PageWrapper } from "@/app/components/core/PageWrapper";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Flex } from "@/app/components/v2/core/Flex";
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
      <div className="flex flex-col gap-4 p-6">
        <span className="text-sm palette-text-color">* Selite kohdalle X</span>
        <span className="text-sm palette-text-color">** Selite toiselle kohdalle Y</span>
      </div>
    </div>
  );
}

export default async function CorporateLeasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CorporateLeasing" });

  return (
    <PageWrapper>
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
      <FlexLayout oneColumnBreakpoint="lg" palette="default">
        <FlexLayout.Column>
          <Heading2>{t("openModel.title")}</Heading2>
          <Paragraph>{t("openModel.description")}</Paragraph>
          <Heading2>{t("contactPerson.title")}</Heading2>
          <Paragraph>{t("contactPerson.description")}</Paragraph>
          <Heading2>{t("digitalServices.title")}</Heading2>
          <Paragraph>{t("digitalServices.description")}</Paragraph>

          <Heading2>Edut</Heading2>
          <List>
            <List.Item>{t("benefits.fixedPrice")}</List.Item>
            <List.Item>{t("benefits.contractPeriod")}</List.Item>
            <List.Item>{t("benefits.noDownPayment")}</List.Item>
            <List.Item>{t("benefits.newCar")}</List.Item>
          </List>
        </FlexLayout.Column>
      </FlexLayout>

      <BoxLayout palette="light-gray" fullSizeBoxes={true}>
        <BoxLayout.Box palette="maantie" gaps>
          <Heading2>{t("leasingTypes.rahoitusleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.rahoitusleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.rahoitusleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="kupari" gaps>
          <Heading2>{t("leasingTypes.joustoleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.joustoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.joustoleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="piki" gaps>
          <Heading2>{t("leasingTypes.huoltoleasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.huoltoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.huoltoleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="betoni">
          <Heading2>{t("leasingTypes.minileasing.title")}</Heading2>
          <Paragraph>{t("leasingTypes.minileasing.description")}</Paragraph>
          <List>
            {t.raw("leasingTypes.minileasing.benefits").map((b: string) => (
              <List.Item key={b}>{b}</List.Item>
            ))}
          </List>
          <Paragraph className="font-semibold">Täydellinen ratkaisu mm.:</Paragraph>
          <List>
            {t.raw("leasingTypes.minileasing.perfectFor").map((b: string) => (
              <List.Item key={b}>{b}</List.Item>
            ))}
          </List>
        </BoxLayout.Box>
      </BoxLayout>

      <BoxLayout palette="default" fullSizeBoxes={false} maxColumns={1}>
        <BoxLayout.Box>
          <LeasingComparisonTable />
        </BoxLayout.Box>
      </BoxLayout>

      {/* Equipment Leasing Section */}

      <FlexLayout palette="piki">
        <FlexLayout.Column>
          <Heading2 className="color-kupari-heading">{t("equipmentLeasing.title")}</Heading2>
          <Paragraph>{t("equipmentLeasing.description")}</Paragraph>
          <List>
            {t.raw("equipmentLeasing.benefits").map((b: string) => (
              <List.Item key={b}>{b}</List.Item>
            ))}
          </List>
          <Heading3 className="color-kupari-heading">{t("equipmentLeasing.businessToBusiness")}</Heading3>
          <Paragraph>{t("equipmentLeasing.b2bDescription")}</Paragraph>
          <Paragraph>{t("equipmentLeasing.process")}</Paragraph>
          <Paragraph className="font-semibold">{t("equipmentLeasing.contact")}</Paragraph>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout palette="piki" mainImage={{ src: "/images/Tietoa_meista.png", backgroundPosition: "top center" }}>
        <FlexLayout.Column className="shadow-text-sharp">
          <Flex direction="column" gaps="large">
            <Heading2 className="max-w-2xl">{t("contact.title")}</Heading2>
            <Heading3 className="max-w-2xl">{t("contact.subheading")}</Heading3>
            <div className="self-start">
              <CallUs className="justify-self-start" numbers={t.raw("hero.numbers")} />
            </div>
          </Flex>
        </FlexLayout.Column>
      </FlexLayout>
    </PageWrapper>
  );
}
