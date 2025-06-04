import { Block } from "./Block";
import { ContentBlock } from "../core/types";
import { BackgroundImageProps } from "../core/BackgroundImage";
import { cn } from "@/lib/utils";

export function BackgroundImageBlock({ children, className, palette, ...props }: ContentBlock & BackgroundImageProps) {
  return (
    <Block className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.FullWidthBackgroundImage {...props} />
      <Block.CenteredContentArea>{children}</Block.CenteredContentArea>
    </Block>
  );
}
