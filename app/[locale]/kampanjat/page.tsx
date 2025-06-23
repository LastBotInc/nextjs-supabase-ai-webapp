"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { GridLayout } from "@/app/components/v2/layouts/GridLayout";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { List } from "@/app/components/v2/core/List";
import { ImagePlaceholder } from "@/app/components/v2/components/ImagePlaceholder";
import { Padding } from "@/app/components/v2/core/types";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Campaigns.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

// Sample campaign data
const campaigns = [
  {
    id: "ford-transit",
    title: "Ford Transit Connect",
    tagline: "Limited Stock",
    image: "/images/ford-transit.webp",
    price: "399",
    tags: ["Van", "Diesel"],
    features: ["Bluetooth", "GPS", "Reverse Camera", "Climate Control"],
  },
  {
    id: "polestar-2",
    title: "Polestar 2",
    tagline: "All-Electric",
    image: "/images/polestar-2.webp",
    price: "499",
    tags: ["Electric", "AWD"],
    features: ["Autopilot", "Smartphone Integration", "Premium Sound", "Leather Interior"],
  },
  {
    id: "volvo-xc40",
    title: "Volvo XC40 Recharge",
    tagline: "New Arrival",
    image: "/images/placeholder-car.webp",
    price: "579",
    tags: ["SUV", "Electric"],
    features: ["AWD", "Safety Package", "Panoramic Roof", "Heated Seats"],
  },
  {
    id: "skoda-enyaq",
    title: "Škoda Enyaq iV",
    tagline: "Business Edition",
    image: "/images/placeholder-car.webp",
    price: "449",
    tags: ["SUV", "Electric"],
    features: ["80 kWh Battery", "LED Matrix Headlights", "Adaptive Cruise Control", "Canton Sound System"],
  },
];

export default async function CampaignsPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Campaigns" });

  return (
    <PageWrapper>
      <Hero isFirst>
        <Hero.Image src={t("hero.image.src")} />
        <Hero.Heading>{t("hero.title")}</Hero.Heading>
        <Hero.Text>
          <Paragraph variant="large">{t("hero.intro")}</Paragraph>
        </Hero.Text>
      </Hero>

      <GridLayout columns={{ default: 1, md: 2 }} gaps="large">
        {campaigns.map((campaign) => (
          <GridLayout.Column key={campaign.id}>
            <Card palette="light-gray" className="h-full flex flex-col" padding="none" contentPadding={Padding.Full}>
              <ImagePlaceholder aspectRatio="4:3" />
              <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {campaign.tagline}
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <Heading3>{campaign.title}</Heading3>
                  <Paragraph className="text-amber-600 font-bold text-lg">
                    {t("from")} {campaign.price}€/{t("month")}
                  </Paragraph>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {campaign.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <List className="mb-6">
                  {campaign.features.map((feature) => (
                    <List.Item key={feature} className="flex items-center">
                      <svg
                        className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </List.Item>
                  ))}
                </List>
              </div>

              <LinkButton href={`/${locale}/kampanjat/${campaign.id}`} className="mt-auto">
                {t("view_offer")}
              </LinkButton>
            </Card>
          </GridLayout.Column>
        ))}
      </GridLayout>

      <BasicLayout palette="beige">
        <Heading2>{t("cta.title")}</Heading2>
        <Paragraph variant="large">{t("cta.description")}</Paragraph>
        <LinkButton href={`/${locale}/yhteystiedot`}>{t("cta.button")}</LinkButton>
      </BasicLayout>
    </PageWrapper>
  );
}
