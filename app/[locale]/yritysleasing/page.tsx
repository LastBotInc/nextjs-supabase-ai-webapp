"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { CallUs } from "@/app/components/v2/components/CallUs";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import React from "react";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";
import { List } from "@/app/components/v2/core/List";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Flex } from "@/app/components/v2/core/Flex";
import { Table } from "@/app/components/v2/core/Table";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Padding } from "@/app/components/v2/core/types";

function LeasingComparisonTable() {
  // Leasing comparison table for Finnish market
  const leasingData = [
    {
      palvelu: "Oma yhteyshenkilö",
      rahoitus: "+",
      jousto: "+",
      huolto: "+",
      mini: "+",
      kone: "+",
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
      rahoitus: "-",
      jousto: "+",
      huolto: "+",
      mini: "+",
      kone: "-",
    },
    {
      palvelu: "Renkaiden uusinnat",
      rahoitus: "-",
      jousto: "+",
      huolto: "+",
      mini: "+",
      kone: "-",
    },
    {
      palvelu: "Rengashotelli & vaihdot",
      rahoitus: "-",
      jousto: "+",
      huolto: "+",
      mini: "+",
      kone: "-",
    },
    {
      palvelu: "Sopimuskilometrit",
      rahoitus: "Avoin",
      jousto: "Budjetoitu",
      huolto: "Kiinteä",
      mini: "Suljettu",
      kone: "-",
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
      kone: "-",
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
      mini: "-",
      kone: "Pääomatasauksella",
    },
    {
      palvelu: "Käytetty ajoneuvo",
      rahoitus: "+",
      jousto: "+",
      huolto: "+",
      mini: "+",
      kone: "-",
    },
  ];
  return (
    <Table
      headings={[
        "Palvelut",
        "Rahoitusleasing",
        "Joustoleasing",
        "Huoltoleasing",
        "Mini-leasing",
        "Kone- ja laitteleasing",
      ]}
      rows={leasingData.map((row) => [row.palvelu, row.rahoitus, row.jousto, row.huolto, row.mini, row.kone])}
      explanations={["Selite kohdalle", "Selite toiselle kohdalle"]}
    />
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
      <FlexLayout oneColumnBreakpoint="lg" palette="default" className="with-overflowing-image">
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
        <FlexLayout.Column>
          <DecorativeImage
            width="large"
            height="overflow-paddings"
            src="/images/cropped_demo.png"
            useMask
            className="self-end"
          />
        </FlexLayout.Column>
      </FlexLayout>

      <BoxLayout palette="light-gray" fullSizeBoxes={true}>
        <BoxLayout.Box palette="maantie" gaps>
          <Heading3>{t("leasingTypes.rahoitusleasing.title")}</Heading3>
          <Paragraph>{t("leasingTypes.rahoitusleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.rahoitusleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="kupari" gaps>
          <Heading3>{t("leasingTypes.joustoleasing.title")}</Heading3>
          <Paragraph>{t("leasingTypes.joustoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.joustoleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="piki" gaps>
          <Heading3>{t("leasingTypes.huoltoleasing.title")}</Heading3>
          <Paragraph>{t("leasingTypes.huoltoleasing.description")}</Paragraph>
          <Paragraph className="font-semibold">{t("leasingTypes.huoltoleasing.suits")}</Paragraph>
        </BoxLayout.Box>
        <BoxLayout.Box palette="betoni">
          <Heading3>{t("leasingTypes.minileasing.title")}</Heading3>
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

      <BasicLayout palette="default" padding={Padding.None} contentPadding={Padding.Block}>
        <FlexLayout.Column>
          <LeasingComparisonTable />
        </FlexLayout.Column>
      </BasicLayout>

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
