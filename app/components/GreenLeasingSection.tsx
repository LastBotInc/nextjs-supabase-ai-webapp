"use client";
import { Heading1, Paragraph } from "../components/layouts/CommonElements";
import { LinkLikeButton } from "../components/layouts/CommonElements";
import { IconPlugCar } from "../components/Icons";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function GreenLeasingSection() {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <section className="bg-kupari py-12">
      <div className="relative">
        <Heading1 className="text-piki">{t("greenLeasing.title")}</Heading1>
        {t.raw("greenLeasing.description").map((description: string) => (
          <Paragraph key={description} className="text-piki">
            {description}
          </Paragraph>
        ))}
        <ul className="text-piki list-disc list-inside">
          {t.raw("greenLeasing.list").map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <br />
        <LinkLikeButton className="bg-piki text-white" href={"#"}>
          {t("greenLeasing.readMore")}
        </LinkLikeButton>
        <IconPlugCar className="absolute bottom-0 right-0" />
      </div>
      <Image
        src={"/images/home/514779a641a0c85ec74f7f81387290bd5d4de8a6.png"}
        alt={"transparency.imageAlt"}
        width={800}
        height={480}
        layout="responsive"
        className="object-cover rounded-xl "
        sizes="100vw"
        quality={90}
      />
    </section>
  );
}
