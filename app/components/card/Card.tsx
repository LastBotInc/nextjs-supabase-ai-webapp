import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mapSlots } from "../core/mapSlots";
import { HeadingProps, HeadingComponent } from "../core/Headings";
import { ContentBlock } from "../core/types";
import { bgPaletteClassName, getCardsCss } from "../cssJs/cssJs";

type SlotProps = { children: ReactNode };

function Heading({ children, level = 3, ...rest }: SlotProps & Partial<HeadingProps>) {
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
