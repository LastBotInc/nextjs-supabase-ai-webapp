import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { PersonnelCard } from "../components/layouts/Card";
import { CallUs } from "../components/CallUs";

import { ShapedContentFlowInParagraph } from "../components/layouts/CommonElements";
import { Hero } from "../components/Hero/Hero";
import { ColumnBlock as CoreColumnBlock } from "../components/block/ColumnBlock";
import { Heading1, Heading2, Heading3, Heading2Small } from "../components/core/Headings";
import { Paragraph } from "../components/core/Paragraph";
import { CustomizableBlock } from "../components/block/CustomizableBlock";
import { Grid } from "../components/grid/Grid";
import { Content } from "../components/content/Content";
import { Card } from "../components/card/Card";
import { BackgroundImageBlock } from "../components/block/BackgroundImageBlock";
import NewsSection from "../components/NewsSection";
import { ArrowRightIcon } from "lucide-react";
import { IconPlugCar } from "../components/Icons";
import { ImageContainer } from "../components/core/ImageContainer";
import { LinkButton } from "../components/core/LinkButton";
import { List } from "../components/core/List";
import { PageWrapper } from "../components/core/PageWrapper";
import { ContentContainer } from "../components/core/ContentContainer";
import { ExtraBlockPadding } from "../components/core/ExtraBlockPadding";
import { iconPaletteClassName } from "../components/cssJs/cssJs";
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

//const blogPostsFormatted: BlogPost[] = [];
export default async function Page({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <PageWrapper>
      <Hero isFirst palette="piki">
        <Hero.Image src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      <CoreColumnBlock palette="default" asGrid>
        <CoreColumnBlock.Column addContainer className="pr-10">
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
        </CoreColumnBlock.Column>
        <CoreColumnBlock.Column addContainer>
          <Paragraph variant="large">{t("topTeam.paragraph1")}</Paragraph>
          <Paragraph variant="large">{t("topTeam.paragraph2")}</Paragraph>
          <LinkButton className="mt-8 bg-piki text-white" href="#">
            {t("topTeam.readMore")}
          </LinkButton>
        </CoreColumnBlock.Column>
      </CoreColumnBlock>

      <CustomizableBlock palette="light-gray">
        <Grid>
          <Grid.Top>
            <Content className="lg:text-center">
              <Content.Heading>
                <Heading2 className="lg:text-6xl pb-6">{t("leasingOptions.heading")}</Heading2>
                <Heading3 className="">{t("leasingOptions.description")}</Heading3>
              </Content.Heading>
            </Content>
          </Grid.Top>
          <Grid.Middle>
            <Content noSpacing>
              <Content.Wrapper forBoxes>
                <Content.Column>
                  <Card
                    palette="kupari"
                    className="md:rounded-xl overflow-hidden has-overlay-pattern overlay-pattern-innolease-1 pr-0 lg:pr-0 space-between"
                  >
                    <Card.TopImage>
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
                    </Card.TopImage>
                    <Card.Heading small responsive className="pr-4 lg:pr-8">
                      {t("leasingOptions.personalizedTitle")}
                    </Card.Heading>
                    <Card.Content>
                      <ShapedContentFlowInParagraph
                        image={{
                          src: "/images/home/0f6632b90d20d9cb3e1d6f218e043f46b58094e1.png",
                          alt: "Leasing options shape",
                          shape: "polygon(0% 100%, 0% 54%, 24% 17%, 33% 0%, 100% 0%, 100% 100%)",
                          aspectRatio: "1025/496",
                        }}
                        className={`text-piki`}
                      >
                        {t("leasingOptions.personalizedDescription")}
                      </ShapedContentFlowInParagraph>
                      <LinkButton href="#">{t("leasingOptions.readMore")}</LinkButton>
                    </Card.Content>
                  </Card>
                </Content.Column>
                <Content.Column>
                  <Card
                    palette="betoni"
                    className="rounded-xl overflow-hidden has-overlay-pattern overlay-pattern-innolease-2 pr-0 lg:pr-0 space-between"
                  >
                    <Card.TopImage>
                      <Image
                        src="/images/home/leasing2.png"
                        alt={t("searchingFor.imageAlt", { defaultValue: "Searching for" })}
                        layout="responsive"
                        width={703}
                        height={392}
                        className="lg:hidden p-6 object-contain max-h-[260px] self-center h-auto w-auto"
                        quality={90}
                        aria-hidden={true}
                      />
                    </Card.TopImage>
                    <Card.Heading small responsive className="pr-4 lg:pr-8">
                      {t("leasingOptions.flexibleTitle")}
                    </Card.Heading>
                    <Card.Content>
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
                    </Card.Content>
                  </Card>
                </Content.Column>
              </Content.Wrapper>
            </Content>
          </Grid.Middle>
          <Grid.Bottom>
            <Content className="lg:text-center">
              <Content.Heading>
                <LinkButton className="self-center" href="#">
                  {t("leasingOptions.allSolutions")}
                </LinkButton>
              </Content.Heading>
            </Content>
          </Grid.Bottom>
        </Grid>
      </CustomizableBlock>

      <BackgroundImageBlock
        src="/images/home/9460b1df285683cc7b8700f34fe521e13acee9c4.png"
        backgroundPosition="bottom right"
      >
        <Content asGrid addTextShadow palette="black">
          <Content.Column addContainer>
            <Heading2>{t("transparency.title")}</Heading2>
            {t.raw("transparency.description").map((description: string) => (
              <Paragraph key={description}>{description}</Paragraph>
            ))}
            <LinkButton href={"#"}>{t("transparency.readMore")}</LinkButton>
          </Content.Column>
          <Content.Column addContainer> </Content.Column>
        </Content>
      </BackgroundImageBlock>

      <BackgroundImageBlock
        src="/images/home/f818c3812d549af98d6ac2658d7e74e6 2.png"
        backgroundPosition={{ default: "0% 0%", md: "0% 0%", lg: "50vw 50%", xl: "97% 50%" }}
        backgroundSize={{ default: "0%", md: "0%", lg: "90%", xl: "40%" }}
        palette="light-gray"
      >
        <ExtraBlockPadding>
          <Content asGrid>
            <Content.Column addContainer>
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
              <Heading1
                className="text-piki"
                dangerouslySetInnerHTML={{ __html: t.raw("searchingFor.title") }}
              ></Heading1>
              {t.raw("searchingFor.description").map((description: string) => (
                <Paragraph key={description} className="text-piki">
                  {description}
                </Paragraph>
              ))}
              <LinkButton className="bg-kupari text-white" href={"#"}>
                {t("searchingFor.readMore")}
              </LinkButton>
            </Content.Column>
            <Content.Column addContainer> </Content.Column>
          </Content>
        </ExtraBlockPadding>
      </BackgroundImageBlock>

      <BackgroundImageBlock
        src="/images/home/oogee01150_Close-up_of_the_front_wheel_and_headlight_design_o_9c38ffea-2dc7-44c8-aa69-241256430d63_3_1.png"
        backgroundPosition={{ default: "center left", md: "center left", lg: "center right", xl: "center right" }}
        backgroundSize={{ default: "0%", md: "0%", lg: "cover" }}
        palette="black"
      >
        <Content asGrid addTextShadow palette="black">
          <Content.Column>
            <ContentContainer noSpacing asBlock palette="none">
              <Heading3 className="uppercase text-xl">{t("innoFleet.subtitle")}</Heading3>
              <Heading1 className="color-kupari-heading">{t("innoFleet.title")}</Heading1>
              <Paragraph>{t("innoFleet.description1")}</Paragraph>
              <Paragraph>{t("innoFleet.description2")}</Paragraph>
              <LinkButton href={"#"}>{t("transparency.readMore")}</LinkButton>
            </ContentContainer>
            <div className="relative h-[200px] md:h-[300px] lg:h-[600px] w-full z-10">
              <Image
                src="/images/home/iphone_05_sleep_image.png"
                alt={t("innoFleet.imageAlt", { defaultValue: "InnoFleet Manager app" })}
                fill
                className="object-contain scale-100 lg:scale-150"
                sizes="(max-width: 768px) 100vw, 400px"
                quality={90}
              />
            </div>
          </Content.Column>
        </Content>
      </BackgroundImageBlock>

      <CustomizableBlock palette="light-gray">
        <ContentContainer className="pb-0 lg:pb-0 gap-2 lg:gap-2 align-center">
          <ArrowRightIcon className={iconPaletteClassName} width={50} height={50} strokeWidth={1} />
          <Heading2Small className="text-piki">Ajankohtaista</Heading2Small>
        </ContentContainer>
        <ContentContainer className="pb-0 lg:pb-0">
          <NewsSection />
        </ContentContainer>
        <ContentContainer className="lg:justify-center">
          <LinkButton className="self-center" href="#">
            {t("news.viewAll")}
          </LinkButton>
        </ContentContainer>
      </CustomizableBlock>

      <CustomizableBlock>
        <Content>
          <Content.Wrapper className="grid gap-4 lg:gap-8 bg-transparent xl:grid-cols-[40%_67%]">
            <Content.Column>
              <Heading2 responsive>{t("team.title")}</Heading2>
            </Content.Column>
            <Content.Column>
              <PersonnelCard people={t.raw("personnel")} />
            </Content.Column>
          </Content.Wrapper>
        </Content>
      </CustomizableBlock>

      <CustomizableBlock palette="kupari">
        <ExtraBlockPadding mobileOnly>
          <Content palette="default" asGrid>
            <Content.Column addContainer>
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
            </Content.Column>
            <Content.Column addContainer>
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
            </Content.Column>
          </Content>
        </ExtraBlockPadding>
      </CustomizableBlock>
    </PageWrapper>
  );
}
