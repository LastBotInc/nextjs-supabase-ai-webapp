import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { cn } from "@/lib/utils";
import { bgPaletteClassName, getFilteredBlockContentAreaCss } from "../cssJs/cssJs";
import { ContentContainer } from "../core/ContentContainer";

function Box({ children, className, palette }: ContentBlock) {
  return (
    <div
      className={cn(
        getFilteredBlockContentAreaCss(),
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
    <Block className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.CenteredContentArea>
        <ContentContainer asGrid={asGrid} className={contentClassName} noSpacing>
          {children}
        </ContentContainer>
      </Block.CenteredContentArea>
    </Block>
  );
}

InnerBoxes.Box = Box;
