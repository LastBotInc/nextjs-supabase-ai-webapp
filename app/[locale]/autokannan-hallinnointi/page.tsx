"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";

import { Heading2 } from "@/app/components/core/Headings";
import { Paragraph } from "@/app/components/core/Paragraph";
import { CallUs } from "../../components/CallUs";
import Image from "next/image";
import { Hero } from "@/app/components/Hero/Hero";
import { CustomizableBlock } from "@/app/components/block/CustomizableBlock";
import { Card } from "@/app/components/card/Card";
import { Content } from "@/app/components/content/Content";

export default async function FleetManagerPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "FleetManager" });

  return (
    <main
      className="flex min-h-screen flex-col items-center bg-white pt-24
    "
    >
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src="/images/digitaaliset_palvelut.jpg" />
        <Hero.Heading>{t("hero.heading")}</Hero.Heading>
        <Hero.SubHeading>{t("hero.subheading")}</Hero.SubHeading>
        <Hero.ExtraContent>
          <CallUs numbers={t.raw("hero.numbers")} />
        </Hero.ExtraContent>
      </Hero>

      <CustomizableBlock palette="piki">
        <Card rounded>
          <Card.Content>
            <Heading2>{t("mainView.title")}</Heading2>
            <Paragraph>{t("intro.description")}</Paragraph>
            <ul className=" palette-text-color">
              {t.raw("mainView.features").map((feature: string) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </Card.Content>
        </Card>
      </CustomizableBlock>

      <CustomizableBlock palette="piki">
        <Card rounded palette="beige">
          <Card.Content>
            <Heading2>{t("summary.title")}</Heading2>
            <Paragraph>{t("summary.description")}</Paragraph>
          </Card.Content>
        </Card>
      </CustomizableBlock>

      {/* Benefits Section */}
      <CustomizableBlock palette="piki">
        <Card rounded palette="maantie">
          <Card.Content>
            <Heading2>{t("benefits.title")}</Heading2>
            <ul className="palette-text-color">
              {t.raw("benefits.items").map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card.Content>
        </Card>
      </CustomizableBlock>

      <CustomizableBlock palette="kupari">
        <Content palette="default" asGrid>
          <Content.Column addContainer>
            <div className="relative space-y-8">
              <Heading2 className="text-piki">{t("allInOne.title")}</Heading2>
              <Paragraph className="text-piki">{t("allInOne.description")}</Paragraph>
            </div>
          </Content.Column>
          <Content.Column addContainer>
            <Image
              src={"/images/home/iphone_05_sleep_image.png"}
              alt={"transparency.imageAlt"}
              width={566}
              height={727}
              layout="responsive"
              className="object-cover rounded-xl "
              sizes="100vw"
              quality={90}
            />
          </Content.Column>
        </Content>
      </CustomizableBlock>
    </main>
  );
}
