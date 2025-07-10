import { Block } from "../core/Block";
import { BlockProps, BlockType, Padding } from "../core/types";

/**
 * MainBlock is a wrapper for the Block component which sets type to BlockType.Main.
 * It should be used as top level block in PageWrapper.
 * It uses named slots to display content (MainBlock.Content) and background image (MainBlock.BackgroundImage).
 * @param children - The children of the box. Should be MainBlock.Content or MainBlock.BackgroundImage
 * @param padding - The padding of the box.
 * @param rest - Additional props to pass to the Block component.
 * @returns A div element.
 */

export function MainBlock({
  children,
  palette = "default",
  padding = Padding.None,
  ...rest
}: Omit<BlockProps, "type">) {
  return (
    <Block {...rest} type={BlockType.Main} padding={padding} palette={palette}>
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
