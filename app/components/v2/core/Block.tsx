/**
 * Block is a base component for aligning content and showing background images.
 * There are four block types:  
 * - Main - Top level block that can show full page width background image or color. It content is always centered and has max width. It has no padding
 * - Content - Main content area that is used mainly just for applying global padding.
 * - Box - Actual content is inside boxes. Simplest box is a flex box with responsive gaps.
 * - Component - smallest block that can be used inside components.
 *
 * Blocks are nested inside each other. Usual layout is (excluding background image)
 * |-- Main
 * │   ├── Content
 * │      ├── Box
 * │      |  ├── Component
 * │      |  ├── Component
 * │      ├── Box
 * │      |   ├── Component
 * │      ├── Box
 * │         ├── Component
 * │         ├── Component
 * │         ├── Component
 * 
 * 
 * Main block should have only one content block and can have background image. Content block can have multiple boxes. Box can have multiple components.
 * 
 * Any block can have background image.
 * 
 * Each block level has different spacing and padding.
 * 
 * Padding types are:
 * - full - full width padding
 * - inline - padding only on the sides
 * - block - padding only on the top and bottom
 * - none - no padding
 * 
 * Block has two slots:
 * - BackgroundImageSlot - A slot for a full width background image.
 * - Content - A slot for a centered content area.
 *

 *
 * Blocks use palettes to defined its colors. Palettes bg color is applied to the whole blocks bg.
 *
 * Example:
 * <Block>
 *   <Block.BackgroundImage src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" />
 *   <Block.Content>
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </Block.Content>
 * </Block>
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @returns React.ReactNode
 */

import { cn } from "@/lib/utils";
import { mapSlots } from "../utils/mapSlots";
import { BackgroundImageProps } from "../core/BackgroundImage";
import { BackgroundImage } from "../core/BackgroundImage";
import { BlockProps, BlockType, Padding } from "../core/types";
import { ContentArea } from "./ContentArea";
import { getBlockStyles, getPaletteClassName } from "../styling/resolveStyles";

function BackgroundImageSlot(props: BackgroundImageProps) {
  return <BackgroundImage {...props} />;
}
BackgroundImageSlot.displayName = "BackgroundImageSlot";

function ContentSlot({ children, ...rest }: Omit<BlockProps, "type">) {
  return <ContentArea {...rest}>{children}</ContentArea>;
}
ContentSlot.displayName = "ContentSlot";

export function Block({
  children,
  className,
  type = BlockType.Main,
  padding = Padding.Full,
  palette = "none",
  ...rest
}: BlockProps) {
  const slots = mapSlots(children, [BackgroundImageSlot.displayName, ContentSlot.displayName]);
  const hasBackgroundImage = !!slots[BackgroundImageSlot.displayName];
  return (
    <div
      className={cn(
        "block",
        hasBackgroundImage ? "block-with-background-image" : "",
        getBlockStyles(type, padding),
        getPaletteClassName(palette),
        className
      )}
      {...rest}
    >
      {slots[BackgroundImageSlot.displayName]}
      {slots[ContentSlot.displayName]}
    </div>
  );
}

Block.BackgroundImage = BackgroundImageSlot;
Block.Content = ContentSlot;
