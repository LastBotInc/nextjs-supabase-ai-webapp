"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { List } from "@/app/components/v2/core/List";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { Columns } from "@/app/components/v2/core/Columns";
import CarBenefitCalculatorClient from "./CarBenefitCalculatorClient";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LeasingCalculator.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "LeasingCalculator",
    path: "/leasing-laskuri",
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations("LeasingCalculator");

  // Extract structured data
  const hero = t.raw("hero");
  const intro = t.raw("intro");
  const calculator = t.raw("calculator");
  const optimizationTips = t.raw("optimizationTips");
  const taxInfo = t.raw("taxInfo");
  const cta = t.raw("cta");
  const faq = t.raw("faq");

  return (
    <PageWrapper>
      {/* HERO SECTION */}
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
      </Hero>

      {/* INTRO SECTION */}
      <BasicLayout contentPalette="beige">
        <Heading2>{intro.title}</Heading2>
        <Paragraph>{intro.description}</Paragraph>
        <LinkButton href="#calculator">{intro.getStarted}</LinkButton>
      </BasicLayout>

      {/* CALCULATOR SECTION */}
      <BasicLayout id="calculator" contentPalette="default">
        <Heading2>{calculator.title}</Heading2>
        <Paragraph>{calculator.description}</Paragraph>

        {/* Render the client component for the interactive calculator */}
        <CarBenefitCalculatorClient
          locale={locale}
          translations={{
            calculatorTab: {
              selectBenefitType: calculator.selectBenefitType,
              free: calculator.tabs.free,
              limited: calculator.tabs.limited,
            },
            inputs: {
              title: calculator.inputs.title,
              carValue: calculator.inputs.carValue,
              annualDriving: calculator.inputs.annualDriving,
              homeToWork: calculator.inputs.homeToWork,
              monthlyCost: calculator.inputs.monthlyCost,
            },
            results: {
              title: calculator.results.title,
              monthlyTitle: calculator.results.monthlyTitle,
              annualTitle: calculator.results.annualTitle,
              employerCost: calculator.results.employerCost,
              employeeCost: calculator.results.employeeCost,
              taxBenefit: calculator.results.taxBenefit,
              totalCost: calculator.results.totalCost,
              freeBenefit: {
                description: calculator.freeBenefit.description,
                advantages: calculator.freeBenefit.advantages,
                advantage1: calculator.freeBenefit.advantage1,
                advantage2: calculator.freeBenefit.advantage2,
                advantage3: calculator.freeBenefit.advantage3,
                considerations: calculator.freeBenefit.considerations,
                consideration1: calculator.freeBenefit.consideration1,
                consideration2: calculator.freeBenefit.consideration2,
                consideration3: calculator.freeBenefit.consideration3,
              },
              limitedBenefit: {
                description: calculator.limitedBenefit.description,
                advantages: calculator.limitedBenefit.advantages,
                advantage1: calculator.limitedBenefit.advantage1,
                advantage2: calculator.limitedBenefit.advantage2,
                advantage3: calculator.limitedBenefit.advantage3,
                considerations: calculator.limitedBenefit.considerations,
                consideration1: calculator.limitedBenefit.consideration1,
                consideration2: calculator.limitedBenefit.consideration2,
                consideration3: calculator.limitedBenefit.consideration3,
              },
              callToAction: calculator.callToAction,
            },
          }}
        />
      </BasicLayout>

      {/* OPTIMIZATION TIPS SECTION */}
      <BasicLayout contentPalette="beige">
        <Heading2>{optimizationTips.title}</Heading2>
        <Columns columns={{ default: 1, md: 2 }}>
          {optimizationTips.tips?.map((tip: { title: string; description: string }, index: number) => (
            <Card key={index}>
              <Heading3>{tip.title}</Heading3>
              <Paragraph>{tip.description}</Paragraph>
            </Card>
          ))}
        </Columns>
      </BasicLayout>

      {/* TAX INFORMATION SECTION */}
      <BasicLayout contentPalette="default">
        <Heading2>{taxInfo.title}</Heading2>
        <Paragraph>{taxInfo.description}</Paragraph>
        <Paragraph>{taxInfo.disclaimer}</Paragraph>

        <TwoColumnLayout>
          <FlexLayout.Column>
            <Heading3>{taxInfo.freeBenefit.title}</Heading3>
            <Paragraph>{taxInfo.freeBenefit.formula}</Paragraph>
            <Paragraph>{taxInfo.freeBenefit.baseValues}</Paragraph>
            <List>
              <List.Item>{taxInfo.freeBenefit.ageGroups.group1}</List.Item>
              <List.Item>{taxInfo.freeBenefit.ageGroups.group2}</List.Item>
              <List.Item>{taxInfo.freeBenefit.ageGroups.group3}</List.Item>
            </List>
          </FlexLayout.Column>
          <FlexLayout.Column>
            <Heading3>{taxInfo.limitedBenefit.title}</Heading3>
            <Paragraph>{taxInfo.limitedBenefit.formula}</Paragraph>
            <Paragraph>{taxInfo.limitedBenefit.baseValues}</Paragraph>
            <List>
              <List.Item>{taxInfo.limitedBenefit.ageGroups.group1}</List.Item>
              <List.Item>{taxInfo.limitedBenefit.ageGroups.group2}</List.Item>
              <List.Item>{taxInfo.limitedBenefit.ageGroups.group3}</List.Item>
            </List>
          </FlexLayout.Column>
        </TwoColumnLayout>

        <Card>
          <Heading3>{taxInfo.electricVehicles.title}</Heading3>
          <Paragraph>{taxInfo.electricVehicles.description}</Paragraph>
        </Card>
      </BasicLayout>

      {/* FAQ SECTION */}
      <BasicLayout contentPalette="beige">
        <Heading2>{faq.title}</Heading2>
        <Accordion>
          {faq.questions?.map((item: { question: string; answer: string }, index: number) => (
            <Accordion.Item key={index} heading={item.question}>
              <Paragraph>{item.answer}</Paragraph>
            </Accordion.Item>
          ))}
        </Accordion>
      </BasicLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{cta.title}</Heading2>
        <Paragraph>{cta.description}</Paragraph>
        <LinkButton href={`/${locale}/yhteystiedot`}>{cta.contactButton}</LinkButton>
        <LinkButton href={`/${locale}/autoleasing`}>{cta.learnMoreButton}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
