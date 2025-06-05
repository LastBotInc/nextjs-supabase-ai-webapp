/**
 * CustomizableBlock is a variant of Block that is used to create a block to wrap any content.
 * It has no preset content area. You can use Content component to add content to the block and add any children you want.
 *
 * Purpose of this block is to allow you to create a block that can be used in any place on the page with any content.
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @param palette - The palette of the block. Applied to the whole block and Content.
 * @returns React.ReactNode
 */
import { Block } from "./Block";
import { ContentBlock } from "../core/types";
import { cn } from "@/lib/utils";

export function CustomizableBlock({ children, palette, className, ...rest }: ContentBlock & { className?: string }) {
  return (
    <Block {...rest} className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.CenteredContentArea>{children}</Block.CenteredContentArea>
    </Block>
  );
}
