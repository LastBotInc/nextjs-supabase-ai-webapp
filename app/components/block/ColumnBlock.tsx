/**
 * ColumnBlock is a variant of Block that is used to create a block of content that can be styled and reused.
 * It uses Block.CenteredContentArea as the default slot so content is centered and has spacing.
 * The purpose of this variant is to automatically set content area and only Columns are allowed to be used as children.
 * @param children - The children of the block.
 * @param palette - The palette of the block. Applied to the whole block and Content.
 * @param asGrid -  Passed to Content. If true, the content area will be displayed as a grid.
 * @param contentClassName - Optional extra classes passed to the Content component.
 * @param className - Optional extra classes for customizing the block.
 * @returns React.ReactNode
 */
import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { Content } from "../content/Content";
import { cn } from "@/lib/utils";

export function ColumnBlock({
  children,
  palette = "default",
  asGrid = false,
  contentClassName,
  className,
}: ContentBlock & { asGrid?: boolean; contentClassName?: string; className?: string }) {
  return (
    <Block className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.CenteredContentArea>
        <Content palette={palette} asGrid={asGrid} className={contentClassName}>
          {children}
        </Content>
      </Block.CenteredContentArea>
    </Block>
  );
}
/**
 * ColumnBlock.Column only child that should be used as a child of ColumnBlock. You can use also other Content components:
 * - Content.Heading
 * - Content.Text
 * - Content.Columns
 * - Content.Wrapper
 *
 * ColumnBlock.Column is Content.Column
 * @see Content.Column
 */
ColumnBlock.Column = Content.Column;
