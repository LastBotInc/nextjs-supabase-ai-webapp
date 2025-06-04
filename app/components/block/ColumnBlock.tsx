import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { Content } from "../content/Content";
import { cn } from "@/lib/utils";

export function ColumnBlock({
  children,
  palette = "default",
  isFirst = false,
  asGrid = false,
  contentClassName,
  className,
}: ContentBlock & { asGrid?: boolean; contentClassName?: string; className?: string }) {
  return (
    <Block className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.CenteredContentArea>
        <Content palette={palette} isFirst={isFirst} asGrid={asGrid} className={contentClassName}>
          {children}
        </Content>
      </Block.CenteredContentArea>
    </Block>
  );
}

ColumnBlock.Column = Content.Column;
