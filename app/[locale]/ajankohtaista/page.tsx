"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Button } from "@/app/components/v2/core/Button";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { GridLayout } from "@/app/components/v2/layouts/GridLayout";
import { Heading2 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { List } from "@/app/components/v2/core/List";
import Image from "next/image";
import { NewsCard } from "@/app/components/v2/components/NewsCard";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Columns } from "@/app/components/v2/core/Columns";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "CurrentTopics.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CustomerServicePage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CurrentTopics" });

  // Prepare featured news results array
  const featuredResults = [
    { stat: t("featured.results.stat1"), label: t("featured.results.label1") },
    { stat: t("featured.results.stat2"), label: t("featured.results.label2") },
    { stat: t("featured.results.stat3"), label: t("featured.results.label3") },
  ];

  // Prepare stories array
  const stories = [1, 2, 3, 4, 5, 6].map((i) => ({
    company: t(`stories.story${i}.company`),
    title: t(`stories.story${i}.title`),
    industry: t(`stories.story${i}.industry`),
    excerpt: t(`stories.story${i}.excerpt`),
    link: undefined, // Add links if available
  }));

  // Prepare industries and sort options
  const industries = Object.entries(t.raw("filters.industries")).map(([value, label]) => ({
    value,
    label: label as string,
  }));

  return (
    <PageWrapper>
      {/* Hero Section */}
      <FlexLayout fullWidth isFirst palette="piki" direction="column">
        <FlexLayout.Column>
          <Heading2>{t("hero.heading")}</Heading2>
          <Paragraph>{t("hero.subheading")}</Paragraph>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Featured News Section */}
      <BasicLayout>
        <FlexLayout direction="column">
          <FlexLayout.Column>
            <Paragraph>{t("featured.label")}</Paragraph>
            <Paragraph>{t("featured.company")}</Paragraph>
            <Heading2>{t("featured.title")}</Heading2>
            <Paragraph>{t("featured.summary")}</Paragraph>
            <blockquote>{t("featured.quote")}</blockquote>
            <Paragraph>{t("featured.personName")}</Paragraph>
            <Paragraph>{t("featured.personTitle")}</Paragraph>
            <LinkButton href={t("featured.readMoreHref")}>{"Lue lisää"}</LinkButton>
          </FlexLayout.Column>
          <FlexLayout.Column>
            <List className="mt-4">
              {featuredResults.map((r, i) => (
                <List.Item key={i}>
                  <span className="font-bold text-lg">{r.stat}</span> <span className="text-sm">{r.label}</span>
                </List.Item>
              ))}
            </List>
          </FlexLayout.Column>
        </FlexLayout>
      </BasicLayout>

      {/* Testimonial Section */}

      {/* Stories Section */}
      <BasicLayout>
        <Heading2>{t("storiesSection.title")}</Heading2>
        {t("storiesSection.description") && <Paragraph>{t("storiesSection.description")}</Paragraph>}
        {/* Stories Grid */}
        <Columns columns={{ default: 1, md: 2, lg: 3 }} gaps="large" padding="none" contentPadding="none">
          {stories.map((story, i) => (
            <NewsCard
              key={i}
              title={story.title}
              text={story.excerpt}
              image={{ src: "/images/home/fbd9d9f2eb685db6d67715917cb19f5c86abb4d8.png", alt: story.title }}
              category={story.company}
              link={story.link ? { href: story.link, text: "Lue lisää" } : undefined}
            />
          ))}
        </Columns>
        <Button>{"Näytä lisää"}</Button>
      </BasicLayout>

      {/* CTA Section */}
      <BasicLayout palette="piki">
        <FlexLayout.Column>
          <Card palette="piki" className="testimonial-card">
            <blockquote className="text-4xl italic border-l-4 border-kupari pl-4 my-2">
              {t("testimonial.quote")}
            </blockquote>
            <Paragraph className="text-2xl font-semibold mt-2">{t("testimonial.author")}</Paragraph>
            <Paragraph className="text-xs text-gray-500">{t("testimonial.position")}</Paragraph>
          </Card>
          <Heading2>{t("cta.title")}</Heading2>
          <Paragraph className="mb-4">{t("cta.description")}</Paragraph>
          <LinkButton href={t("cta.buttonHref")} className="mt-2">
            {t("cta.buttonText")}
          </LinkButton>
        </FlexLayout.Column>
      </BasicLayout>
    </PageWrapper>
  );
}
