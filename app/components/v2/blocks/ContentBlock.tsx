import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

/**
 * ContentBlock is a wrapper for the Block component which sets type to BlockType.Content.
 * It should be used inside Block with type BlockType.Main.
 * @param children - The children of the content block. Should be ContentBlock.Content or ContentBlock.BackgroundImage
 * It uses named slots to display content (ContentBlock.Content) and background image (ContentBlock.BackgroundImage).
 * @param padding - The padding of the content block.
 * @param rest - Additional props to pass to the Block component.
 * @returns A div element with a content block.
 */
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
