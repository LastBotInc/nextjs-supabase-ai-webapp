"use client";
import { BlogCardList, BlogPost } from "@/app/components/BlogCardList";
import { useTranslations } from "next-intl";

export default function BlogSection({ posts }: { posts: BlogPost[] }) {
  // Use client-side translations
  const t = useTranslations("Home");
  return (
    <section>
      <h2>{t("news.title")}</h2>
      <BlogCardList posts={posts} />
    </section>
  );
}
