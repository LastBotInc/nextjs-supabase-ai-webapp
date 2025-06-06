import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

export function BoxBlock({ children, padding = Padding.Full, ...rest }: Omit<BlockProps, "type">) {
  return (
    <Block {...rest} type={BlockType.Box} padding={padding}>
      {children}
    </Block>
  );
}

// Higher-order component that wraps Block.Box and always injects no padding
const ContentHOC = ({ padding = Padding.None, ...rest }: Omit<BlockProps, "type">) => {
  return <Block.Content {...rest} padding={padding} />;
};
ContentHOC.displayName = Block.Content.displayName;
BoxBlock.Content = ContentHOC;

BoxBlock.BackgroundImage = Block.BackgroundImage;
