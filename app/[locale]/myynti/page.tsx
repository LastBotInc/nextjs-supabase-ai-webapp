"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { Card } from "@/app/components/v2/core/Card";
import { PersonnelCard } from "@/app/components/v2/components/PersonnelCard";
import { generateLocalizedMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sales.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale,
    namespace: "Sales",
    path: "/myynti",
  });
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function SalesPage({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const salesT = await getTranslations("Sales");
  const homeT = await getTranslations("Home");

  // Get translation data
  const intro = salesT.raw("intro");
  const services = salesT.raw("services");
  const process = salesT.raw("process");
  const contact = salesT.raw("contact");

  // Get personnel data from Home.json
  const personnel = homeT.raw("personnel");

  return (
    <PageWrapper>
      {/* Introduction Section */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{intro.heading}</Heading2>
        {intro.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx} variant="large">
            {text}
          </Paragraph>
        ))}
      </BasicLayout>

      {/* Services Section */}
      <BasicLayout contentPalette="beige">
        <Heading2>{services.heading}</Heading2>
        {services.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <List>
          {services.list?.map((item: string, idx: number) => (
            <List.Item key={idx}>{item}</List.Item>
          ))}
        </List>
      </BasicLayout>

      {/* Process Section */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{process.heading}</Heading2>
        {process.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {process.steps?.map((step: { title: string; texts: string[] }, idx: number) => (
            <Card key={idx} palette="beige" className="text-center">
              <div className="text-3xl font-bold text-kupari mb-4">{idx + 1}</div>
              <Heading3 className="mb-4">{step.title}</Heading3>
              {step.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx}>{text}</Paragraph>
              ))}
            </Card>
          ))}
        </div>
      </BasicLayout>

      {/* Personnel Section */}
      <FlexLayout oneColumnBreakpoint="xl" palette="default">
        <FlexLayout.FixedWidthColumn width={{ default: "100%", md: "100%", lg: "100%", xl: "40%" }}>
          <Heading2>Tapaa myyntitiimimme</Heading2>
        </FlexLayout.FixedWidthColumn>
        <FlexLayout.Column>
          <PersonnelCard people={personnel} />
        </FlexLayout.Column>
      </FlexLayout>

      {/* Contact Section */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{contact.heading}</Heading2>
        {contact.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {contact.methods?.map((method: { type: string; value: string; description: string }, idx: number) => (
            <Card key={idx} palette="beige">
              <Heading3>{method.type}</Heading3>
              <div className="text-xl font-bold text-kupari mb-2">{method.value}</div>
              <Paragraph variant="small">{method.description}</Paragraph>
            </Card>
          ))}
        </div>
      </BasicLayout>
    </PageWrapper>
  );
}
