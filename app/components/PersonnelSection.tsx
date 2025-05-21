"use client";
import { PersonnelCard } from "../components/layouts/Card";
import { Heading2 } from "../components/layouts/CommonElements";
import { useTranslations } from "next-intl";

export default function PersonnelSection() {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <section>
      <div className="text-center md:text-left">
        <Heading2 className="text-piki">{t("team.title")}</Heading2>
      </div>
      <PersonnelCard people={t.raw("personnel")} />
    </section>
  );
}
