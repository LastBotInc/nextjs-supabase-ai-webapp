import { Metadata } from "next";
import { generateLocalizedMetadata } from "@/utils/metadata";
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    locale: string;
  }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generateLocalizedMetadata({
    locale,
    namespace: "Admin",
    title: "Admin",
    description: "Innolease Admin Dashboard",
    type: "website",
    path: "/admin",
  });
}

// Server component wrapper
export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  return <AdminLayoutClient params={{ locale }}>{children}</AdminLayoutClient>;
}
