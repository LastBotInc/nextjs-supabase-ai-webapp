import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { BlogCardList } from "@/app/components/BlogCardList";
import { createClient } from "@/utils/supabase/server";
import { NewsCard, PersonnelCard, TwoColumnCard, ColumnCard } from "../components/layouts/Card";
import { CallUs } from "../components/CallUs";
import {
  BlockPadding,
  CommonBlock,
  CommonBlockWithCols,
  FullScreenWidthBlock,
  FullWidthContentBlockWithBg,
  MaxWidthContentBlock,
  ColumnBlock,
} from "../components/layouts/Block";
import { LinkLikeButton, Paragraph } from "../components/layouts/CommonElements";
import {
  Heading1,
  Heading2,
  Heading2Small,
  Heading3,
  ShapedContentFlowInParagraph,
} from "../components/layouts/CommonElements";
import { IconPlugCar } from "../components/Icons";
import { ArrowRightIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  await setupServerLocale(locale);
  const tMeta = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });

  // Fetch the latest 3 news blog posts
  const supabase = await createClient();
  const { data: blogPosts } = await supabase
    .from("posts")
    .select("id, title, excerpt, featured_image, slug, created_at")
    .eq("locale", locale)
    .eq("subject", "news")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // Transform blog posts for the BlogCardList component
  const blogPostsFormatted = (blogPosts || []).map((post) => ({
    id: post.id,
    title: post.title,
    description: post.excerpt,
    imageSrc: post.featured_image || "/images/no-bg/etruck.png", // Fallback image if none provided
    imageAlt: post.title,
    date: new Date(post.created_at).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    href: `/blog/${post.slug}`,
  }));

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      {/* Hero Section - Updated layout: Full-width image within container */}
      <section className="w-full bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Image container - Full width */}
          <div
            style={{ backgroundImage: "url(/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png)" }}
            className="h-[400px] md:h-[600px] w-full relative mb-12m background-image-fill rounded-lg p-14 flex flex-col items-left justify-end"
          >
            <div className="flex flex-row gap-2 justify-between w-full">
              <h1 className="text-6xl font-medium text-white leading-tight w-1/3">
                {t("hero.heading")}
                <span className="block text-5xl font-light text-white hero-text-split-to-lines">
                  {t("hero.subheading")}
                </span>
              </h1>
              <CallUs
                numbers={[
                  { title: "Soita meille", number: "020 743 7670" },
                  { title: "Soita meille", number: "020 743 76700" },
                ]}
              />
            </div>
          </div>

          {/* Text content container - Two columns layout */}
        </div>
      </section>

      {/* Leasing Options */}
      <CommonBlock className="bg-white">
        <TwoColumnCard className="bg-transparent gap-0">
          <div className="text-center md:text-left">
            <Heading2 className="text-piki">{t("topTeam.heading")}</Heading2>
            <div className="aspect-ratio-4/3">
              <Image
                src="/images/home/542c1cb86dab162e495da68f95bb1172db8497fb.png"
                alt={t("topTeam.imageAlt", { defaultValue: "Top team" })}
                layout="responsive"
                width={1893}
                height={1262}
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
                quality={90}
              />
            </div>
          </div>

          {/* Right Column: Paragraphs and Button */}
          <div className="pl-20">
            <div className="space-y-5 text-gray-700 text-lg">
              <Paragraph className="text-piki" variant="large">
                {t("topTeam.paragraph1")}
              </Paragraph>
              <Paragraph className="text-piki" variant="large">
                {t("topTeam.paragraph2")}
              </Paragraph>
            </div>

            <LinkLikeButton className="mt-8 bg-piki text-white" href="#">
              {t("topTeam.readMore")}
            </LinkLikeButton>
          </div>
        </TwoColumnCard>
      </CommonBlock>
      <FullScreenWidthBlock className="bg-gray-200">
        <MaxWidthContentBlock className="flex flex-col items-center py-12">
          <h2 className="text-6xl font-light text-gray-900 leading-tight">Leasingratkaisut</h2>
          <p className="text-3xl font-light text-gray-900">Valitse yrityksellesi parhaiten sopiva leasingratkaisu.</p>
        </MaxWidthContentBlock>

        <MaxWidthContentBlock>
          <TwoColumnCard className="bg-transparent">
            <ColumnBlock className="bg-kupari overlay-pattern-innolease-1 py-6" noPadding>
              <Heading3 className="text-piki px-6 font-medium">{t("leasingOptions.personalizedTitle")}</Heading3>
              <div className="py-6">
                <ShapedContentFlowInParagraph
                  image={{
                    src: "/images/home/0f6632b90d20d9cb3e1d6f218e043f46b58094e1.png",
                    alt: "Leasing options shape",
                    shape: "polygon(0% 100%, 0% 54%, 24% 17%, 33% 0%, 100% 0%, 100% 100%)",
                    aspectRatio: "1025/496",
                  }}
                  className="text-piki"
                >
                  {t("leasingOptions.personalizedDescription")}
                </ShapedContentFlowInParagraph>
              </div>
              <div className="px-6">
                <LinkLikeButton className="bg-white text-piki" href="#">
                  Lue lisää
                </LinkLikeButton>
              </div>
            </ColumnBlock>
            <ColumnBlock className="bg-betoni overlay-pattern-innolease-2 py-6" noPadding>
              <Heading3 className="px-6  font-medium">{t("leasingOptions.flexibleTitle")}</Heading3>
              <div className="py-6">
                <ShapedContentFlowInParagraph
                  image={{
                    src: "/images/home/09b138d95425dda02cfc752cc17328ca2e0f8a2c_x.png",
                    alt: "Leasing options shape",
                    shape: "polygon(30% 100%, 30% 0%, 100% 0%, 100% 100%)",
                    aspectRatio: "1025/496",
                  }}
                >
                  {t("leasingOptions.flexibleDescription")}
                </ShapedContentFlowInParagraph>
              </div>
              <div className="px-6">
                <LinkLikeButton className="bg-kupari text-piki" href="#">
                  Lue lisää
                </LinkLikeButton>
              </div>
            </ColumnBlock>
          </TwoColumnCard>
        </MaxWidthContentBlock>
        <MaxWidthContentBlock className="flex flex-col items-center py-12">
          <LinkLikeButton href="#" className="mt-8 bg-piki hover:bg-piki/90 text-white">
            Kaikki leasingvaihtoehdot
          </LinkLikeButton>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      <FullWidthContentBlockWithBg
        image="/images/home/9460b1df285683cc7b8700f34fe521e13acee9c4.png"
        backgroundPosition="bottom right"
      >
        <MaxWidthContentBlock>
          <BlockPadding>
            <TwoColumnCard className="bg-transparent">
              <div>
                <Heading1>{t("transparency.title")}</Heading1>
                <Paragraph>{t("transparency.description")}</Paragraph>
                <Paragraph>
                  Toteutamme yrityksenne autopolitiikkaa ja teemme autokannan kustannusten kilpailutuksen puolestanne,
                  sekä realisoimme vanhan kaluston.
                </Paragraph>
                <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                  Lue lisää
                </LinkLikeButton>
              </div>
              <div></div>
            </TwoColumnCard>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      <FullWidthContentBlockWithBg
        image="/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png"
        backgroundPosition="97% 50%"
        backgroundSize="40%"
        className="bg-gray-200"
      >
        <MaxWidthContentBlock className="py-12">
          <TwoColumnCard className="bg-transparent">
            <BlockPadding>
              <Heading1 className="text-piki">
                <span className="text-kupari">Uusi</span> vai <span className="text-kupari">käytetty</span> auto
                etsinnässä?
              </Heading1>
              <Paragraph className="text-piki">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
              </Paragraph>
              <Paragraph className="text-piki">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </Paragraph>
              <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                Lue lisää
              </LinkLikeButton>
            </BlockPadding>
            <div className="relative w-full flex"></div>
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      <FullWidthContentBlockWithBg
        image="/images/home/oogee01150_Close-up_of_the_front_wheel_and_headlight_design_o_9c38ffea-2dc7-44c8-aa69-241256430d63_3_1.png"
        backgroundPosition="bottom right"
        className="py-20"
      >
        <MaxWidthContentBlock>
          <BlockPadding>
            <TwoColumnCard className="bg-transparent">
              <div>
                <Heading1>{t("innoFleet.title")}</Heading1>
                <Paragraph>{t("innoFleet.description1")}</Paragraph>
                <Paragraph>{t("innoFleet.description2")}</Paragraph>
                <LinkLikeButton className="bg-kupari text-white" href={"#"}>
                  {t("transparency.readMore")}
                </LinkLikeButton>
              </div>
              <div className="relative h-[600px] w-full z-10">
                <Image
                  src="/images/home/iphone_05_sleep_image.png"
                  alt={t("innoFleet.imageAlt", { defaultValue: "InnoFleet Manager app" })}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={90}
                  style={{ transform: "scale(1.6)" }}
                />
              </div>
            </TwoColumnCard>
          </BlockPadding>
        </MaxWidthContentBlock>
      </FullWidthContentBlockWithBg>

      {/* Service Links 
      <section className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LinkCardWithTexts
            title={t("serviceLinks.fleetManagerTools")}
            text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
            link={{ href: "/fleet-manager", text: tCommon("learnMore") }}
            customClassNames={{
              link: "bg-piki text-white",
            }}
          />

          <LinkCardWithTexts
            title={t("serviceLinks.carCalculator")}
            text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
            link={{ href: "/car-calculator", text: tCommon("learnMore") }}
            customClassNames={{
              link: "bg-beige text-piki",
            }}
          />

          <LinkCardWithTexts
            title={t("serviceLinks.companyCarGuide")}
            text={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."}
            link={{ href: "/company-car-guide", text: tCommon("learnMore") }}
            customClassNames={{
              link: "bg-maantie text-piki",
            }}
          />
        </div>
      </section>*/}

      <FullScreenWidthBlock className="bg-gray-200 py-12">
        <MaxWidthContentBlock className="py-12 flex items-center gap-2">
          <ArrowRightIcon className=" text-piki" width={50} height={50} strokeWidth={1} />
          <Heading2Small className="text-piki">Ajankohtaista</Heading2Small>
        </MaxWidthContentBlock>
        <MaxWidthContentBlock>
          {blogPostsFormatted.length > 0 ? (
            <BlogCardList posts={blogPostsFormatted} className="pt-0" />
          ) : (
            // Fallback to hardcoded cards if no blog posts are available
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <NewsCard
                title={t("news.card1.title")}
                text={t("news.card1.description")}
                image={{
                  src: "/images/home/fbd9d9f2eb685db6d67715917cb19f5c86abb4d8.png",
                  alt: t("news.card1.imageAlt", { defaultValue: "Ford Transit" }),
                }}
                date="UUTISET"
              />

              {/* Card 2 */}
              <NewsCard
                title={t("news.card2.title")}
                text={t("news.card2.description")}
                image={{
                  src: "/images/home/f383847c12f5d779ca1cc2e033f8ab64b992859f.png",
                  alt: t("news.card2.imageAlt", { defaultValue: "Sport cars" }),
                }}
                date="KAMPANJAT"
              />

              <NewsCard
                title={t("news.card3.title")}
                text={t("news.card3.description")}
                image={{
                  src: "/images/home/8a775237ed7d12f46cacc356b839daf0c7b36b4e.png",
                  alt: t("news.card3.imageAlt", { defaultValue: "Electric truck" }),
                }}
                date="BLOGIT"
              />
            </div>
          )}
        </MaxWidthContentBlock>
        <MaxWidthContentBlock className="flex items-center justify-center">
          <LinkLikeButton className="mt-8 bg-piki text-white" href="#">
            {t("news.viewAll")}
          </LinkLikeButton>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>

      {/* InnoFleet Manager Section */}

      <CommonBlock className="bg-white px-0">
        <ColumnCard className="bg-transparent grid-cols-[40%_67%]">
          {/* Left Column: Heading (centered) */}
          <div className="text-center md:text-left">
            <Heading2 className="text-piki">{t("team.title")}</Heading2>
          </div>

          {/* Right Column: Paragraphs and Button */}
          <PersonnelCard people={t.raw("personnel")} />
        </ColumnCard>
      </CommonBlock>

      {/* Dark CTA Section */}
      <FullScreenWidthBlock className="bg-kupari">
        <MaxWidthContentBlock className="py-12">
          <TwoColumnCard className="bg-transparent">
            <div className="relative">
              <Heading1 className="text-piki">Kohti vihreämpää kalustoa Innoleasen kanssa</Heading1>
              <Paragraph className="text-piki">
                Pienennä hiilijalanjälkeäsi sähkö- ja hybridiautojemme avulla.
              </Paragraph>
              <ul className="text-piki list-disc list-inside">
                <li>Laaja valikoima sähköautoja </li>
                <li>Yksityiskohtainen päästöraportointi </li>
                <li>Latausratkaisut sähköautoille </li>
                <li>Neuvontaa kaluston sähköistämiseen</li>
              </ul>
              <br></br>
              <LinkLikeButton className="bg-piki   text-white" href={"#"}>
                Lue lisää
              </LinkLikeButton>
              <IconPlugCar className="absolute bottom-0 right-0" />
            </div>
            <Image
              src={"/images/home/514779a641a0c85ec74f7f81387290bd5d4de8a6.png"}
              alt={"transparency.imageAlt"}
              width={800}
              height={480}
              layout="responsive"
              className="object-cover rounded-xl "
              sizes="100vw"
              quality={90}
            />
          </TwoColumnCard>
        </MaxWidthContentBlock>
      </FullScreenWidthBlock>
    </main>
  );
}
