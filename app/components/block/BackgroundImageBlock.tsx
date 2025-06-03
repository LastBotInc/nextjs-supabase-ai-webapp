import { Block } from "./Block";
import { ContentBlock } from "../core/types";
import { BackgroundImageProps } from "../core/BackgroundImage";

export function BackgroundImageBlock({ children, className, ...props }: ContentBlock & BackgroundImageProps) {
  return (
    <Block className={className}>
      <Block.FullWidthBackgroundImage {...props} />
      <Block.CenteredContentArea>{children}</Block.CenteredContentArea>
    </Block>
  );
}
