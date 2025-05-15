import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { LeasingOptionsCards } from "@/app/components/LeasingOptionsCards";
import { BlogCardList } from "@/app/components/BlogCardList";
import { createClient } from "@/utils/supabase/server";
import {
  CardForFullWidthImageAndExtraChild,
  CardWithTextAndImage,
  CardWithTopImageAndTimestamp,
  PersonnelCard,
} from "../components/layouts/Card";
import { CallUs } from "../components/CallUs";

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
  const tCommon = await getTranslations({ locale, namespace: "Common" });

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
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section - Updated layout: Full-width image within container */}
      <section className="w-full bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Image container - Full width */}
          <div
            style={{ backgroundImage: "url(/images/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png)" }}
            className="h-[400px] md:h-[600px] w-full relative mb-12m background-image-fill rounded-lg p-14 flex flex-col items-left justify-end"
          >
            <div className="flex flex-row gap-2  space-between w-full">
              <h1 className="text-6xl font-medium text-white leading-tight w-1/3">
                {t("hero.heading")}
                <span className="block mt-3 text-4xl font-light text-white whitespace-wrap">
                  {t("hero.subheading")}
                </span>
              </h1>
              <CallUs
                numbers={[
                  { title: "Soita meille", number: "0401234567" },
                  { title: "Soita meille", number: "0401234567" },
                ]}
              />
            </div>
          </div>

          {/* Text content container - Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start px-6 py-12">
            {/* Left Column: Heading (centered) */}
            <div className="text-center md:text-left">
              <h2 className="text-6xl font-light text-gray-900 leading-tight">{t("topTeam.heading")}</h2>
              <div className="aspect-ratio-4/3">
                <Image
                  src="/images/542c1cb86dab162e495da68f95bb1172db8497fb.png"
                  alt={t("topTeam.imageAlt", { defaultValue: "Top team" })}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={90}
                />
              </div>
            </div>

            {/* Right Column: Paragraphs and Button */}
            <div>
              <div className="space-y-5 text-gray-700 text-lg">
                <p>{t("topTeam.paragraph1")}</p>
                <p>{t("topTeam.paragraph2")}</p>
              </div>

              <Button size="default" className="mt-8 bg-piki hover:bg-piki/90 text-white px-8 py-3 rounded-md" asChild>
                <Link href="#">{t("topTeam.readMore")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Leasing Options */}
      <section className="w-full bg-white py-8">
        <h2 className="text-6xl font-light text-gray-900 leading-tight">Leasingratkaisut</h2>
        <p className="text-3xl font-light text-gray-900">Valitse yrityksellesi parhaiten sopiva leasingratkaisu.</p>
        <div className="max-w-7xl mx-auto px-6">
          <LeasingOptionsCards />
        </div>
        <Button size="default" className="mt-8 bg-piki hover:bg-piki/90 text-white px-8 py-3 rounded-md">
          Kaikki leasingvaihtoehdot
        </Button>
      </section>

      <CardForFullWidthImageAndExtraChild
        title={"Leasingratkaisujen kustannukset läpinäkyvästi"}
        text={[
          "Osaamme ostaa kone- ja laiteratkaisut puolestanne oikeaan hintaan, kilpailukykyisesti rahoitettuna sekä huollettuna, näin takaamme yrityksellenne edullisimman ja tehokkaimman ratkaisun.",
          "Toteutamme yrityksenne autopolitiikkaa ja teemme autokannan kustannusten kilpailutuksen puolestanne, sekä realisoimme vanhan kaluston.",
        ]}
        image={{
          src: "/images/9460b1df285683cc7b8700f34fe521e13acee9c4.png",
          alt: t("transparency.imageAlt", { defaultValue: "Dark car" }),
        }}
        link={{ href: "#", text: t("transparency.readMore") }}
      ></CardForFullWidthImageAndExtraChild>
      <CardWithTextAndImage
        title={"Uusi vai käytetty auto etsinnässä?"}
        text={[
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
          "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        ]}
        image={{
          src: "/images/f818c3812d549af98d6ac2658d7e74e6 2.png",
          alt: t("transparency.imageAlt", { defaultValue: "Dark car" }),
        }}
        link={{ href: "#", text: t("transparency.readMore") }}
      ></CardWithTextAndImage>
      <CardForFullWidthImageAndExtraChild
        title={t("innoFleet.title")}
        text={[t("innoFleet.description1"), t("innoFleet.description2")]}
        image={{
          src: "/images/oogee01150_Close-up_of_the_front_wheel_and_headlight_design_o_9c38ffea-2dc7-44c8-aa69-241256430d63_3 1.png",
          alt: t("transparency.imageAlt", { defaultValue: "Dark car" }),
        }}
        link={{ href: "#", text: t("transparency.readMore") }}
      >
        <div className="relative h-[600px] w-full max-w-[400px] mx-auto">
          <Image
            src="/images/iphone_05_sleep_image.png"
            alt={t("innoFleet.imageAlt", { defaultValue: "InnoFleet Manager app" })}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 400px"
            quality={90}
          />
        </div>
      </CardForFullWidthImageAndExtraChild>
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

      {/* News Section (replaced with BlogCardList) */}
      <section className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-['Inter_Tight'] text-piki">{t("news.title")}</h2>
            <div className="h-1 w-16 bg-kupari mt-2"></div>
          </div>

          {blogPostsFormatted.length > 0 ? (
            <BlogCardList posts={blogPostsFormatted} className="pt-0" />
          ) : (
            // Fallback to hardcoded cards if no blog posts are available
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <CardWithTopImageAndTimestamp
                title={t("news.card1.title")}
                text={t("news.card1.description")}
                link={{ href: "#", text: t("news.card1.readMore") }}
                image={{
                  src: "/images/fbd9d9f2eb685db6d67715917cb19f5c86abb4d8.png",
                  alt: t("news.card1.imageAlt", { defaultValue: "Ford Transit" }),
                }}
                date="12.06.2024"
              />

              {/* Card 2 */}
              <CardWithTopImageAndTimestamp
                title={t("news.card2.title")}
                text={t("news.card2.description")}
                link={{ href: "#", text: t("news.card2.readMore") }}
                image={{
                  src: "/images/f383847c12f5d779ca1cc2e033f8ab64b992859f.png",
                  alt: t("news.card2.imageAlt", { defaultValue: "Sport cars" }),
                }}
                date="05.06.2024"
              />

              <CardWithTopImageAndTimestamp
                title={t("news.card3.title")}
                text={t("news.card3.description")}
                link={{ href: "#", text: t("news.card3.readMore") }}
                image={{
                  src: "/images/8a775237ed7d12f46cacc356b839daf0c7b36b4e.png",
                  alt: t("news.card3.imageAlt", { defaultValue: "Electric truck" }),
                }}
                date="28.05.2024"
              />
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Button size="default" className="mt-8 bg-piki hover:bg-piki/90 text-white px-8 py-3 rounded-md" asChild>
              <Link href={`/${locale}/blog`}>
                {" "}
                {t("news.viewAll")} <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* InnoFleet Manager Section */}

      {/* Team Section */}
      <section className="w-full bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-4xl font-bold font-['Inter_Tight'] text-piki">{t("team.title")}</h2>
            <div className="h-1 w-16 bg-kupari mt-2"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 w-[240px] h-[240px] relative">
                  <Image
                    src={`/images/team-member-${index + 1}.jpg`}
                    alt={t("team.memberAlt", { defaultValue: "Team member", id: index + 1 })}
                    width={240}
                    height={240}
                    className="rounded-lg object-cover shadow-md"
                    quality={90}
                  />
                </div>
                <h3 className="text-xl font-bold text-piki">
                  {t(`team.member${index + 1}.name`, { defaultValue: "Jukka Mäkinen" })}
                </h3>
                <p className="text-betoni">{t("team.role")}</p>
                <p className="mt-2 text-piki">
                  {t(`team.member${index + 1}.phone`, { defaultValue: "+358 50 123 4567" })}
                </p>
                <p className="text-kupari font-medium">{t("team.email")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PersonnelCard people={t.raw("personnel")} />

      {/* Dark CTA Section */}

      <CardForFullWidthImageAndExtraChild
        title={t("transparency.title")}
        text={t("transparency.description")}
        image={{
          src: "/images/innofleet-car-background.png",
          alt: t("transparency.imageAlt", { defaultValue: "Dark car" }),
        }}
        link={{ href: "#", text: t("transparency.readMore") }}
      />
      <CardWithTextAndImage
        title={"Kohti vihreämpää kalustoa Innoleasen kanssa"}
        text={[
          "Pienennä hiilijalanjälkeäsi sähkö- ja hybridiautojemme avulla. ",
          "Laaja valikoima sähköautoja ",
          "Yksityiskohtainen päästöraportointi ",
          "Latausratkaisut sähköautoille ",
          "Neuvontaa kaluston sähköistämiseen",
        ]}
        image={{
          src: "/images/514779a641a0c85ec74f7f81387290bd5d4de8a6.png",
          alt: t("transparency.imageAlt", { defaultValue: "Dark car" }),
        }}
        link={{ href: "#", text: t("transparency.readMore") }}
      ></CardWithTextAndImage>
    </main>
  );
}
