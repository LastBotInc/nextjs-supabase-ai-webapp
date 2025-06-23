"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { generateLocalizedMetadata } from "@/utils/metadata";


export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Template.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale: params.locale,
    namespace: "Template",
    path: "/template",
  });
}

export default async function Page({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Template" });


  return (
    <PageWrapper>
      {/* Content blocks here */}
      <h1>{t("heading")}</h1>
    </PageWrapper>
  );
}
