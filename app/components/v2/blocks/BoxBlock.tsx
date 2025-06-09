import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

/**
 * BoxBlock is a wrapper for the Block component which sets type to BlockType.Box.
 * It should be used inside Block with type BlockType.Content.
 * It uses named slots to display content (BoxBlock.Content) and background image (BoxBlock.BackgroundImage).
 * @param children - The children of the box. Should be BoxBlock.Content or BoxBlock.BackgroundImage
 * @param padding - The padding of the box.
 * @param rest - Additional props to pass to the Block component.
 * @returns A div element with a box.
 */
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
