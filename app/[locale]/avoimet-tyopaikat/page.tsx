"use server";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { ImageContainer } from "@/app/components/v2/core/ImageContainer";
import { Card } from "@/app/components/v2/core/Card";
import { Flex } from "@/app/components/v2/core/Flex";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { generateLocalizedMetadata } from "@/utils/metadata";
import { ImagePlaceholder } from "@/app/components/v2/components/ImagePlaceholder";

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OpenPositions" });
  const meta = t.raw("meta");

  return generateLocalizedMetadata({
    title: meta.title,
    description: meta.description,
    locale,
    namespace: "OpenPositions",
    path: "/avoimet-tyopaikat",
  });
}

export default async function OpenPositionsPage({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "OpenPositions" });

  // Raw data blocks
  const aboutCompany = t.raw("aboutCompany");
  const whyWorkHere = t.raw("whyWorkHere");
  const openPositions = t.raw("openPositions");
  const howToApply = t.raw("howToApply");
  const cta = t.raw("cta");
  const promotion = t.raw("promotion");

  return (
    <PageWrapper>
      {/* ABOUT COMPANY SECTION */}
      <TwoColumnLayout palette="betoni" columnWidths={["70%", "30%"]} isFirst>
        <FlexLayout.Column>
          <Heading2>{aboutCompany.heading}</Heading2>
          {aboutCompany.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        <FlexLayout.Column>
          <ImageContainer aspectRatio="4/3" className="flex items-center justify-center">
            <Image 
              src={aboutCompany.image?.src || "/images/team/innolease-office.jpg"} 
              alt={aboutCompany.image?.alt || "Innolease team"} 
              width={320} 
              height={240} 
            />
          </ImageContainer>
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* WHY WORK HERE SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{whyWorkHere.heading}</Heading2>
        {whyWorkHere.subheading && (
          <Paragraph className="text-lg">{whyWorkHere.subheading}</Paragraph>
        )}
        <Flex direction="row" gaps="large" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyWorkHere.cards?.map((card: { title: string; texts: string[]; image?: { src: string; alt: string } }, idx: number) => (
            <Card palette="beige" key={idx} className="flex flex-col" padding="none" contentPadding="full">
              {card.image && (
                <ImagePlaceholder aspectRatio="4:3" />
              )}
              <Heading3>{card.title}</Heading3>
              {card.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx}>{text}</Paragraph>
              ))}
            </Card>
          ))}
        </Flex>
      </BasicLayout>

      {/* OPEN POSITIONS SECTION */}
      <BasicLayout palette="piki">
        <Heading2>{openPositions.heading}</Heading2>
        {openPositions.subheading && (
          <Paragraph className="text-lg">{openPositions.subheading}</Paragraph>
        )}
        <Flex direction="column" gaps="small">
          {openPositions.positions?.map((position: { 
            title: string; 
            department: string; 
            location: string; 
            type: string; 
            texts: string[]; 
            requirements: string[] 
          }, idx: number) => (
            <Card palette="beige" key={idx} className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <Heading3 className="mb-2">{position.title}</Heading3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded">{position.department}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{position.location}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">{position.type}</span>
                  </div>
                </div>
              </div>
              
              {position.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx} className="mb-4">{text}</Paragraph>
              ))}
              
              {position.requirements && position.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <List>
                    {position.requirements.map((requirement: string, reqIdx: number) => (
                      <List.Item key={reqIdx}>{requirement}</List.Item>
                    ))}
                  </List>
                </div>
              )}
            </Card>
          ))}
        </Flex>
      </BasicLayout>

      {/* HOW TO APPLY SECTION */}
      <TwoColumnLayout contentPalette="betoni">
        <FlexLayout.Column>
          <Heading2>{howToApply.heading}</Heading2>
          {howToApply.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
          
          {howToApply.requirements && howToApply.requirements.length > 0 && (
            <>
              <Heading3 className="mt-6">Application Requirements:</Heading3>
              <List>
                {howToApply.requirements.map((requirement: string, idx: number) => (
                  <List.Item key={idx}>{requirement}</List.Item>
                ))}
              </List>
            </>
          )}
        </FlexLayout.Column>
        
        <FlexLayout.Column>
          {howToApply.process && howToApply.process.length > 0 && (
            <Card palette="beige" className="mt-6 md:mt-0">
              <Heading3>Application Process:</Heading3>
              <List>
                {howToApply.process.map((step: string, idx: number) => (
                  <List.Item key={idx}>{step}</List.Item>
                ))}
              </List>
            </Card>
          )}
        </FlexLayout.Column>
      </TwoColumnLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && (
          <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>
        )}
      </BasicLayout>

      {/* PROMOTION SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{promotion.heading}</Heading2>
        {promotion.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        <Flex direction="row" gaps="large">
          {promotion.columns?.map((column: { title: string; texts: string[]; link: { label: string; href: string } }, idx: number) => (
            <Card palette="beige" key={idx}>
              <Heading3>{column.title}</Heading3>
              {column.texts?.map((text: string, textIdx: number) => (
                <Paragraph key={textIdx}>{text}</Paragraph>
              ))}
              {column.link && (
                <LinkButton href={column.link.href}>{column.link.label}</LinkButton>
              )}
            </Card>
          ))}
        </Flex>
      </BasicLayout>
    </PageWrapper>
  );
}
