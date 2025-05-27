"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { Heading3Small, Paragraph } from "./CommonElements";
import { spacing } from "./Block";

type CardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className"> & {
  image?: {
    src: string;
    alt: string;
    shape?: string;
  };
  title?: string;
  text?: string;
  link?: {
    href: string;
    title?: string;
    text: string;
  };
  customClassNames?: {
    card?: string;
    cardContent?: string;
    link?: string;
  };
};

type CardPropsWithImage = CardProps & Required<Pick<CardProps, "image">>;

/**
 * Card component. Wrapper with common styles for all cards. Extendable with custom class names.
 * @param children - The children of the card
 * @param className - The class name of the card
 * @returns A card component
 */
export function Card({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  const defaultClassNames = "relative rounded-2xl overflow-hidden has-overlay-pattern flex flex-col justify-between";
  return <div className={`${defaultClassNames} ${className}`}>{children}</div>;
}
/**
 * Aligns contents of the card so last item is aligned to the bottom of the other cards on same row. Used for cards with buttons as last item.
 * @param children - The children of the align contents top bottom
 * @param className - The class name of the align contents top bottom
 * @returns An align contents top bottom component
 */
export function AlignContentsTopBottom({ children }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className="card-content-aligned-top-bottom">{children}</div>;
}

/**
 * NewsCard component for displaying news articles in a card format.
 * @param title - The title of the news article
 * @param text - The description/content of the news article
 * @param link - Optional link object containing href, text for the "read more" link
 * @param image - Required image object with src and alt text
 * @param category - The category label shown above the title
 * @param customClassNames - Optional object to override default class names for card, cardContent and link
 * @returns A news card component with image, category, title, text and optional link
 */
export function NewsCard({
  title,
  text,
  link,
  image,
  category,
  customClassNames = {},
}: CardPropsWithImage & { category: string }) {
  const defaultClassNames = "";
  const cardClassName = `${customClassNames.card || ""} ${defaultClassNames}`;

  return (
    <Card className={cardClassName}>
      <div className="image-container-with-aspect-ratio-5-3 relative rounded-xl overflow-hidden">
        <div className="bg-tiki"></div>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          quality={90}
        />
      </div>
      <div className="py-6">
        <span className="text-lg font-medium text-kupari mb-2 block uppercase">{category}</span>
        <Heading3Small className="mb-3 text-piki">{title}</Heading3Small>
        <Paragraph className="mb-4 text-piki">{text}</Paragraph>
        {link && (
          <Link href={link.href} className="text-kupari font-medium flex items-center">
            {link.text} <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>
    </Card>
  );
}

/**
 * PersonnelCard component for displaying a grid of personnel/contact cards.
 * Each card shows a photo, name, title, phone, and email, matching the provided image layout.
 * @param people - Array of personnel objects
 * @param columns - Number of columns in the grid (default: 2)
 * @param className - Optional extra classes for the grid
 */
export function PersonnelCard({
  people,
}: {
  people: Array<{
    name: string;
    title: string;
    phone: string;
    email: string;
    image: { src: string; alt: string };
  }>;
  className?: string;
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 justify-center`}>
      {people.map(
        (person: {
          name: string;
          title: string;
          phone: string;
          email: string;
          image: { src: string; alt: string };
        }) => (
          <div key={person.email} className="flex flex-row items-center md:items-start gap-6">
            <div className="mb-2 md:mb-0 w-24 relative" style={{ aspectRatio: "120/170" }}>
              <Image src={person.image.src} alt={person.image.alt} layout="fill" className="grayscale object-cover" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-bold text-lg text-black mb-1">{person.name}</div>
              <div className="text-black mb-3">{person.title}</div>
              <div className="text-black mb-1">
                <a href={`phone:${person.phone}`} className="hover:text-kupari transition-colors">
                  {person.phone}
                </a>
              </div>
              <div className="text-black">
                <a href={`mailto:${person.email}`} className="hover:text-kupari transition-colors">
                  {person.email}
                </a>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/**
 * A base component for creating grid-based card layouts
 * @param children - React child elements to be rendered in the grid
 * @param className - Optional extra classes for customizing the grid
 */

export function ColumnCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid ${spacing.responsiveGap} ${className}`}>{children}</div>;
}
/**
 * A two-column grid layout that collapses to one column at smaller breakpoints
 * @param children - React child elements to be rendered in the grid
 * @param className - Optional extra classes for customizing the grid
 * @param oneColumnBreak - Breakpoint at which the grid collapses to one column (default: "md")
 */

export function TwoColumnCard({
  children,
  className = "",
  oneColumnBreak = "md",
}: {
  children: React.ReactNode;
  className?: string;
  oneColumnBreak?: "md" | "lg" | "xl";
}) {
  return <ColumnCard className={`grid-cols-1 ${oneColumnBreak}:grid-cols-2 ${className}`}>{children}</ColumnCard>;
}

/**
 * A three-column grid layout that collapses to one column at smaller breakpoints
 * @param children - React child elements to be rendered in the grid
 * @param className - Optional extra classes for customizing the grid
 * @param oneColumnBreak - Breakpoint at which the grid collapses to one column (default: "md")
 */

export function ThreeColumnCard({
  children,
  className = "",
  oneColumnBreak = "md",
}: {
  children: React.ReactNode;
  className?: string;
  oneColumnBreak?: "md" | "lg" | "xl";
}) {
  return <ColumnCard className={`grid-cols-1 ${oneColumnBreak}:grid-cols-3 ${className}`}>{children}</ColumnCard>;
}
