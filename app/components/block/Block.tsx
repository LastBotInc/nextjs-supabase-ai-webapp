/**
 * Block is a component that wraps the content of a page. It is used to create a block of content that can be styled and reused.
 * All contents on the page should be wrapped in a Block component. Component aligns the content to the center of the page and applies spacing and background color.
 *
 * Block has two slots:
 * - FullWidthBackgroundImage - A slot for a full width background image.
 * - CenteredContentArea - A slot for a centered content area.
 *
 * All content blocks should be wrapped in a Block component.
 *
 * Blocks use palettes to defined its colors. Palettes bg color is applied to the whole blocks bg.
 *
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @returns React.ReactNode
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mapSlots } from "../core/mapSlots";
import { bgPaletteClassName, getBlockContentAreaCss, getBlockCss } from "../cssJs/cssJs";
import { BackgroundImageProps } from "../core/BackgroundImage";
import { BackgroundImage } from "../core/BackgroundImage";

type SlotProps = { children: ReactNode; className?: string };

function FullWidthBackgroundImage(props: BackgroundImageProps) {
  return <BackgroundImage {...props} />;
}
FullWidthBackgroundImage.displayName = "FullWidthBackgroundImage";

function CenteredContentArea({ children, className }: SlotProps) {
  return <div className={cn(getBlockContentAreaCss(), className)}>{children}</div>;
}
CenteredContentArea.displayName = "CenteredContentArea";

type BlockProps = {
  children: ReactNode;
  className?: string;
};
export function Block({ children, className }: BlockProps) {
  const slots = mapSlots(children, [FullWidthBackgroundImage.displayName, CenteredContentArea.displayName]);

  return (
    <section
      className={cn(
        getBlockCss(),
        className,
        !!slots[FullWidthBackgroundImage.displayName] && "relative",
        bgPaletteClassName
      )}
    >
      {slots[FullWidthBackgroundImage.displayName] && <>{slots[FullWidthBackgroundImage.displayName]}</>}
      {slots[CenteredContentArea.displayName] && <>{slots[CenteredContentArea.displayName]}</>}
    </section>
  );
}

Block.FullWidthBackgroundImage = FullWidthBackgroundImage;
Block.CenteredContentArea = CenteredContentArea;
