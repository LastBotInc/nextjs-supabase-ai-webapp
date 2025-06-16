import { Heading1, Heading2Small } from "@/app/components/v2/core/Headings";
import { List } from "@/app/components/v2/core/List";
import { Paragraph } from "@/app/components/v2/core/Paragraph";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="flex flex-col items-center justify-center mx-auto p-20">
      <Heading1>Welcome to the Admin Dashboard</Heading1>
      <Paragraph>This is the admin dashboard. You can manage the website here.</Paragraph>
      <Heading2Small className="mt-8">Quick links:</Heading2Small>
      <List>
        <List.Item>
          <Link href={`/${locale}/admin/translations`}>Edit texts and translations</Link>
        </List.Item>
      </List>
    </div>
  );
}
