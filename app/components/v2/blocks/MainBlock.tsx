import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

export function MainBlock({ children, padding = Padding.None, ...rest }: Omit<BlockProps, "type">) {
  return (
    <Block {...rest} type={BlockType.Main} padding={padding}>
      {children}
    </Block>
  );
}

// Higher-order component that wraps Block.Content and always injects no padding
const ContentHOC = ({ padding = Padding.None, ...rest }: Omit<BlockProps, "type">) => {
  return <Block.Content {...rest} padding={padding} />;
};
ContentHOC.displayName = Block.Content.displayName;

MainBlock.Content = ContentHOC;
MainBlock.BackgroundImage = Block.BackgroundImage;
