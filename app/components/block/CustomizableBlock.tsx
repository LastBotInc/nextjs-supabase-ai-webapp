import { Block } from "./Block";
import { ContentBlock } from "../core/types";

export function CustomizableBlock({ children, className }: ContentBlock & { className?: string }) {
  return (
    <Block className={className}>
      <Block.CenteredContentArea>{children}</Block.CenteredContentArea>
    </Block>
  );
}
