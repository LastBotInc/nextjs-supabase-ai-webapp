"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/core/PageWrapper";
import { CallUs } from "@/app/components/CallUs";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { BoxLayout } from "@/app/components/v2/layouts/BoxLayout";
import { Heading2, Heading3 } from "@/app/components/core/Headings";
import { ImageContainer } from "@/app/components/core/ImageContainer";
import Image from "next/image";
import { Paragraph } from "@/app/components/core/Paragraph";
import { LinkButton } from "@/app/components/core/LinkButton";
import { CustomMainContent } from "@/app/components/v2/layouts/CustomMainContent";
import { ContentArea } from "@/app/components/v2/core/ContentArea";
import { Padding } from "@/app/components/v2/core/types";
import { Heading2Small, ShapedContentFlowInParagraph } from "@/app/components/layouts/CommonElements";
import { Flex } from "@/app/components/v2/core/Flex";
import NewsSection from "@/app/components/NewsSection";
import { iconPaletteClassName } from "@/app/components/cssJs/cssJs";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { PersonnelCard } from "@/app/components/layouts/Card";
import { IconPlugCar } from "@/app/components/Icons";
import { List } from "@/app/components/core/List";

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

  return (
    <PageWrapper>
      <Hero isFirst>
        <Hero.Image src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      <FlexLayout oneColumnBreakpoint="lg" palette="default">
        <FlexLayout.Column>
          <Heading2 responsive>{t("topTeam.heading")}</Heading2>
          <ImageContainer className="px-4 md:px-0 md:py-4 w-full aspect-ratio-4/3">
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
          </ImageContainer>
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Paragraph variant="large">{t("topTeam.paragraph1")}</Paragraph>
          <Paragraph variant="large">{t("topTeam.paragraph2")}</Paragraph>
          <LinkButton className="mt-8 bg-piki text-white" href="#">
            {t("topTeam.readMore")}
          </LinkButton>
        </FlexLayout.Column>
      </FlexLayout>

      <CustomMainContent palette="light-gray">
        <ContentArea type="content" className="main-level-padding-full">
          <FlexLayout.Column className="lg:text-center">
            <Heading2 className="lg:text-6xl pb-6">{t("leasingOptions.heading")}</Heading2>
            <Heading3 className="">{t("leasingOptions.description")}</Heading3>
          </FlexLayout.Column>
        </ContentArea>
        <ContentArea type="content" className="forced-split-padding">
          <Flex>
            <BoxLayout.Box
              palette="kupari"
              padding={Padding.Unset}
              rounded={true}
              className="forced-split-padding has-overlay-pattern overlay-pattern-innolease-1"
              style={{ paddingRight: 0 }}
            >
              <Flex>
                <Image
                  src="/images/home/leasing1.png"
                  alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                  layout="responsive"
                  width={1077}
                  height={397}
                  className="lg:hidden p-6 object-contain max-h-[260px] self-center h-auto w-auto"
                  quality={90}
                  aria-hidden={true}
                />
                <Flex direction="column">
                  <Heading3 className="">{t("leasingOptions.personalizedTitle")}</Heading3>
                  <ShapedContentFlowInParagraph
                    image={{
                      src: "/images/home/0f6632b90d20d9cb3e1d6f218e043f46b58094e1.png",
                      alt: "Leasing options shape",
                      shape: "polygon(0% 100%, 0% 54%, 24% 17%, 33% 0%, 100% 0%, 100% 100%)",
                      aspectRatio: "1025/496",
                    }}
                  >
                    {t("leasingOptions.personalizedDescription")}
                  </ShapedContentFlowInParagraph>
                  <LinkButton href="#">{t("leasingOptions.readMore")}</LinkButton>
                </Flex>
              </Flex>
            </BoxLayout.Box>
            <BoxLayout.Box
              palette="betoni"
              padding={Padding.Unset}
              rounded={true}
              className="forced-split-padding has-overlay-pattern overlay-pattern-innolease-2"
              style={{ paddingRight: 0 }}
            >
              <Flex>
                <Image
                  src="/images/home/leasing2.png"
                  alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                  layout="responsive"
                  width={1077}
                  height={397}
                  className="lg:hidden p-6 object-contain max-h-[260px] self-center h-auto w-auto"
                  quality={90}
                  aria-hidden={true}
                />
                <Flex direction="column">
                  <Heading3 className="">{t("leasingOptions.flexibleTitle")}</Heading3>
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
                  <LinkButton href="#">{t("leasingOptions.readMore")}</LinkButton>
                </Flex>
              </Flex>
            </BoxLayout.Box>
          </Flex>
        </ContentArea>
        <ContentArea type="content" className="main-level-padding-full">
          <FlexLayout.Column className="lg:text-center">
            <Heading2 className="lg:text-6xl pb-6">{t("leasingOptions.heading")}</Heading2>
            <Heading3 className="">{t("leasingOptions.description")}</Heading3>
          </FlexLayout.Column>
        </ContentArea>
      </CustomMainContent>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="black"
        mainImage={{
          src: "/images/home/9460b1df285683cc7b8700f34fe521e13acee9c4.png",
          backgroundPosition: "bottom right",
        }}
      >
        <FlexLayout.Column className="shadow-text">
          <Heading2>{t("transparency.title")}</Heading2>
          {t.raw("transparency.description").map((description: string) => (
            <Paragraph key={description}>{description}</Paragraph>
          ))}
          <LinkButton href={"#"}>{t("transparency.readMore")}</LinkButton>
        </FlexLayout.Column>
        {/* empty column intentionally*/}
        <FlexLayout.Column> </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="maantie"
        mainImage={{
          src: "/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png",
          backgroundPosition: { default: "0% 0%", md: "0% 0%", lg: "50vw 50%", xl: "97% 50%" },
          backgroundSize: { default: "0%", md: "0%", lg: "90%", xl: "40%" },
        }}
        style={{
          backgroundColor: "var(--light-gray)",
        }}
      >
        <FlexLayout.Column>
          <Image
            src="/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png"
            alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
            layout="responsive"
            width={1893}
            height={1262}
            className="object-contain md:hidden p-6"
            sizes="(max-width: 768px) 100vw, 400px"
            quality={90}
          />
          <Heading2 dangerouslySetInnerHTML={{ __html: t.raw("searchingFor.title") }}></Heading2>
          {t.raw("searchingFor.description").map((description: string) => (
            <Paragraph key={description}>{description}</Paragraph>
          ))}
          <LinkButton href={"#"}>{t("searchingFor.readMore")}</LinkButton>
        </FlexLayout.Column>
        {/* empty column intentionally*/}
        <FlexLayout.Column> </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout
        oneColumnBreakpoint="lg"
        palette="black"
        mainImage={{
          src: "/images/home/oogee01150_Close-up_of_the_front_wheel_and_headlight_design_o_9c38ffea-2dc7-44c8-aa69-241256430d63_3_1.png",
          backgroundPosition: { default: "center left", md: "center left", lg: "center right", xl: "center right" },
          backgroundSize: { default: "0%", md: "0%", lg: "cover" },
        }}
      >
        <FlexLayout.Column className="shadow-text">
          <Heading3 className="uppercase text-xl">{t("innoFleet.subtitle")}</Heading3>
          <Heading2 className="color-kupari-heading">{t("innoFleet.title")}</Heading2>
          <Paragraph>{t("innoFleet.description1")}</Paragraph>
          <Paragraph>{t("innoFleet.description2")}</Paragraph>
          <LinkButton href={"#"}>{t("transparency.readMore")}</LinkButton>
        </FlexLayout.Column>
        <FlexLayout.Column>
          {" "}
          <div className="relative h-[200px] md:h-[300px] lg:h-[600px] w-full z-100">
            <Image
              src="/images/home/iphone_05_sleep_image.png"
              alt={t("innoFleet.imageAlt", { defaultValue: "InnoFleet Manager app" })}
              fill
              className="object-contain scale-100 lg:scale-150"
              sizes="(max-width: 768px) 100vw, 400px"
              quality={90}
            />
          </div>
        </FlexLayout.Column>
      </FlexLayout>

      <CustomMainContent palette="light-gray">
        <ContentArea type="content" className="main-level-padding-full pb-0 lg:pb-0  align-center">
          <FlexLayout.Column>
            <ArrowRightIcon className={iconPaletteClassName} width={50} height={50} strokeWidth={1} />
            <Heading2Small className="text-piki">Ajankohtaista</Heading2Small>
          </FlexLayout.Column>
        </ContentArea>
        <ContentArea type="content" className="forced-split-padding">
          <NewsSection />
        </ContentArea>
        <ContentArea type="content" className="main-level-padding-full">
          <FlexLayout.Column className="lg:text-center">
            <LinkButton className="self-center" href="#">
              {t("news.viewAll")}
            </LinkButton>
          </FlexLayout.Column>
        </ContentArea>
      </CustomMainContent>

      <FlexLayout oneColumnBreakpoint="xl" palette="default">
        <FlexLayout.FixedWidthColumn width={{ default: "100%", md: "100%", lg: "100%", xl: "40%" }}>
          <Heading2 responsive>{t("team.title")}</Heading2>
        </FlexLayout.FixedWidthColumn>
        <FlexLayout.Column>
          <PersonnelCard people={t.raw("personnel")} />
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout oneColumnBreakpoint="lg" palette="kupari">
        <FlexLayout.Column>
          <div className="relative space-y-8">
            <Heading2 responsive>{t("greenLeasing.title")}</Heading2>
            {t.raw("greenLeasing.description").map((description: string) => (
              <Paragraph key={description}>{description}</Paragraph>
            ))}

            <List>
              {t.raw("greenLeasing.list").map((item: string) => (
                <List.Item key={item}>{item}</List.Item>
              ))}
            </List>
            <br></br>
            <LinkButton href={"#"}>{t("greenLeasing.readMore")}</LinkButton>
            <IconPlugCar className="absolute bottom-0 right-0" />
          </div>
        </FlexLayout.Column>
        <FlexLayout.Column>
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
        </FlexLayout.Column>
      </FlexLayout>
    </PageWrapper>
  );
}
