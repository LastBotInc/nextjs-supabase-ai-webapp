/**
 * InnerBoxes is a variant of Block that is used to create a block of content that has a inner boxes.
 * It uses Block.CenteredContentArea for the content.
 *
 * InnerBoxes has a slot:
 * - Box - A slot for a box of content.
 *
 * Box is a div that has a rounded border and a background color.
 *
 * InnerBoxes uses ContentContainer component to render the content.
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @param palette - The palette of the block. Applied to the whole block and Content.
 * @param contentClassName - Optional extra classes passed to the ContentContainer component.
 * @param asGrid - Passed to ContentContainer. If true, the content area will be displayed as a grid. Default is true.
 * @returns React.ReactNode
 */
import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { cn } from "@/lib/utils";
import { bgPaletteClassName, getFilteredBlockContentAreaCss, getPaletteClassName } from "../cssJs/cssJs";
import { ContentContainer } from "../core/ContentContainer";

function Box({ children, className, palette }: ContentBlock) {
  return (
    <div
      className={cn(
        getFilteredBlockContentAreaCss({ padding: "full" }),
        "rounded-xl",
        palette && `color-palette-${palette}`,
        bgPaletteClassName,
        className
      )}
    >
      {children}
    </div>
  );
}
Box.displayName = "InnerBoxes.Box";

export function InnerBoxes({
  children,
  palette = "default",
  contentClassName,
  className,
  asGrid = true,
}: ContentBlock & { contentClassName?: string; className?: string; asGrid?: boolean }) {
  return (
    <Block className={cn(getPaletteClassName(palette), className)}>
      <Block.CenteredContentArea>
        <ContentContainer asGrid={asGrid} className={contentClassName} noSpacing>
          {children}
        </ContentContainer>
      </Block.CenteredContentArea>
    </Block>
  );
}

InnerBoxes.Box = Box;
