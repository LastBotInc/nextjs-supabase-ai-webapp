"use client";
import { ArrowRightIcon } from "lucide-react";
import BlogSection from "./BlogSection";
import { FullScreenWidthBlock, MaxWidthContentBlock } from "./layouts/Block";
import { Heading2Small, LinkLikeButton } from "./layouts/CommonElements";
import NewsSection from "./NewsSection";
//import { createClient } from "@/utils/supabase/server";
//import { getTranslations } from "next-intl/server";
import { BlogPost } from "./BlogCardList";
import { useTranslations } from "next-intl";

export default function NewsOrBlogSection({ locale }: { locale: string }) {
  if (locale) {
    //
  }
  const t = useTranslations("Home");
  /*
  const t = await getTranslations({ locale, namespace: "Home" });
  // Fetch the latest 3 news blog posts
  const supabase = createClient();
  const { data: blogPosts } = await supabase
    .from("posts")
    .select("id, title, excerpt, featured_image, slug, created_at")
    .eq("locale", locale)
    .eq("subject", "news")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // Transform blog posts for the BlogCardList component
  const blogPostsFormatted = (blogPosts || []).map((post) => ({
    id: post.id,
    title: post.title,
    description: post.excerpt,
    imageSrc: post.featured_image || "/images/no-bg/etruck.png", // Fallback image if none provided
    imageAlt: post.title,
    date: new Date(post.created_at).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    href: `/blog/${post.slug}`,
  }));
  */
  const blogPostsFormatted: BlogPost[] = [];
  return (
    <FullScreenWidthBlock className="bg-gray-200 py-12">
      <MaxWidthContentBlock className="py-12 flex items-center gap-2">
        <ArrowRightIcon className=" text-piki" width={50} height={50} strokeWidth={1} />
        <Heading2Small className="text-piki">Ajankohtaista</Heading2Small>
      </MaxWidthContentBlock>
      <MaxWidthContentBlock>
        {blogPostsFormatted.length > 0 ? (
          <BlogSection posts={blogPostsFormatted} />
        ) : (
          // Lazy load the fallback news section as a client component
          <NewsSection />
        )}
      </MaxWidthContentBlock>
      <MaxWidthContentBlock className="flex items-center justify-center">
        <LinkLikeButton className="mt-8 bg-piki text-white" href="#">
          {t("news.viewAll")}
        </LinkLikeButton>
      </MaxWidthContentBlock>
    </FullScreenWidthBlock>
  );
}
