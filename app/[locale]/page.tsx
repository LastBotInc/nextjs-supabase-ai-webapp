"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Heading2, Heading2Large, Heading2Small, Heading3, Heading3Small } from "@/app/components/v2/core/Headings";
import { ShapedContentFlowInParagraph } from "../components/v2/components/ShapedContentFlowInParagraph";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import Image from "next/image";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { CustomMainContent } from "@/app/components/v2/layouts/CustomMainContent";
import { ContentArea } from "@/app/components/v2/core/ContentArea";
import { Padding } from "@/app/components/v2/core/types";
import { Flex } from "@/app/components/v2/core/Flex";
import NewsSection from "@/app/components/v2/components/NewsSection";
import { iconPaletteClassName } from "@/app/components/v2/styling/resolveStyles";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PersonnelCard } from "@/app/components/v2/components/PersonnelCard";
import { IconPlugCar } from "@/app/components/Icons";
import { List } from "@/app/components/v2/core/List";
import { DecorativeImage } from "@/app/components/v2/core/DecorativeImage";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AutoleasingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });

  // --- HERO BLOCK ---
  const hero = t.raw("hero");

  // --- TOP TEAM BLOCK ---
  const topTeam = t.raw("topTeam");

  // --- PERSONNEL BLOCK ---
  const personnel = t.raw("personnel");

  // --- LEASING OPTIONS BLOCK ---
  const leasingOptions = t.raw("leasingOptions");

  // --- NEWS BLOCK ---
  const news = t.raw("news");

  // --- NEWS SECTION BLOCK ---
  const newsSection = t.raw("newsSection");

  // --- INNOFLEET BLOCK ---
  const innoFleet = t.raw("innoFleet");

  // --- TEAM BLOCK ---
  const team = t.raw("team");

  // --- TRANSPARENCY BLOCK ---
  const transparency = t.raw("transparency");

  // --- SEARCHING FOR BLOCK ---
  const searchingFor = t.raw("searchingFor");

  // --- GREEN LEASING BLOCK ---
  const greenLeasing = t.raw("greenLeasing");

  return (
    <PageWrapper>
      {/* HERO SECTION */}
      <Hero isFirst>
        <Hero.Image src={hero.image?.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={hero.numbers} />
        </Hero.ExtraContent>
      </Hero>

      {/* TOP TEAM SECTION */}
      <FlexLayout oneColumnBreakpoint="lg" palette="default">
        <FlexLayout.Column>
          <Heading2 responsive>{topTeam.heading}</Heading2>
          <ImageContainer className="px-4 md:px-0 md:py-4 w-full aspect-ratio-4/3">
            <Image
              src={topTeam.image?.src}
              alt={topTeam.image?.alt}
              layout="responsive"
              width={1893}
              height={1262}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
              quality={90}
            />
          </ImageContainer>
        </FlexLayout.Column>
        <FlexLayout.Column>
          {topTeam.texts?.map((text: string, idx: number) => (
            <Paragraph variant="large" key={idx}>
              {text}
            </Paragraph>
          ))}
          {topTeam.link && <LinkButton href={topTeam.link.href}>{topTeam.link.label}</LinkButton>}
        </FlexLayout.Column>
      </FlexLayout>

      {/* LEASING OPTIONS SECTION */}
      <CustomMainContent palette="light-gray">
        <ContentArea>
          <Flex direction="column" gaps="large">
            <Flex className="text-center pb-7" direction="column" gaps="none">
              <Heading2Large className="pb-6">{leasingOptions.heading}</Heading2Large>
              <Heading3>{leasingOptions.subheading}</Heading3>
            </Flex>
            <Flex>
              {leasingOptions.columns?.map(
                (
                  col: {
                    subheading: string;
                    texts: string[];
                    link?: { label: string; href: string };
                    image?: { src: string; alt: string };
                  },
                  idx: number
                ) => (
                  <BoxLayout.Box
                    key={idx}
                    palette={idx === 0 ? "kupari" : "betoni"}
                    padding={Padding.Unset}
                    rounded={true}
                    className={`forced-split-padding has-overlay-pattern overlay-pattern-innolease-${idx + 1}`}
                    style={{ paddingRight: 0 }}
                  >
                    <Flex>
                      <Image
                        src={col.image?.src || ""}
                        alt={col.image?.alt || ""}
                        layout="responsive"
                        width={1077}
                        height={397}
                        className="lg:hidden p-6 object-contain max-h-[260px] self-center h-auto w-auto"
                        quality={90}
                        aria-hidden={true}
                      />
                      <Flex direction="column">
                        <Heading3>{col.subheading}</Heading3>
                        <ShapedContentFlowInParagraph
                          image={{
                            src:
                              idx === 0
                                ? "/images/home/0f6632b90d20d9cb3e1d6f218e043f46b58094e1.png"
                                : "/images/home/09b138d95425dda02cfc752cc17328ca2e0f8a2c_x.png",
                            alt: "Leasing options shape",
                            shape:
                              idx === 0
                                ? "polygon(0% 100%, 0% 54%, 24% 17%, 33% 0%, 100% 0%, 100% 100%)"
                                : "polygon(30% 100%, 30% 0%, 100% 0%, 100% 100%)",
                            aspectRatio: "1025/496",
                          }}
                        >
                          {col.texts?.[0]}
                        </ShapedContentFlowInParagraph>
                        {col.link && <LinkButton href={col.link.href}>{col.link.label}</LinkButton>}
                      </Flex>
                    </Flex>
                  </BoxLayout.Box>
                )
              )}
            </Flex>
            <Flex direction="column" className="text-center py-7" gaps="none">
              {leasingOptions.link && (
                <LinkButton className="self-center" href={leasingOptions.link.href}>
                  {leasingOptions.link.label}
                </LinkButton>
              )}
            </Flex>
          </Flex>
        </ContentArea>
      </CustomMainContent>

      {/* TRANSPARENCY SECTION */}
      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="black"
        mainImage={{
          src: transparency.image?.src,
          backgroundPosition: "bottom right",
        }}
      >
        <FlexLayout.Column className="shadow-text">
          <Heading2Large>{transparency.heading}</Heading2Large>
          {transparency.texts?.map((description: string, idx: number) => (
            <Paragraph key={idx}>{description}</Paragraph>
          ))}
          {transparency.link && <LinkButton href={transparency.link.href}>{transparency.link.label}</LinkButton>}
        </FlexLayout.Column>
        {/* empty column intentionally*/}
        <FlexLayout.Column> </FlexLayout.Column>
      </FlexLayout>

      {/* SEARCHING FOR SECTION */}
      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="maantie"
        mainImage={{
          src: searchingFor.image?.src,
          backgroundPosition: { default: "0% 0%", md: "0% 0%", lg: "50vw 50%", xl: "97% 50%" },
          backgroundSize: { default: "0%", md: "0%", lg: "90%", xl: "40%" },
        }}
        style={{
          backgroundColor: "var(--light-gray)",
        }}
      >
        <FlexLayout.Column>
          <Image
            src={searchingFor.image?.src || ""}
            alt={searchingFor.image?.alt || ""}
            layout="responsive"
            width={1893}
            height={1262}
            className="object-contain md:hidden p-6"
            sizes="(max-width: 768px) 100vw, 400px"
            quality={90}
          />
          <Heading2Large dangerouslySetInnerHTML={{ __html: searchingFor.heading }}></Heading2Large>
          {searchingFor.texts?.map((description: string, idx: number) => (
            <Paragraph key={idx}>{description}</Paragraph>
          ))}
          {searchingFor.link && <LinkButton href={searchingFor.link.href}>{searchingFor.link.label}</LinkButton>}
        </FlexLayout.Column>
        {/* empty column intentionally*/}
        <FlexLayout.Column> </FlexLayout.Column>
      </FlexLayout>

      {/* INNOFLEET SECTION */}
      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="black"
        mainImage={{
          src: innoFleet.image?.src,
          backgroundPosition: { default: "center left", md: "center left", lg: "center right", xl: "center right" },
          backgroundSize: { default: "0%", md: "0%", lg: "cover" },
        }}
        className="with-overflowing-image"
      >
        <FlexLayout.Column className="shadow-text">
          <Heading3Small className="uppercase text-xl lg:text-xl">{innoFleet.subtitle}</Heading3Small>
          <Heading2Large className="color-kupari-heading">{innoFleet.heading}</Heading2Large>
          {innoFleet.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          {innoFleet.link && <LinkButton href={innoFleet.link.href}>{innoFleet.link.label}</LinkButton>}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <DecorativeImage
            width="full"
            height="overflow-paddings"
            src={innoFleet.smallImage?.src || ""}
            backgroundSize="contain"
            backgroundPosition="center center"
            className=""
          />
          <div className="relative h-[200px] w-full lg:hidden">
            <Image
              src={innoFleet.smallImage?.src || ""}
              alt={innoFleet.smallImage?.alt || ""}
              fill
              className="object-contain scale-100 lg:scale-150"
              sizes="(max-width: 768px) 100vw, 400px"
              quality={90}
            />
          </div>
        </FlexLayout.Column>
      </FlexLayout>

      {/* NEWS SECTION */}
      <CustomMainContent palette="light-gray" className="compensate-for-split-padding-bottom">
        <ContentArea className="forced-split-padding">
          <Flex
            gaps="small"
            direction="row"
            className="items-center main-level-padding-block bottom-padding-half-block"
          >
            <ArrowRightIcon className={iconPaletteClassName} width={50} height={50} strokeWidth={1} />
            <Heading2Small className="text-piki">{newsSection.heading}</Heading2Small>
          </Flex>
          <NewsSection cards={news.cards} />
          <Flex className="justify-center pt-8">
            {news.link && (
              <LinkButton className="self-center" href={news.link.href}>
                {news.link.label}
              </LinkButton>
            )}
          </Flex>
        </ContentArea>
      </CustomMainContent>

      {/* TEAM SECTION */}
      <FlexLayout oneColumnBreakpoint="xl" palette="default">
        <FlexLayout.FixedWidthColumn width={{ default: "100%", md: "100%", lg: "100%", xl: "40%" }}>
          <Heading2 responsive>{team.heading}</Heading2>
        </FlexLayout.FixedWidthColumn>
        <FlexLayout.Column>
          <PersonnelCard people={personnel} />
        </FlexLayout.Column>
      </FlexLayout>

      {/* GREEN LEASING SECTION */}
      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <div className="relative space-y-8">
            <Heading2Large responsive>{greenLeasing.heading}</Heading2Large>
            {greenLeasing.texts?.map((description: string, idx: number) => (
              <Paragraph key={idx}>{description}</Paragraph>
            ))}
            <List>
              {greenLeasing.list?.map((item: string) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>
            <br></br>
            {greenLeasing.link && <LinkButton href={greenLeasing.link.href}>{greenLeasing.link.label}</LinkButton>}
            <IconPlugCar className="absolute bottom-0 right-0" />
          </div>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Image
            src={greenLeasing.image?.src || ""}
            alt={greenLeasing.image?.alt || ""}
            width={800}
            height={480}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
        </FlexLayout.Column>
      </FlexLayout>
    </PageWrapper>
  );
}
