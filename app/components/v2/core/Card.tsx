import { CSSProperties, Fragment, ReactNode } from "react";
import { BoxBlock } from "../blocks/BoxBlock";
import { Padding, PaddingType, Palette } from "./types";
import { cn } from "@/lib/utils";
import { Flex, FlexProps } from "./Flex";

/**
 * Card is a component that is used to display contents in a card style. It can look like a card or box transparent container. It can have background color and rounded corners.
 * Colors are set with the palette prop. It sets gaps automatically.
 * It uses Box component internally, so it can have background image too.
 * It spacing in smaller that main layout or main content. It should be used inside content blocks of layout components.
 * Children are wrapped with Flex component unless gaps are set to false.
 * @param palette - The palette of the box.
 * @param rounded - Whether the box should be rounded.
 * @param padding - The padding of the box.
 * @param className - The className of the Card.
 * */
export function Card({
  children,
  palette,
  rounded = true,
  padding = Padding.Full,
  className,
  style,
  gaps = true,
}: {
  children: ReactNode;
  palette?: Palette;
  rounded?: boolean;
  padding?: PaddingType;
  className?: string;
  style?: CSSProperties;
  gaps?: FlexProps["gaps"] | boolean;
}) {
  const Gapper = gaps ? Flex : Fragment;
  return (
    <BoxBlock palette={palette} padding={padding} className={cn(rounded ? "rounded-box" : "", className)} style={style}>
      <BoxBlock.Content>
        <Gapper gaps={typeof gaps === "boolean" ? "level-based" : gaps} direction="column">
          {children}
        </Gapper>
      </BoxBlock.Content>
    </BoxBlock>
  );
}

Card.displayName = "Card";
