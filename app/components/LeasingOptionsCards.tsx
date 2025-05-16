"use client";

import { useTranslations, useLocale } from "next-intl";
import { CardWithAlignedBottomAndTextWrappingImage, customCardStyle2, customCardStyle1 } from "./layouts/Card";

interface LeasingOptionsCardsProps {
  className?: string;
}

export function LeasingOptionsCards({ className = "" }: LeasingOptionsCardsProps) {
  const t = useTranslations("Home");
  const locale = useLocale();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <CardWithAlignedBottomAndTextWrappingImage
        title={t("leasingOptions.personalizedTitle")}
        text={t("leasingOptions.personalizedDescription").repeat(3)}
        link={{ href: `/${locale}/business-leasing`, text: t("leasingOptions.learnMore") }}
        image={{
          src: "/images/no-bg/mercedes-car-cropped.png",
          alt: "Mercedes Benz",
          shape: "polygon(0% 100%, 0% 42%, 27% 27%, 42% 0%, 100% 0%, 100% 100%)",
        }}
        customClassNames={customCardStyle1}
      />
      <CardWithAlignedBottomAndTextWrappingImage
        title={t("leasingOptions.flexibleTitle")}
        text={t("leasingOptions.flexibleDescription").repeat(3)}
        link={{ href: `/${locale}/business-leasing`, text: t("leasingOptions.learnMore") }}
        image={{
          src: "/images/no-bg/pickup-truck-cropped.png",
          alt: "Pickup truck",
          shape: "polygon(0% 100%, 0% 27%, 29% 19%, 39% 0%, 100% 0%, 100% 100%)",
        }}
        customClassNames={customCardStyle2}
      />
    </div>
  );
}
