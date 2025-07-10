import { Flex } from "../core/Flex";
import { Heading3Small } from "../core/Headings";
import { Paragraph } from "../core/Paragraph";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

type NewsItem = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className"> & {
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
  category: string;
};

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
export function NewsCard({ title, text, link, image, category }: NewsItem) {
  return (
    <Flex direction="column" gaps="small">
      {image && (
        <div className="image-container-with-aspect-ratio-5-3 relative rounded-xl overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={90}
          />
        </div>
      )}
      <Flex direction="column" gaps="small">
        <Paragraph className="font-medium text-kupari category-heading">{category}</Paragraph>
        <Heading3Small className="text-piki">{title}</Heading3Small>
        <Paragraph className="text-piki">{text}</Paragraph>
       
      </Flex>
      {link && (
          <div className="flex items-center gap-2">
            <Link href={link.href}>{link.text}</Link>
            <ArrowRightIcon />
          </div>
        )}
    </Flex>
  );
}
