"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Button } from "@/app/components/v2/core/Button";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { Hero } from "@/app/components/v2/layouts/Hero";
import { TwoColumnLayout } from "@/app/components/v2/layouts/TwoColumnLayout";

import { Heading2, Heading3, Heading3Small } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { CallUs } from "@/app/components/v2/components/CallUs";
import { FlexLayout } from "@/app/components/v2/layouts/FlexLayout";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { ImagePlaceholder } from "@/app/components/v2/components/ImagePlaceholder";
import { Flex } from "@/app/components/v2/core/Flex";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { Columns } from "@/app/components/v2/core/Columns";

// TypeScript interfaces for the structured data
interface MetaData {
  title: string;
  description: string;
  keywords: string;
  image: string;
}

interface HeroData {
  heading: string;
  subheading: string;
  texts: string[];
  image: { src: string; alt: string };
  numbers: Array<{ number: string; title: string }>;
}

interface IntroData {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
}

interface QuickHelpData {
  heading: string;
  phone: string;
  email: string;
  hours: string;
  contactButton: string;
  image: { src: string; alt: string };
}

interface SupportCategory {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
}

interface SupportCategoriesData {
  heading: string;
  texts: string[];
  learnMore: string;
  categories: {
    leasing: SupportCategory;
    maintenance: SupportCategory;
    billing: SupportCategory;
    accounts: SupportCategory;
  };
  image: { src: string; alt: string };
}

interface OfficeLocation {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface OfficesData {
  heading: string;
  texts: string[];
  viewMap: string;
  locations: OfficeLocation[];
  image: { src: string; alt: string };
}

interface ContactFormQuestion {
  question: string;
  answer: string;
}

interface ContactFormData {
  heading: string;
  texts: string[];
  formTitle: string;
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    selectSubject: string;
    message: string;
  };
  subjects: {
    leasing: string;
    maintenance: string;
    billing: string;
    other: string;
  };
  privacyConsent: string;
  submit: string;
  faq: {
    questions: ContactFormQuestion[];
  };
  image: { src: string; alt: string };
}

// interface PersonnelMember {
//   name: string;
//   title: string;
//   phone: string;
//   email: string;
//   image: { src: string; alt: string };
// }

interface CtaData {
  heading: string;
  texts: string[];
  image: { src: string; alt: string };
  fleetButton: string;
  leasingButton: string;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CustomerService" });
  const meta = t.raw("meta") as MetaData;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: [{ url: meta.image }],
    },
  };
}

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export default async function CustomerServicePage({ params }: Props) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "CustomerService" });

  // Extract structured data
  const hero = t.raw("hero") as HeroData;
  const intro = t.raw("intro") as IntroData;
  const quickHelp = t.raw("quickHelp") as QuickHelpData;
  const supportCategories = t.raw("supportCategories") as SupportCategoriesData;
  const offices = t.raw("offices") as OfficesData;
  const contactForm = t.raw("contactForm") as ContactFormData;
  // const personnel = t.raw("personnel") as PersonnelMember[]; // Not used in current layout
  const cta = t.raw("cta") as CtaData;

  return (
    <PageWrapper>
      {/* Hero Section */}
      <Hero fullWidth isFirst>
        <Hero.Image src={hero.image.src} />
        <Hero.Heading>{hero.heading}</Hero.Heading>
        <Hero.SubHeading>{hero.subheading}</Hero.SubHeading>
        {hero.texts?.map((text: string, idx: number) => (
          <Hero.Text key={idx}>{text}</Hero.Text>
        ))}
        <Hero.ExtraContent>
          <CallUs numbers={hero.numbers} />
        </Hero.ExtraContent>
      </Hero>

      {/* Introduction & Quick Help */}
      <TwoColumnLayout>
        {/* Left: Introduction */}
        <FlexLayout.Column>
          <Heading2>{intro.heading}</Heading2>
          {intro.texts?.map((text: string, idx: number) => (
            <Paragraph key={idx}>{text}</Paragraph>
          ))}
        </FlexLayout.Column>
        {/* Right: Quick Help */}
        <Card palette="beige">
          <Heading3>{quickHelp.heading}</Heading3>
          <Paragraph>
            {quickHelp.phone}
            <br />
            {quickHelp.email}
            <br />
            {quickHelp.hours}
          </Paragraph>
          <LinkButton href="#contact-form">{quickHelp.contactButton}</LinkButton>
        </Card>
      </TwoColumnLayout>

      {/* Support Categories */}
      <BasicLayout palette="light-gray">
        <Flex direction="column">
        <Heading2>{supportCategories.heading}</Heading2>
        {supportCategories.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
       </Flex>
       <Columns columns={{ default: 1, md: 2, lg: 4}}>
        {Object.entries(supportCategories.categories).map(([key, category]) => (
          <Card key={key} gaps="small" padding="none">
            <ImagePlaceholder aspectRatio="4:3" />
            <Heading3>{category.heading}</Heading3>
            {category.texts?.map((text: string, idx: number) => (
              <Paragraph key={idx}>{text}</Paragraph>
            ))}
            <LinkButton href="#">{supportCategories.learnMore}</LinkButton>
          </Card>
        ))}
        </Columns>
      </BasicLayout>

      {/* Offices section */}
      <BasicLayout palette="beige">
      <Flex direction="column">
        <Heading2>{offices.heading}</Heading2>
        {offices.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        </Flex>
        <Columns columns={{ default: 1, md: 3}}>    
        {offices.locations?.map((office: OfficeLocation, index: number) => (
          <Card key={index} gaps="small" padding="none">
            <Heading3>{office.name}</Heading3>
            <Paragraph>{office.address}</Paragraph>
            <Paragraph>{office.phone}</Paragraph>
            <Paragraph>{office.email}</Paragraph>
            <Paragraph>{office.hours}</Paragraph>
            <LinkButton href={`https://maps.google.com/?q=${office.name} ${office.address}`} target="_blank">
              {offices.viewMap}
            </LinkButton>
          </Card>
        ))}
        </Columns>
      </BasicLayout>

      {/* Contact form and FAQ */}
      <FlexLayout palette="light-gray" direction="column">
        <FlexLayout.Column>
          <Flex direction="row">
            <FlexLayout.Column>
              <Heading2>{contactForm.heading}</Heading2>
              {contactForm.texts?.map((text: string, idx: number) => (
                <Paragraph key={idx}>{text}</Paragraph>
              ))}
              <FlexLayout.Column>
                {contactForm.faq.questions?.map((faqItem: ContactFormQuestion, i: number) => (
                  <Flex direction="column" gaps="small" key={i}>
                    <Heading3Small>{faqItem.question}</Heading3Small>
                    <Paragraph>{faqItem.answer}</Paragraph>
                  </Flex>
                ))}
              </FlexLayout.Column>
            </FlexLayout.Column>

            <FlexLayout.Column>
              <Heading3>{contactForm.formTitle}</Heading3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      {contactForm.fields.firstName}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      {contactForm.fields.lastName}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {contactForm.fields.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {contactForm.fields.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    {contactForm.fields.subject}
                  </label>
                  <select
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  >
                    <option value="">{contactForm.fields.selectSubject}</option>
                    <option value="leasing">{contactForm.subjects.leasing}</option>
                    <option value="maintenance">{contactForm.subjects.maintenance}</option>
                    <option value="billing">{contactForm.subjects.billing}</option>
                    <option value="other">{contactForm.subjects.other}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {contactForm.fields.message}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kupari focus:border-kupari"
                  ></textarea>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 h-4 w-4 border border-gray-300 rounded text-kupari focus:ring-kupari"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    {contactForm.privacyConsent}
                  </label>
                </div>
                <Button>{contactForm.submit}</Button>
              </form>
            </FlexLayout.Column>
          </Flex>
        </FlexLayout.Column>
      </FlexLayout>

      {/* Call-to-action section */}
      <Hero fullWidth palette="piki">
        <Hero.Image src={cta.image.src} />
        <Hero.Heading>{cta.heading}</Hero.Heading>
        <Hero.Text>
          <Flex direction="column" gaps="small">
            {cta.texts?.map((text: string, idx: number) => (
              <Paragraph key={idx}>{text}</Paragraph>
            ))}
            <LinkButton href={`/${locale}/autokannan-hallinnointi`}>{cta.fleetButton}</LinkButton>
            <LinkButton href={`/${locale}/leasing-solutions`}>{cta.leasingButton}</LinkButton>
          </Flex>
        </Hero.Text>
      </Hero>
    </PageWrapper>
  );
}
