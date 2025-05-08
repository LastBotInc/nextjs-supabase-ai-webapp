"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { CardContentWithTextFloatAroundShape, Card, AlignContentsTopBottom } from "./layouts/Card";

interface LeasingOptionsCardsProps {
  className?: string;
}

export function LeasingOptionsCards({ className = "" }: LeasingOptionsCardsProps) {
  const t = useTranslations("Home");
  const locale = useLocale();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Left Card - Personal Leasing */}
      <Card className="bg-kupari overlay-pattern-innolease-1 overlay-opacity-15">
        <CardContentWithTextFloatAroundShape>
          <AlignContentsTopBottom>
            <h3 className="text-2xl font-bold mb-2 text-left leading-tight">{t("leasingOptions.personalizedTitle")}</h3>
            <div className="flex">
              <p className="text-sm mb-4 text-left">
                <span className="bottom-right-text-float mercedes-car-text-float">
                  <img src="/images/no-bg/mercedes-car-cropped.png" alt="Pickup truck" />
                </span>
                {t("leasingOptions.personalizedDescription")}
                {t("leasingOptions.personalizedDescription")}
                {t("leasingOptions.personalizedDescription")}
              </p>
            </div>
            <div>
              <Link
                href={`/${locale}/personal-leasing`}
                className="inline-block bg-white text-piki px-4 py-1.5 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm"
              >
                {t("leasingOptions.learnMore")}
              </Link>
            </div>
          </AlignContentsTopBottom>
        </CardContentWithTextFloatAroundShape>
      </Card>
      <Card className="bg-betoni overlay-pattern-innolease-2 overlay-opacity-15 text-white">
        <CardContentWithTextFloatAroundShape>
          <AlignContentsTopBottom>
            <h3 className="text-2xl font-bold mb-2 text-left leading-tight">{t("leasingOptions.flexibleTitle")}</h3>
            <div className="flex">
              <p className="text-sm mb-4 text-left">
                <span className="bottom-right-text-float pickup-truck-text-float">
                  <img src="/images/no-bg/pickup-truck-cropped.png" alt="Pickup truck" />
                </span>
                {t("leasingOptions.flexibleDescription")}
              </p>
            </div>
            <div>
              <Link
                href={`/${locale}/business-leasing`}
                className="inline-block bg-kupari text-white px-4 py-1.5 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm"
              >
                {t("leasingOptions.learnMore")}
              </Link>
            </div>
          </AlignContentsTopBottom>
        </CardContentWithTextFloatAroundShape>
      </Card>
    </div>
  );
}
