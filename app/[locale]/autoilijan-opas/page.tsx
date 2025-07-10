"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import Image from "next/image";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { List } from "@/app/components/v2/core/List";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Flex } from "@/app/components/v2/core/Flex";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

// TypeScript interfaces for the structured data
interface MetaData {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

interface ImageObject {
  src: string;
  alt: string;
}

interface HeroSection {
  heading: string;
  texts: string[];
  image: ImageObject;
}

interface SectionWithTips {
  heading: string;
  texts: string[];
  tips: string[];
  note?: string;
  image: ImageObject;
}

interface AccidentsSection {
  heading: string;
  texts: string[];
  steps: string[];
  image: ImageObject;
}

interface ChecklistItem {
  heading: string;
  items: string[];
}

interface ReturnSection {
  heading: string;
  texts: string[];
  checklist: ChecklistItem;
  mustHave: ChecklistItem;
  remove: ChecklistItem;
  image: ImageObject;
}

interface FaqQuestion {
  question: string;
  answer: string;
}

interface FaqSection {
  heading: string;
  texts: string[];
  questions: FaqQuestion[];
  image: ImageObject;
}

interface ContactNumber {
  title: string;
  number: string;
}

interface ContactSection {
  heading: string;
  texts: string[];
  note: string;
  image: ImageObject;
  numbers: ContactNumber[];
}

// interface DriversGuideData {
//   meta: MetaData;
//   hero: HeroSection;
//   maintenance: SectionWithTips;
//   replacementCar: SectionWithTips;
//   billing: SectionWithTips;
//   tires: SectionWithTips;
//   accidents: AccidentsSection;
//   roadside: SectionWithTips;
//   export: SectionWithTips;
//   return: ReturnSection;
//   faq: FaqSection;
//   contact: ContactSection;
// }

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "DriversGuide" });
  const meta = t.raw('meta') as MetaData;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/${locale}/autoilijan-opas`,
    },
  };
}

export default async function DriversGuidePage({ params }: Props) {
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "DriversGuide" });
  
  // Extract structured data using specific keys
  const hero = t.raw('hero') as HeroSection;
  const maintenance = t.raw('maintenance') as SectionWithTips;
  const replacementCar = t.raw('replacementCar') as SectionWithTips;
  const billing = t.raw('billing') as SectionWithTips;
  const tires = t.raw('tires') as SectionWithTips;
  const accidents = t.raw('accidents') as AccidentsSection;
  const roadside = t.raw('roadside') as SectionWithTips;
  const exportSection = t.raw('export') as SectionWithTips;
  const returnSection = t.raw('return') as ReturnSection;
  const faq = t.raw('faq') as FaqSection;
  const contact = t.raw('contact') as ContactSection;

  return (
    <PageWrapper>
      <Hero isFirst palette="piki" fullWidth>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        {hero.texts.map((text, index) => (
          <Hero.Text key={index}>{text}</Hero.Text>
        ))}
      </Hero>

      <FlexLayout palette="beige">
        <FlexLayout.Column>
          <Heading2>{hero.heading}</Heading2>
          {hero.texts.map((text, index) => (
            <Paragraph key={index} className="mt-2 text-lg">{text}</Paragraph>
          ))}
          <Image
            src={"/images/ajankohtaista.png"}
            alt={"Autoilijan opas"}
            width={2048}
            height={2048}
            layout="responsive"
            className="object-cover rounded-xl "
            sizes="100vw"
            quality={90}
          />
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Accordion>
            <Accordion.Item heading={maintenance.heading}>
              {maintenance.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {maintenance.tips.map((tip, idx) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
              {maintenance.note && <Paragraph className="font-bold">{maintenance.note}</Paragraph>}
            </Accordion.Item>

            <Accordion.Item heading={replacementCar.heading}>
              {replacementCar.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              {replacementCar.note && <Paragraph>{replacementCar.note}</Paragraph>}
            </Accordion.Item>

            <Accordion.Item heading={billing.heading}>
              {billing.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {billing.tips.map((tip, idx) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
              {billing.note && <Paragraph className="font-bold">{billing.note}</Paragraph>}
            </Accordion.Item>

            <Accordion.Item heading={tires.heading}>
              {tires.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {tires.tips.map((tip, idx) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>

            <Accordion.Item heading={accidents.heading}>
              {accidents.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {accidents.steps.map((step, idx) => (
                  <List.Item key={idx}>{step}</List.Item>
                ))}
              </List>
            </Accordion.Item>

            <Accordion.Item heading={roadside.heading}>
              {roadside.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {roadside.tips.map((tip, idx) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>

            <Accordion.Item heading={exportSection.heading}>
              {exportSection.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              <List className="palette-text-color">
                {exportSection.tips.map((tip, idx) => (
                  <List.Item key={idx}>{tip}</List.Item>
                ))}
              </List>
            </Accordion.Item>

            <Accordion.Item heading={returnSection.heading}>
              {returnSection.texts.map((text, index) => (
                <Paragraph key={index}>{text}</Paragraph>
              ))}
              
              {/* Checklist */}
              <div className="">
                <Heading3>{returnSection.checklist.heading}</Heading3>
                <List className="palette-text-color">
                  {returnSection.checklist.items.map((item, idx) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>

              {/* Must Have */}
              <div className="">
                <Heading3>{returnSection.mustHave.heading}</Heading3>
                <List className="palette-text-color">
                  {returnSection.mustHave.items.map((item, idx) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>

              {/* Remove */}
              <div className="">
                <Heading3>{returnSection.remove.heading}</Heading3>
                <List className="palette-text-color">
                  {returnSection.remove.items.map((item, idx) => (
                    <List.Item key={idx}>{item}</List.Item>
                  ))}
                </List>
              </div>
            </Accordion.Item>
          </Accordion>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout palette="piki">
        <FlexLayout.Column>
          <Heading2>{faq.heading}</Heading2>
          {faq.texts.map((text, index) => (
            <Paragraph key={index}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <Accordion>
            {faq.questions.map((question, idx) => (
              <Accordion.Item key={idx} heading={question.question}>
                <Paragraph>{question.answer}</Paragraph>
              </Accordion.Item>
            ))}
          </Accordion>
        </FlexLayout.Column>
      </FlexLayout>

      <FlexLayout palette="piki" mainImage={{ src: contact.image.src, backgroundPosition: "top center" }}>
        <FlexLayout.Column className="shadow-text-sharp">
          <Flex direction="column" gaps="large">
            <Heading2 className="max-w-2xl">{contact.heading}</Heading2>
            {contact.texts.map((text, index) => (
              <Paragraph key={index} variant="large">{text}</Paragraph>
            ))}
            <Paragraph variant="large">{contact.note}</Paragraph>
            <div className="self-start">
              <CallUs className="justify-self-start" numbers={contact.numbers} />
            </div>
          </Flex>
        </FlexLayout.Column>
      </FlexLayout>
    </PageWrapper>
  );
}
