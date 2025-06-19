"use client";
import { Columns } from "../core/Columns";
import { NewsCard } from "./NewsCard";

type NewsCardData = {
  title: string;
  texts: string[];
  link?: {
    label: string;
    href: string;
  };
  image?: {
    src: string;
    alt: string;
  };
  category: string;
};

interface NewsSectionProps {
  cards?: NewsCardData[];
}

/**
 * NewsSection component is used to display a list of news cards.
 * @param cards - Optional array of news cards data. If not provided, uses client-side translations.
 * @returns A div element with a list of news cards.
 */
export default function NewsSection({ cards }: NewsSectionProps) {
  if (cards && cards.length > 0) {
    return (
      <>
        <Columns columns={{ default: 1, lg: 3 }}>
          {cards.map((card, index) => (
            <NewsCard
              key={index}
              title={card.title}
              text={card.texts?.[0] || ""} // Use first text from texts array
              image={{
                src: card.image?.src as string,
                alt: card.image?.alt || card.title,
              }}
              category={card.category}
              link={card.link ? { href: card.link.href, text: card.link.label } : undefined}
            />
          ))}
        </Columns>
      </>
    );
  }

 
}


