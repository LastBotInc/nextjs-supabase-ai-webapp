"use client";
import { NewsCard, ThreeColumnCard } from "./layouts/Card";
import { useTranslations } from "next-intl";

export default function NewsSection() {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <>
      <ThreeColumnCard oneColumnBreak="lg">
        {/* Card 1 */}
        <NewsCard
          title={t("news.card1.title")}
          text={t("news.card1.description")}
          image={{
            src: "/images/home/fbd9d9f2eb685db6d67715917cb19f5c86abb4d8.png",
            alt: t("news.card1.imageAlt", { defaultValue: "Ford Transit" }),
          }}
          category={t("news.card1.category")}
        />
        {/* Card 2 */}
        <NewsCard
          title={t("news.card2.title")}
          text={t("news.card2.description")}
          image={{
            src: "/images/home/f383847c12f5d779ca1cc2e033f8ab64b992859f.png",
            alt: t("news.card2.imageAlt", { defaultValue: "Sport cars" }),
          }}
          category={t("news.card2.category")}
        />
        {/* Card 3 */}
        <NewsCard
          title={t("news.card3.title")}
          text={t("news.card3.description")}
          image={{
            src: "/images/home/8a775237ed7d12f46cacc356b839daf0c7b36b4e.png",
            alt: t("news.card3.imageAlt", { defaultValue: "Electric truck" }),
          }}
          category={t("news.card3.category")}
        />
      </ThreeColumnCard>
    </>
  );
}
