"use server";

import { getTranslations } from "next-intl/server";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { PageWrapper } from "@/app/components/v2/core/PageWrapper";
import { BasicLayout } from "@/app/components/v2/layouts/BasicLayout";
import { ThreeColumnLayout } from "@/app/components/v2/layouts/ThreeColumnLayout";
import { Heading1, Heading2, Heading3 } from "@/app/components/v2/core/Headings";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { List } from "@/app/components/v2/core/List";
import { Table } from "@/app/components/v2/core/Table";
import { Accordion } from "@/app/components/v2/core/Accordion";
import { Card } from "@/app/components/v2/core/Card";
import { LinkButton } from "@/app/components/v2/core/LinkButton";
import { generateLocalizedMetadata } from "@/utils/metadata";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Billing.meta" });

  return generateLocalizedMetadata({
    title: t("title"),
    description: t("description"),
    locale: params.locale,
    namespace: "Billing",
    path: "/laskutus",
  });
}

export default async function BillingPage({ params }: { params: { locale: string } }) {
  // Setup localization
  const { locale } = await params;
  await setupServerLocale(locale);
  const t = await getTranslations({ locale, namespace: "Billing" });

  // Get data from translations
  const introduction = t.raw("introduction");
  const billingProcess = t.raw("billingProcess");
  const paymentMethods = t.raw("paymentMethods");
  const billingSupport = t.raw("billingSupport");
  const companyBillingInfo = t.raw("companyBillingInfo");
  const paymentInstructions = t.raw("paymentInstructions");
  const faq = t.raw("faq");
  const cta = t.raw("cta");
  const additionalCta = t.raw("additionalCta");

  return (
    <PageWrapper>
      {/* INTRODUCTION SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading1>{introduction.heading}</Heading1>
        {introduction.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx} variant="large">
            {text}
          </Paragraph>
        ))}
      </BasicLayout>

      {/* COMPANY BILLING INFO SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{companyBillingInfo.heading}</Heading2>
        {companyBillingInfo.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        <Card palette="beige">
          <Heading3>Company Details</Heading3>
          <Paragraph>
            <strong>Company:</strong> {companyBillingInfo.details.companyName}
          </Paragraph>
          <Paragraph>
            <strong>Business ID:</strong> {companyBillingInfo.details.businessId}
          </Paragraph>
          <Paragraph>
            <strong>VAT Number:</strong> {companyBillingInfo.details.vatNumber}
          </Paragraph>
          <Paragraph>
            <strong>Address:</strong>
            <br />
            {companyBillingInfo.details.address.street}
            <br />
            {companyBillingInfo.details.address.postalCode} {companyBillingInfo.details.address.city}
            <br />
            {companyBillingInfo.details.address.country}
          </Paragraph>
        </Card>

        <Card palette="kupari">
          <Heading3>Bank Details</Heading3>
          <Paragraph>
            <strong>Bank:</strong> {companyBillingInfo.details.bankDetails.bankName}
          </Paragraph>
          <Paragraph>
            <strong>IBAN:</strong> {companyBillingInfo.details.bankDetails.iban}
          </Paragraph>
          <Paragraph>
            <strong>BIC/SWIFT:</strong> {companyBillingInfo.details.bankDetails.bic}
          </Paragraph>
          <Paragraph>
            <strong>Account Holder:</strong> {companyBillingInfo.details.bankDetails.accountHolder}
          </Paragraph>
        </Card>

        <Card palette="maantie">
          <Heading3>{companyBillingInfo.details.reference.heading}</Heading3>
          <Paragraph>{companyBillingInfo.details.reference.text}</Paragraph>
        </Card>
      </BasicLayout>

      {/* PAYMENT INSTRUCTIONS SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{paymentInstructions.heading}</Heading2>
        {paymentInstructions.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        {paymentInstructions.steps && (
          <List>
            {paymentInstructions.steps.map((step: { title: string; description: string }, idx: number) => (
              <li key={idx}>
                <strong>{step.title}:</strong> {step.description}
              </li>
            ))}
          </List>
        )}
      </BasicLayout>
      {/* BILLING PROCESS SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{billingProcess.heading}</Heading2>
        {billingProcess.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        {billingProcess.list && (
          <List>
            {billingProcess.list.map((item: { term: string; description: string }, idx: number) => (
              <li key={idx}>
                <strong>{item.term}:</strong> {item.description}
              </li>
            ))}
          </List>
        )}
      </BasicLayout>

      {/* PAYMENT METHODS SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{paymentMethods.heading}</Heading2>
        {paymentMethods.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        {paymentMethods.table && <Table headings={paymentMethods.table.columns} rows={paymentMethods.table.rows} />}
      </BasicLayout>

      {/* BILLING SUPPORT SECTION */}
      <BasicLayout contentPalette="light-gray">
        <Heading2>{billingSupport.heading}</Heading2>
        {billingSupport.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        {billingSupport.list && (
          <List>
            {billingSupport.list.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </List>
        )}
      </BasicLayout>

      {/* FAQ SECTION */}
      <BasicLayout contentPalette="betoni">
        <Heading2>{faq.heading}</Heading2>
        {faq.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}

        {faq.questions && (
          <Accordion>
            {faq.questions.map((item: { question: string; answer: string }, idx: number) => (
              <Accordion.Item key={idx} heading={item.question}>
                <Paragraph>{item.answer}</Paragraph>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </BasicLayout>

      {/* CTA SECTION */}
      <BasicLayout contentPalette="maantie">
        <Heading2>{cta.heading}</Heading2>
        {cta.texts?.map((text: string, idx: number) => (
          <Paragraph key={idx}>{text}</Paragraph>
        ))}
        {cta.link && <LinkButton href={cta.link.href}>{cta.link.label}</LinkButton>}
      </BasicLayout>

      {/* ADDITIONAL CTA SECTION */}
      <ThreeColumnLayout contentPalette="light-gray">
        <Card palette="beige">
          <Heading3>{additionalCta.portal.heading}</Heading3>
          <Paragraph>{additionalCta.portal.text}</Paragraph>
          <LinkButton href={additionalCta.portal.buttonHref}>{additionalCta.portal.buttonText}</LinkButton>
        </Card>

        <Card palette="beige">
          <Heading3>{additionalCta.support.heading}</Heading3>
          <Paragraph>{additionalCta.support.text}</Paragraph>
          <LinkButton href={additionalCta.support.buttonHref}>{additionalCta.support.buttonText}</LinkButton>
        </Card>

        <Card palette="beige">
          <Heading3>{additionalCta.contact.heading}</Heading3>
          <Paragraph>{additionalCta.contact.text}</Paragraph>
          <LinkButton href={additionalCta.contact.buttonHref}>{additionalCta.contact.buttonText}</LinkButton>
        </Card>
      </ThreeColumnLayout>
    </PageWrapper>
  );
}
