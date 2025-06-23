"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { GridLayout } from "@/app/components/v2/layouts/GridLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { Flex } from "@/app/components/v2/core/Flex";
import { ImagePlaceholder } from "@/app/components/v2/components/ImagePlaceholder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CustomerStories.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [t("image")],
    },
    keywords: t("keywords"),
  };
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CustomerStoriesPage({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations("CustomerStories");

  // Get translation data
  const hero = t.raw("hero");
  const featured = t.raw("featured");
  const testimonial = t.raw("testimonial");
  const storiesSection = t.raw("storiesSection");
  const stories = t.raw("stories");
  const filters = t.raw("filters");
  const promotion = t.raw("promotion");
  const cta = t.raw("cta");

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero isFirst fullWidth>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
      </Hero>

      {/* Featured Story Section */}
      <BasicLayout contentPalette="light-gray">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Featured story image */}
            <div className="relative h-[300px] md:h-auto">
              <ImagePlaceholder aspectRatio="4:3" />
              <div className="absolute top-0 left-0 bg-kupari text-white px-4 py-2 text-sm font-medium">
                {featured.label}
              </div>
            </div>

            {/* Featured story content */}
            <div className="p-8 flex flex-col">
              <div className="flex items-center mb-4">
                <Heading3>{featured.company}</Heading3>
              </div>

              <Heading2 className="mb-4">{featured.heading}</Heading2>

              {featured.texts?.map((text: string, idx: number) => (
                <Paragraph key={idx} className="mb-6">
                  {text}
                </Paragraph>
              ))}

              {/* Results section */}
              <div className="flex flex-wrap gap-6 mb-6">
                {featured.results?.map((result: { stat: string; label: string }, index: number) => (
                  <div key={index} className="flex-1 min-w-[120px]">
                    <div className="text-2xl font-bold text-kupari">{result.stat}</div>
                    <div className="text-sm text-gray-600">{result.label}</div>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-kupari pl-4 italic text-gray-700 mb-6">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>

              <div className="flex items-center mt-auto">
                <div className="h-12 w-12 relative mr-3 rounded-full overflow-hidden">
                  <ImagePlaceholder aspectRatio="4:3" />
                </div>
                <div>
                  <div className="font-medium text-piki">{featured.personName}</div>
                  <div className="text-sm text-gray-600">{featured.personTitle}</div>
                </div>
              </div>

              {featured.link && (
                <LinkButton href={featured.link.href} className="mt-8">
                  {featured.link.label}
                </LinkButton>
              )}
            </div>
          </div>
        </div>
      </BasicLayout>

      {/* Testimonial Section */}
      <BasicLayout palette="beige" className="has-overlay-pattern overlay-pattern-innolease-1 overlay-opacity-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-8 w-8 text-kupari fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-medium text-piki mb-6 leading-relaxed">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <div className="font-bold text-kupari text-lg">{testimonial.author}</div>
          <div className="text-gray-700">{testimonial.position}</div>
        </div>
      </BasicLayout>

      {/* Customer Stories Grid Section */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{storiesSection.heading}</Heading2>
        <div className="h-1 w-16 bg-kupari mb-6"></div>
        {storiesSection.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx} variant="large" className="max-w-3xl">
            {text}
          </Paragraph>
        ))}

        {/* Filters */}
        <div className="mb-10 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{filters.industryLabel}</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters.industries).map(([key, name]) => (
                  <button
                    key={key}
                    className={`px-4 py-2 text-sm rounded-full border ${
                      key === "all"
                        ? "bg-piki text-white border-piki"
                        : "bg-white text-gray-700 border-gray-300 hover:border-kupari hover:text-kupari"
                    }`}
                  >
                    {name as string}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">{filters.sortLabel}</label>
              <select className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari">
                {Object.entries(filters.sortOptions).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name as string}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <GridLayout columns={{ default: 1, md: 2, lg: 3 }}>
          {stories.map(
            (
              story: {
                company: string;
                heading: string;
                industry: string;
                texts: string[];
                link: { label: string; href: string };
              },
              index: number
            ) => (
              <Card key={index} palette="beige" className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48 mb-4">
                  <ImagePlaceholder aspectRatio="3:4" />
                </div>

                <div className="flex items-center mb-3">
                  <div className="text-lg font-bold text-piki">{story.company}</div>
                </div>

                <div className="bg-beige text-piki text-xs font-medium inline-block px-2 py-1 rounded mb-3">
                  {story.industry}
                </div>

                <Heading3 className="mb-3">{story.heading}</Heading3>

                {story.texts?.map((text: string, textIdx: number) => (
                  <Paragraph key={textIdx} className="mb-4 line-clamp-3">
                    {text}
                  </Paragraph>
                ))}

                {story.link && (
                  <LinkButton href={story.link.href} className="text-kupari font-medium">
                    {story.link.label}
                  </LinkButton>
                )}
              </Card>
            )
          )}
        </GridLayout>

        {/* Load more button */}
        {storiesSection.link && (
          <div className="flex justify-center mt-12">
            <LinkButton
              href={storiesSection.link.href}
              className="border-kupari text-kupari hover:bg-kupari hover:text-white px-8 border rounded-full"
            >
              {storiesSection.link.label}
            </LinkButton>
          </div>
        )}
      </BasicLayout>

      {/* Promotion Section */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{promotion.heading}</Heading2>
        {promotion.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Flex direction="row" gaps="large">
          {promotion.columns?.map(
            (column: { heading: string; texts: string[]; link: { label: string; href: string } }, idx: number) => (
              <Card palette="beige" key={idx}>
                <Heading3>{column.heading}</Heading3>
                {column.texts?.map((text: string, textIdx: number) => (
                  <Paragraph key={textIdx}>{text}</Paragraph>
                ))}
                {column.link && <LinkButton href={column.link.href}>{column.link.label}</LinkButton>}
              </Card>
            )
          )}
        </Flex>
      </BasicLayout>

      {/* CTA Section */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
      </BasicLayout>
    </PageWrapper>
  );
}
