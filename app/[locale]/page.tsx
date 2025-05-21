import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { BlogCardList } from "@/app/components/BlogCardList";
//import { createClient } from "@/utils/supabase/server";
import { NewsCard, PersonnelCard, TwoColumnCard, ColumnCard } from "../components/layouts/Card";
import { CallUs } from "../components/CallUs";
import {
  BlockPadding,
  CommonBlock,
  FullScreenWidthBlock,
  FullWidthContentBlockWithBg,
  MaxWidthContentBlock,
  ColumnBlock,
} from "../components/layouts/Block";
import { LinkLikeButton, Paragraph } from "../components/layouts/CommonElements";
import {
  Heading1,
  Heading2,
  Heading2Small,
  Heading3,
  ShapedContentFlowInParagraph,
} from "../components/layouts/CommonElements";
import { IconPlugCar } from "../components/Icons";
import { ArrowRightIcon } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  await setupServerLocale(locale);
  const tMeta = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: tMeta("title"),
    description: tMeta("description"),
  };
}

export default async function Page() {
  return <p>HELLO</p>;
}
