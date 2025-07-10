import type { Metadata } from "next";
import { Inter_Tight, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";
import { CookieConsentWrapper } from "@/components/cookie-consent-wrapper";
import FooterWrapper from "@/app/components/FooterWrapper";
import AIBotMessageWrapper from "@/components/AIBotMessageWrapper";
import { cn } from "@/lib/utils";

// these consts are not used, but they are required by next/font
const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.lastbot.com"),
  title: {
    template: "%s | LastBot - Human-Centric AI Solutions",
    default: "LastBot - Fast-Track Your Business to AI-First | LastBot - Human-Centric AI Solutions",
  },
  description:
    "LastBot helps companies become AI-first while maintaining their focus on people. We provide a fast-track approach to AI integration, creating genuine connections and delivering autonomous solutions that empower businesses in their digital transformation journey.",
  keywords: [
    "AI Solutions",
    "AI Integration",
    "Digital Transformation",
    "Human-Centric AI",
    "Business Automation",
    "AI Consulting",
    "AI Development",
  ],
  authors: [{ name: "LastBot Team" }],
  creator: "LastBot Inc",
  publisher: "LastBot Inc",
  icons: {
    icon: "/images/icon.svg",
    shortcut: "/images/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    type: "website",
    siteName: "LastBot",
    title: "LastBot - Fast-Track Your Business to AI-First",
    description:
      "LastBot helps companies become AI-first while maintaining their focus on people. We provide a fast-track approach to AI integration, creating genuine connections and delivering autonomous solutions.",
    images: [
      {
        url: "/images/og/home.webp",
        width: 1200,
        height: 630,
        alt: "LastBot - Human-Centric AI Solutions",
        type: "image/webp",
      },
    ],
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: "LastBot - Fast-Track Your Business to AI-First",
    description:
      "LastBot helps companies become AI-first while maintaining their focus on people. Fast-track your AI integration journey today.",
    images: ["/images/og/home.webp"],
    creator: "@lastbotai",
    site: "@lastbotai",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: new URL("/en", process.env.NEXT_PUBLIC_SITE_URL || "https://www.lastbot.com").toString(),
    languages: {
      en: new URL("/en", process.env.NEXT_PUBLIC_SITE_URL || "https://www.lastbot.com").toString(),
      fi: new URL("/fi", process.env.NEXT_PUBLIC_SITE_URL || "https://www.lastbot.com").toString(),
      sv: new URL("/sv", process.env.NEXT_PUBLIC_SITE_URL || "https://www.lastbot.com").toString(),
    },
  },
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure locale is one of our supported languages, fallback to 'en'
  const validLocale = ["en", "fi", "sv"].includes(locale) ? locale : "en";

  // Map locale to HTML lang attribute format
  const htmlLang =
    {
      en: "en",
      fi: "fi-FI",
      sv: "sv-SE",
    }[validLocale] || "en";

  return (
    <html lang={htmlLang} dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        {/* Remove unused preload link */}
        {/* <link rel="preload" href="/images/hero-bg-abstract-new.webp" as="image" /> */}
      </head>
      <body className={cn("antialiased")}>
        <AIBotMessageWrapper />
        <Providers>
          {children}
          <FooterWrapper />
          <Toaster />
          <AnalyticsWrapper />
          <CookieConsentWrapper />
        </Providers>
      </body>
    </html>
  );
}
