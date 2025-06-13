"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CarRental" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/auton-vuokraus`,
    },
  };
}

export default async function CarRentalPage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CarRental" });

  // CTA section
  const ctaTitle = t("cta.title");
  const ctaDescription = t("cta.description");
  const ctaButton = t("cta.button");

  return (
    <PageWrapper>
      {/* Minileasing Section */}
      <TwoColumnLayout>
        <FlexLayout.Column>
          <Heading2>{t("minileasing.title")}</Heading2>
          <Paragraph>{t("minileasing.description")}</Paragraph>
          <List>
            {t.raw("minileasing.list").map((item: string, idx: number) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
          <Heading3>{t("minileasing.examplesTitle")}</Heading3>
          <List>
            {t.raw("minileasing.examples").map((item: string, idx: number) => (
              <List.Item key={idx}>{item}</List.Item>
            ))}
          </List>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage width="large" height="max" src="/images/cropped_demo2.png" useMask className="self-end" />
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* CTA Section */}
      <BasicLayout palette="piki">
        <Heading2>{ctaTitle}</Heading2>
        <Paragraph className="mt-2 mb-6">{ctaDescription}</Paragraph>
        <LinkButton href={`/${locale}/yhteydenotto`}>{ctaButton}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
