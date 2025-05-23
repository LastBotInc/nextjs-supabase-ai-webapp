"use client";

import dynamic from "next/dynamic";

const GreenLeasingSection = dynamic(() => import("../components/GreenLeasingSection"), { ssr: false });
const PersonnelSection = dynamic(() => import("../components/PersonnelSection"), { ssr: false });
const NewsOrBlogSection = dynamic(() => import("../components/NewsOrBlogSection"), { ssr: false });
const InnoFleetSection = dynamic(() => import("../components/InnoFleetSection"), { ssr: false });
const CarToSearch = dynamic(() => import("../components/CarToSearch"), { ssr: false });

export default function DynamicContent({ locale }: { locale: string }) {
  return (
    <>
      <CarToSearch />
      <InnoFleetSection />
      <NewsOrBlogSection locale={locale} />
      <PersonnelSection />
      <GreenLeasingSection />
    </>
  );
}
