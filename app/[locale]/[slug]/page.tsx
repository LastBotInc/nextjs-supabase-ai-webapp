import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Database } from "@/types/database";
import { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { setupServerLocale } from "@/app/i18n/server-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Define the original type
type LandingPage = Database["public"]["Tables"]["landing_pages"]["Row"];

// Define a specific type for the public view manually
type PublicLandingPageView = {
  id: string;
  title: string;
  slug: string;
  locale: string;
  content: string;
  custom_head: string | null;
  custom_css: string | null;
  custom_js: string | null;
  featured_image: string | null;
  meta_description: string | null;
  seo_data: unknown | null; // Use 'any' or a more specific type if the structure is known
  cta_headline: string | null;
  cta_description: string | null;
  cta_button_text: string | null;
  cta_button_link: string | null;
  cta_secondary_text: string | null;
};

type Props = {
  params: {
    locale: string;
    slug: string;
  };
};

// Function to strip HTML tags from content
function stripHtmlTags(html: string): string {
  return html?.replace(/<[^>]*>/g, "") || "";
}

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise;
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: "LandingPages" });

  // Use explicit ANON client for consistency and to ensure anon RLS is checked
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: page, error } = await supabase
    .from("landing_pages")
    .select(
      `
      id,
      title,
      slug,
      locale,
      published,
      content,
      meta_description,
      featured_image,
      seo_data
    `
    )
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .single();

  if (error || !page) {
    console.error("Error fetching landing page for metadata:", error);
    return {
      title: t("notFound"),
      description: t("notFoundDescription"),
    };
  }

  const description = page.meta_description || stripHtmlTags(page.content).substring(0, 150);

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
      type: "website",
      ...(page.seo_data?.openGraph || {}),
      images: page.featured_image
        ? [
            {
              url: page.featured_image,
              width: 1200,
              height: 630,
              alt: page.title,
            },
          ]
        : undefined,
    },
    twitter: {
      title: page.title,
      description,
      images: page.featured_image ? [page.featured_image] : undefined,
      ...(page.seo_data?.twitter || {}),
    },
    ...(page.seo_data?.metadata || {}),
  };
}

async function getLandingPage(slug: string, locale: string): Promise<PublicLandingPageView | null> {
  const cookieStore = await cookies(); // Restore await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use ANON key for public pages
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // No need for set/remove for read-only anon access
      },
    }
  );

  console.log(`Fetching landing page: slug=${slug}, locale=${locale}`); // Add logging
  const { data: page, error } = await supabase
    .from("landing_pages")
    // Explicitly select required columns, including CTAs
    .select(
      `
      id,
      title,
      slug,
      locale,
      content,
      custom_head,
      custom_css,
      custom_js,
      featured_image,
      meta_description,
      seo_data,
      cta_headline, 
      cta_description,
      cta_button_text,
      cta_button_link,
      cta_secondary_text
    `
    )
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .single();

  if (error) {
    console.error("Error fetching landing page:", error);
    return null;
  }

  // Cast should now work with the manually defined type
  return page as PublicLandingPageView | null;
}

export default async function LandingPage({ params: paramsPromise }: Props) {
  const params = await paramsPromise;
  const { locale, slug } = params;
  await setupServerLocale(locale);
  const page: PublicLandingPageView | null = await getLandingPage(slug, locale);

  if (!page) {
    notFound()
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white font-inter">
      {/* Custom head content */}
      {page.custom_head && <div dangerouslySetInnerHTML={{ __html: page.custom_head }} />}

      {/* Custom CSS */}
      {page.custom_css && <style dangerouslySetInnerHTML={{ __html: page.custom_css }} />}

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 overflow-hidden"
        style={{
          backgroundImage: `url('/images/landing-hero-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> {/* Overlay */}
        <div className="relative container mx-auto px-4 text-center z-10">
          <h1 className="font-geist text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {page.title}
            </span>
          </h1>
          {page.meta_description && (
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-300 mb-10">{page.meta_description}</p>
          )}
          {/* Use CTA Button from DB if text exists */}
          {page.cta_button_text && (
            <Button
              asChild // Render as child to allow wrapping with <a>
              size="lg"
              className="bg-gradient-to-r from-[#E078F9] to-[#2B39FF] hover:opacity-90 transition-opacity text-white font-bold text-lg px-8 py-4 rounded-lg"
            >
              <a href={page.cta_button_link || "#"}>{page.cta_button_text}</a>
            </Button>
          )}
        </div>
      </section>

      {/* Main Content Section - Rendered from fetched content */}
      <section className="py-16 lg:py-24">
        <div
          className={cn(
            "prose prose-invert lg:prose-lg mx-auto max-w-4xl px-4",
            "prose-headings:font-geist prose-headings:text-white",
            "prose-h1:text-3xl prose-h1:mb-6 prose-h1:font-bold",
            "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:font-semibold",
            "prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-semibold",
            "prose-p:text-white",
            "prose-li:text-white",
            "prose-ul:list-disc prose-ul:pl-6 prose-li:my-1",
            "prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1",
            "prose-li:marker:text-indigo-400",
            "prose-a:text-white hover:prose-a:text-gray-200 prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-gray-100 prose-strong:font-semibold",
            "prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400"
          )}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </section>

      {/* Optional: Add other sections based on the design concept here if needed */}
      {/* e.g., Features Section, Social Proof, Final CTA */}

      {/* Example Final CTA Section (Using DB fields) */}
      <section className="bg-gray-800 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          {page.cta_headline && (
            <h2 className="font-geist text-3xl sm:text-4xl font-bold mb-6 text-white">{page.cta_headline}</h2>
          )}
          {page.cta_description && <p className="max-w-2xl mx-auto text-gray-400 mb-8">{page.cta_description}</p>}
          {/* Use CTA Button from DB if text exists */}
          {page.cta_button_text && (
            <Button
              asChild // Render as child to allow wrapping with <a>
              size="lg"
              className="bg-gradient-to-r from-[#E078F9] to-[#2B39FF] hover:opacity-90 transition-opacity text-white font-bold text-lg px-8 py-4 rounded-lg"
            >
              <a href={page.cta_button_link || "#"}>{page.cta_button_text}</a>
            </Button>
          )}
          {page.cta_secondary_text && <p className="mt-4 text-sm text-gray-500">{page.cta_secondary_text}</p>}
        </div>
      </section>

      {/* Custom scripts */}
      {page.custom_js && <script dangerouslySetInnerHTML={{ __html: page.custom_js }} />}
    </div>
  );
}
