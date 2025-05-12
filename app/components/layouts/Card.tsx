"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

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

type CardPropsWithTexts = Omit<CardProps, "image">;
type LinkCard = CardPropsWithTexts & Required<Pick<CardPropsWithTexts, "link">>;
type CardPropsWithImage = CardProps & Required<Pick<CardProps, "image">>;
type CardPropsWithImageAndExtraChild = Omit<CardPropsWithImage, "text"> & {
  children?: React.ReactNode;
  text: string | string[];
};

export const customCardStyle1: CardProps["customClassNames"] = {
  card: "bg-kupari overlay-pattern-innolease-1",
  link: "bg-white text-piki",
};

export const customCardStyle2: CardProps["customClassNames"] = {
  card: "bg-betoni overlay-pattern-innolease-2",
  link: "bg-kupari text-white",
};
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
 * Card content component. Wrapper with common styles for all card content. Extendable with custom class names.
 * @param children - The children of the card content
 * @param className - The class name of the card content
 * @returns A card content component
 */
export function CardContent({
  children,
  className = "",
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  const defaultClassNames = "p-6 pb-16 relative flex";
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
 * Card title, text and link and image component. Text is wrapped around the image with a shape.
 * @param title - The title of the card
 * @param text - The text of the card
 * @param link - The link of the card
 * @param image - The image of the card
 * @param customClassNames - The custom class names of each child the card
 */
export function CardWithAlignedBottomAndTextWrappingImage({
  title,
  text,
  link,
  image,
  customClassNames,
}: CardPropsWithImage) {
  return (
    <Card className={customClassNames?.card}>
      <CardContent>
        <AlignContentsTopBottom>
          <h3 className="text-2xl font-bold mb-2 text-left leading-tight">{title}</h3>
          <div className="flex">
            <p className="text-sm mb-4 text-left">
              <span className="bottom-right-text-float" style={{ "--shape": image.shape } as React.CSSProperties}>
                <img src={image.src} alt={image.alt} />
              </span>
              {text}
            </p>
          </div>
          {link && (
            <div>
              <Link
                href={link.href}
                title={link.title}
                className={`inline-block px-4 py-1.5 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm ${
                  customClassNames?.link ?? ""
                }`}
              >
                {link.text}
              </Link>
            </div>
          )}
        </AlignContentsTopBottom>
      </CardContent>
    </Card>
  );
}

/**
 * Card with content in this order: image aspect ratio 5/3, small  timestamp, title, text,  and read more link.
 * @param title - The title of the card
 * @param text - The text of the card
 * @param link - The link of the card
 * @param image - The image of the card
 * @param date - The date of the card
 */
export function CardWithTopImageAndTimestamp({
  title,
  text,
  link,
  image,
  date,
  customClassNames = {},
}: CardPropsWithImage & { date: string }) {
  const defaultClassNames = "rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white";
  const cardClassName = `${customClassNames.card || ""} ${defaultClassNames}`;

  return (
    <Card className={cardClassName}>
      <div className="image-container-with-aspect-ratio-5-3 relative">
        <div className=" bg-beige"></div>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 33vw"
          quality={90}
        />
      </div>
      <div className="p-6">
        <span className="text-sm font-medium text-kupari mb-2 block">{date}</span>
        <h3 className="text-xl font-bold mb-3 text-piki">{title}</h3>
        <p className="text-betoni mb-4">{text}</p>
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
 * Card where whole area is a link.
 * @param title - The title of the card
 * @param text - The text of the card
 * @param link - The link of the card
 * @param customClassNames - The custom class names of the card
 */
export function LinkCardWithTexts({ title, text, link, customClassNames = {} }: LinkCard) {
  const defaultClassNames = "rounded-lg overflow-hidden block p-6 bg-beige text-piki hover:opacity-90 transition-all";
  const linkClassName = `${customClassNames.link || ""} ${defaultClassNames}`;
  return (
    <Link href={link.href} className={linkClassName}>
      <div className="flex flex-col h-full">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4">{text}</p>
        <div className="mt-auto text-sm font-medium flex items-center">
          {link.text} <ArrowRightIcon className="ml-1 h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

/**
 * Card with full width background image title, text and link and optional extra children.
 * @param title - The title of the card
 * @param text - The text of the card
 * @param link - The link of the card
 * @param image - The image of the card
 * @param children - The children of the card positioned on the right side of the card
 */
export function CardForFullWidthImageAndExtraChild({
  title,
  text,
  link,
  image,
  children,
  customClassNames = {},
}: CardPropsWithImageAndExtraChild) {
  const defaultClassNames = "w-full py-16 text-white relative";
  const defaultLinkClassNames = "bg-kupari hover:bg-kupari/90 text-white px-8 py-3 text-lg";
  const cardClassName = `${customClassNames.card || ""} ${defaultClassNames}`;
  const linkClassName = `${customClassNames.link || ""} ${defaultLinkClassNames}`;
  const textArray = Array.isArray(text) ? text : [text];
  return (
    <section className={cardClassName}>
      {/* Dark background image with car */}
      <div className="absolute inset-0">
        <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="100vw" quality={90} />
      </div>
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-4 font-['Inter_Tight']">{title}</h2>
            {textArray.map((t) => (
              <p key={t} className="mb-6 text-lg text-gray-100">
                {t}
              </p>
            ))}

            {link && (
              <Button variant="default" size="lg" className={linkClassName}>
                {link.text}
              </Button>
            )}
          </div>
          {children && <div className="relative">{children}</div>}
        </div>
      </div>
    </section>
  );
}
