import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { Content } from "../content/Content";

export function ColumnBlock({
  children,
  palette = "default",
  isFirst = false,
  asGrid = false,
  contentClassName,
}: ContentBlock & { asGrid?: boolean; contentClassName?: string }) {
  return (
    <Block>
      <Block.CenteredContentArea>
        <Content palette={palette} isFirst={isFirst} asGrid={asGrid} className={contentClassName}>
          {children}
        </Content>
      </Block.CenteredContentArea>
    </Block>
  );
}

ColumnBlock.Column = Content.Column;
