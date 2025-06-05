/**
 * Card is a component that is used for displaying content in a card format. It mainly aligns content property with common spacing.
 *
 * It accepts only its own slots as children:
 *
 * - Heading - A slot for a heading of the card. Renders a heading component. Use "level" prop to set the heading level.
 *     If the Heading component is passed as a child for the Card component, it will be rendered, not two headings.
 * - Content - A slot for a content of the card. Renders a content component. If the Content component is passed as a child for the Card component, it will be rendered as a content.
 * - Image - A slot for an image of the card. Renders an image component. If the Image component is passed as a child for the Card component, it will be rendered as an image.
 * - TopImage - A slot for a top image of the card. Renders a top image component. If the TopImage component is passed as a child for the Card component, it will be rendered as a top image.
 *
 * - Content, Image and TopImage are rendered as is, no wrappers are set.
 * @param children - The children of the card.
 */
import { Children, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mapSlots } from "../core/mapSlots";
import { HeadingProps, HeadingComponent, isHeadingComponent } from "../core/Headings";
import { ContentBlock } from "../core/types";
import { bgPaletteClassName, getCardsCss } from "../cssJs/cssJs";

type SlotProps = { children: ReactNode };

function Heading({ children, level = 3, ...rest }: SlotProps & Partial<HeadingProps>) {
  const firstChild = Children.toArray(children)[0];
  const isHeading = !!firstChild && isHeadingComponent(firstChild);
  if (isHeading) {
    return <>{children}</>;
  }
  return (
    <HeadingComponent level={level} {...rest}>
      {children}
    </HeadingComponent>
  );
}

function Content({ children }: SlotProps) {
  return <>{children}</>;
}

function Image({ children }: SlotProps) {
  return <>{children}</>;
}
function TopImage({ children }: SlotProps) {
  return <>{children}</>;
}

Heading.displayName = "Card.Heading";
Content.displayName = "Card.Content";
Image.displayName = "Card.Image";
TopImage.displayName = "Card.TopImage";

export function Card({ children, palette = "default", className, rounded }: ContentBlock) {
  const slots = mapSlots(children, [Heading.displayName, Content.displayName, Image.displayName, TopImage.displayName]);

  return (
    <div
      className={cn(
        `color-palette-${palette}`,
        getCardsCss({ padding: "full" }),
        rounded && "rounded-xl",
        bgPaletteClassName,
        className
      )}
    >
      {slots[TopImage.displayName] && <>{slots[TopImage.displayName]}</>}
      {slots[Heading.displayName] && <>{slots[Heading.displayName]}</>}
      {slots[Content.displayName] && <>{slots[Content.displayName]}</>}
      {slots[Image.displayName] && <>{slots[Image.displayName]}</>}
    </div>
  );
}

Card.Heading = Heading;
Card.Content = Content;
Card.Image = Image;
Card.TopImage = TopImage;
