"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Heading2, Heading3, Heading2Small } from "@/app/components/core/Headings";
import { Paragraph } from "@/app/components/core/Paragraph";
import Image from "next/image";
import { Accordion } from "@/app/components/core/Accordion";
import { CustomizableBlock } from "@/app/components/block/CustomizableBlock";
import { ContentContainer } from "@/app/components/core/ContentContainer";
import { Hero } from "@/app/components/Hero/Hero";
import { CallUs } from "@/app/components/CallUs";
import { List } from "@/app/components/core/List";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "CarLeasing.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DriversGuidePage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = params;
  await setupServerLocale(locale);
  const t = await getTranslations("DriversGuide");

  return (
    <main className="flex min-h-screen flex-col items-center bg-white pt-24">
      <Hero isFirst palette="piki" fullWidth useMinHeight>
        <Hero.Image src="/images/autonvuokraus.png" />
        <Hero.Heading>{t("meta.title")}</Hero.Heading>
        <Hero.SubHeading>{t("meta.description")}</Hero.SubHeading>
        <Hero.Text> </Hero.Text>
      </Hero>

      <CustomizableBlock palette="beige">
        <ContentContainer asGrid setBg palette="beige">
          <ContentContainer asBlock noSpacing>
            <Heading2Small>{t("intro.title")}</Heading2Small>
            <Paragraph className="mt-2 text-lg">{t("intro.description")}</Paragraph>
            <Image
              src={"/images/ajankohtaista.png"}
              alt={"transparency.imageAlt"}
              width={2048}
              height={2048}
              layout="responsive"
              className="object-cover rounded-xl "
              sizes="100vw"
              quality={90}
            />
          </ContentContainer>

          <Accordion>
            <Accordion.Item heading={t("maintenance.title")}>
              <Paragraph>{t("maintenance.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("maintenance.tips").map((tip: string, idx: number) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
              <Paragraph className="font-bold">{t("maintenance.note")}</Paragraph>
            </Accordion.Item>
            <Accordion.Item heading={t("replacementCar.title")}>
              <Paragraph>{t("replacementCar.description")}</Paragraph>
              <Paragraph>{t("replacementCar.note")}</Paragraph>
            </Accordion.Item>
            <Accordion.Item heading={t("billing.title")}>
              <Paragraph>{t("billing.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("billing.tips").map((tip: string, idx: number) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
              <Paragraph className="font-bold">{t("billing.note")}</Paragraph>
            </Accordion.Item>
            <Accordion.Item heading={t("tires.title")}>
              <Paragraph>{t("tires.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("tires.tips").map((tip: string, idx: number) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>
            <Accordion.Item heading={t("accidents.title")}>
              <Paragraph>{t("accidents.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("accidents.steps").map((step: string, idx: number) => (
                  <List.Item key={idx}>{step}</List.Item>
                ))}
              </List>
            </Accordion.Item>
            <Accordion.Item heading={t("roadside.title")}>
              <Paragraph>{t("roadside.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("roadside.tips").map((tip: string, idx: number) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>
            <Accordion.Item heading={t("export.title")}>
              <Paragraph>{t("export.description")}</Paragraph>
              <List className="palette-text-color">
                {t.raw("export.tips").map((tip: string, idx: number) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>
            <Accordion.Item heading={t("return.title")}>
              <Paragraph>{t("return.description")}</Paragraph>
              {/* Checklist */}
              <div className="">
                <Heading3>{t("return.checklist.title")}</Heading3>
                <List className="palette-text-color">
                  {t.raw("return.checklist.items").map((item: string, idx: number) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>
              {/* Must Have */}
              <div className="">
                <Heading3>{t("return.mustHave.title")}</Heading3>
                <List className="palette-text-color">
                  {t.raw("return.mustHave.items").map((item: string, idx: number) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>
              {/* Remove */}
              <div className="">
                <Heading3>{t("return.remove.title")}</Heading3>
                <List className="palette-text-color">
                  {t.raw("return.remove.items").map((item: string, idx: number) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>
            </Accordion.Item>
          </Accordion>
        </ContentContainer>
      </CustomizableBlock>

      <CustomizableBlock palette="piki">
        <ContentContainer asGrid setBg palette="piki">
          <ContentContainer asBlock noSpacing palette="piki">
            <Heading2>{t("faq.title")}</Heading2>
            <Paragraph>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut
              laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
              ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
            </Paragraph>
          </ContentContainer>
          <Accordion>
            {t.raw("faq.sections").map((section: any, idx: number) => (
              <Accordion.Item key={idx} heading={section.title}>
                <Paragraph>{section.description}</Paragraph>
              </Accordion.Item>
            ))}
          </Accordion>
        </ContentContainer>
      </CustomizableBlock>

      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src="/images/Tietoa_meista.png" backgroundPosition="top center" />
        <Hero.Heading>{t("contact.title")}</Hero.Heading>
        <Hero.Text>
          <Paragraph variant="large">{t("contact.description")}</Paragraph>
          <Paragraph variant="large">{t("contact.note")}</Paragraph>
        </Hero.Text>

        <Hero.ExtraContent>
          <CallUs numbers={t.raw("contact.numbers")} />
        </Hero.ExtraContent>
      </Hero>
    </main>
  );
}
