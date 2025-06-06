import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

export function ContentBlock({ children, padding = Padding.Full, ...rest }: Omit<BlockProps, "type">) {
  return (
    <Block {...rest} type={BlockType.Content} padding={padding}>
      {children}
    </Block>
  );
}

// Higher-order component that wraps Block.Content and always injects no padding
const ContentHOC = ({ padding = Padding.None, ...rest }: Omit<BlockProps, "type">) => {
  return <Block.Content {...rest} padding={padding} />;
};
ContentHOC.displayName = Block.Content.displayName;
ContentBlock.Content = ContentHOC;

ContentBlock.BackgroundImage = Block.BackgroundImage;
