/**
 * BackgroundImageBlock is a variant of Block that is used to create a block of content that has a full width background image.
 * It uses Block.FullWidthBackgroundImage for the background image and Block.CenteredContentArea for the content.
 *
 * It has no preset content area. You can use Content component to add content to the block and add any children you want.
 *
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @param palette - The palette of the block. Applied to the whole block and Content.
 * @param ...rest - The other props are passed to the BackgroundImage component:
 * - src - The source of the background image.
 * - alt - The alt text of the background image.
 * - backgroundPosition - The position of the background image. It can be a string or object with breakpoints: {default:"center", md:"top left", lg:"top right", xl:"bottom right"}
 * - backgroundSize - The size of the background image. It can be a string or object with breakpoints: {default:"cover", md:"contain", lg:"cover", xl:"cover"}
 * @returns React.ReactNode
 */
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
