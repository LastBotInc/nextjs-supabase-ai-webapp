"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Metadata } from "next";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Flex } from "@/app/components/v2/core/Flex";
import LeasingCalculator from "@/app/components/v2/components/LeasingCalculator";
import CarBenefitCalculatorClient from "@/app/[locale]/leasing-laskuri/CarBenefitCalculatorClient";
import { generateLocalizedMetadata } from "@/utils/metadata";

// Define generateMetadata directly in the server component
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Calculators.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "Calculators",
    path: "/laskurit",
  });
}

// Make the page component async
export default async function CalculatorsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  await setupServerLocale(locale);

  // Get translations for all content
  const tCalculators = await getTranslations({ locale, namespace: "Calculators" });
  const tCarLeasing = await getTranslations({ locale, namespace: "CarLeasing" });
  const tLeasingCalculator = await getTranslations({ locale, namespace: "LeasingCalculator" });

  // Extract structured data for main content
  const section1 = tCalculators.raw("section1");

  const cta = tCalculators.raw("cta");
  const additionalCta = tCalculators.raw("additionalCta");

  // Extract structured data for calculators
  const leasingCalculator = tCarLeasing.raw("calculator");
  const benefitCalculator = tLeasingCalculator.raw("calculator");

  return (
    <PageWrapper>
      {/* Main Introduction Section */}
      <BasicLayout contentPalette="default">
        <Heading2>{section1.heading}</Heading2>
        {section1.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
      </BasicLayout>

      {/* Leasing Calculator Section */}
      <FlexLayout palette="default" direction="column">
        <FlexLayout.Column>
          <Heading2>{leasingCalculator.heading}</Heading2>
          {leasingCalculator.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          <LeasingCalculator texts={leasingCalculator.fields} />
        </FlexLayout.Column>
      </FlexLayout>

      {/* Car Benefit Calculator Section */}
      <BasicLayout contentPalette="beige">
        <Heading2>{benefitCalculator.title}</Heading2>
        <Paragraph>{benefitCalculator.description}</Paragraph>

        {/* Render the client component for the interactive calculator */}
        <CarBenefitCalculatorClient
          locale={locale}
          translations={{
            calculatorTab: {
              selectBenefitType: benefitCalculator.selectBenefitType,
              free: benefitCalculator.tabs.free,
              limited: benefitCalculator.tabs.limited,
            },
            inputs: {
              title: benefitCalculator.inputs.title,
              carValue: benefitCalculator.inputs.carValue,
              annualDriving: benefitCalculator.inputs.annualDriving,
              homeToWork: benefitCalculator.inputs.homeToWork,
              monthlyCost: benefitCalculator.inputs.monthlyCost,
            },
            results: {
              title: benefitCalculator.results.title,
              monthlyTitle: benefitCalculator.results.monthlyTitle,
              annualTitle: benefitCalculator.results.annualTitle,
              employerCost: benefitCalculator.results.employerCost,
              employeeCost: benefitCalculator.results.employeeCost,
              taxBenefit: benefitCalculator.results.taxBenefit,
              totalCost: benefitCalculator.results.totalCost,
              freeBenefit: {
                description: benefitCalculator.freeBenefit.description,
                advantages: benefitCalculator.freeBenefit.advantages,
                advantage1: benefitCalculator.freeBenefit.advantage1,
                advantage2: benefitCalculator.freeBenefit.advantage2,
                advantage3: benefitCalculator.freeBenefit.advantage3,
                considerations: benefitCalculator.freeBenefit.considerations,
                consideration1: benefitCalculator.freeBenefit.consideration1,
                consideration2: benefitCalculator.freeBenefit.consideration2,
                consideration3: benefitCalculator.freeBenefit.consideration3,
              },
              limitedBenefit: {
                description: benefitCalculator.limitedBenefit.description,
                advantages: benefitCalculator.limitedBenefit.advantages,
                advantage1: benefitCalculator.limitedBenefit.advantage1,
                advantage2: benefitCalculator.limitedBenefit.advantage2,
                advantage3: benefitCalculator.limitedBenefit.advantage3,
                considerations: benefitCalculator.limitedBenefit.considerations,
                consideration1: benefitCalculator.limitedBenefit.consideration1,
                consideration2: benefitCalculator.limitedBenefit.consideration2,
                consideration3: benefitCalculator.limitedBenefit.consideration3,
              },
              callToAction: benefitCalculator.callToAction,
            },
          }}
        />
      </BasicLayout>

      {/* Main CTA Section */}
      <BasicLayout contentPalette="piki">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
      </BasicLayout>

      {/* Additional CTA Section */}
      <BasicLayout contentPalette="maantie">
        <Flex direction="row" gaps="large">
          <Card palette="beige">
            <Heading3>{additionalCta.calculator.heading}</Heading3>
            <Paragraph>{additionalCta.calculator.text}</Paragraph>
            <LinkButton href={`/${locale}/leasing-laskuri`}>{additionalCta.calculator.buttonText}</LinkButton>
          </Card>
          <Card palette="beige">
            <Heading3>{additionalCta.carLeasing.heading}</Heading3>
            <Paragraph>{additionalCta.carLeasing.text}</Paragraph>
            <LinkButton href={`/${locale}/autoleasing`}>{additionalCta.carLeasing.buttonText}</LinkButton>
          </Card>
          <Card palette="beige">
            <Heading3>{additionalCta.contact.heading}</Heading3>
            <Paragraph>{additionalCta.contact.text}</Paragraph>
            <LinkButton href={`/${locale}/yhteystiedot`}>{additionalCta.contact.buttonText}</LinkButton>
          </Card>
        </Flex>
      </BasicLayout>
    </PageWrapper>
  );
}
