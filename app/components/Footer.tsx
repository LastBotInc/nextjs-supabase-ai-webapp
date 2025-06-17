"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import InnoleaseLogo from "@/app/components/InnoleaseLogo";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { FlexLayout } from "./v2/layouts/FlexLayout";
import { Flex } from "./v2/core/Flex";
import { Columns } from "./v2/core/Columns";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("Footer");

  return (
    <footer className="border-t palette-border-color mt-auto color-palette-light-gray palette-text-color palette-background-color">
      <FlexLayout direction="column">
        <Flex gaps="large" className="justify-between">
          {/* Column 1: Company Information */}
          <div>
            <InnoleaseLogo className="mb-8" />
            <p>Innolease Oy</p>
            <p>
              Katuosoite 10
              <br />
              01150 Kaupunki
            </p>
            <p>Y-tunnus: 2661196-9</p>
          </div>

          {/* Column 2: Office Locations */}
          <div>
            <h3 className="font-semibold tracking-wider uppercase mb-4">{t("contact")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/yhteystiedot?city=helsinki`}>020 745 0000</Link>
              </li>
              <li>
                <Link href={`/${locale}/yhteystiedot?city=oulu`}>info@innolease.fi</Link>
              </li>
              <li>
                <Link href={`/${locale}/yhteystiedot?city=vantaa`}>Kaikki yhteystiedot</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className=" font-semibold tracking-wider uppercase mb-4">{t("resources")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/kalustoraportti`}>{t("fleet_reporting")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/paastoraportti`}>{t("emissions_report")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/sahkoinen-ajopaivakirja`}>{t("driving_log")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/autoilijan-opas`}>{t("drivers_guide")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/leasingauton-palautusohje`}>{t("leasing_car_return")}</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Tools */}
          <div>
            <h3 className=" font-semibold tracking-wider uppercase mb-4">{t("tools")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/autopaattajan-tyokalut`}>{t("car_decision_tools")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/autoetulaskuri`}>{t("car_benefit_calculator")}</Link>
              </li>
              <li>
                <Link href={`/${locale}/sahkoautojen-vertailu`}>{t("ev_comparison")}</Link>
              </li>
            </ul>
          </div>
        </Flex>

        {/* Bottom section with social media, copyright, etc. */}
        <div className="mt-12 pt-8 border-t palette-border-color">
          <Flex className="justify-between">
            {/* Copyright info */}
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
              <p>
                © {new Date().getFullYear()} Innolease Oy. {t("rights")}
              </p>
              <div className="flex space-x-4">
                <Link href={`/${locale}/privacy`}>{t("privacy")}</Link>
                <Link href={`/${locale}/terms`}>{t("terms")}</Link>
                <Link href={`/${locale}/cookies`}>{t("cookies")}</Link>
              </div>
            </div>

            {/* Social media and Auth Links */}
            <div className="flex items-center space-x-4 justify-start md:justify-end text-xs">
              {/* Social links */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="palette-icon-color"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="palette-icon-color"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="palette-icon-color"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </Flex>
        </div>
      </FlexLayout>
    </footer>
  );
}
