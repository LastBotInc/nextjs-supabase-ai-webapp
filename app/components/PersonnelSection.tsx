"use client";
import { ColumnCard, PersonnelCard } from "../components/layouts/Card";
import { Heading2 } from "../components/layouts/CommonElements";
import { useTranslations } from "next-intl";
import { CommonBlock } from "./layouts/Block";

export default function PersonnelSection() {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <CommonBlock className="bg-white px-0">
      <ColumnCard className="bg-transparent grid-cols-[40%_67%]">
        {/* Left Column: Heading (centered) */}
        <div className="text-center md:text-left">
          <Heading2 className="text-piki">{t("team.title")}</Heading2>
        </div>

        {/* Right Column: Paragraphs and Button */}
        <PersonnelCard people={t.raw("personnel")} />
      </ColumnCard>
    </CommonBlock>
  );
}
