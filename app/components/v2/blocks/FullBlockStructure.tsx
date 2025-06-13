import { ReactNode } from "react";
import { ContentBlock } from "./ContentBlock";
import { MainBlock } from "./MainBlock";
import { BlockProps, LayoutBlocksProps, Padding } from "../core/types";
import { mapSlots } from "../utils/mapSlots";
import { BackgroundImageProps } from "../core/BackgroundImage";

export function Content({
  children,
  contentImage,
  padding = Padding.None,
  ...rest
}: { children: ReactNode; contentImage: LayoutBlocksProps["contentImage"] } & Omit<BlockProps, "type">) {
  return (
    <ContentBlock {...rest}>
      {contentImage && <ContentBlock.BackgroundImage {...contentImage} />}
      <ContentBlock.Content padding={padding}>{children}</ContentBlock.Content>
    </ContentBlock>
  );
}

Content.displayName = "FullBlockStructure.Content";

export function MainBlockImage(props: BackgroundImageProps) {
  return <MainBlock.BackgroundImage {...props} />;
}

MainBlockImage.displayName = "FullBlockStructure.MainBlockImage";

export function ContentBlockImage(props: BackgroundImageProps) {
  return <ContentBlock.BackgroundImage {...props} />;
}

ContentBlockImage.displayName = "FullBlockStructure.ContentBlockImage";

/**
 * FullBlockStructure is a wrapper for the whole Block structure. It sets type to BlockType.Main.
 * It is used to display a full block structure.
 * It uses names slots to set main block content and background image and content block content and background image.
 * @param padding - The padding of the main block.
 * @param children - The children of the main block.
 * Should be FullBlockStructure.Content or FullBlockStructure.MainBlockImage or ContentBlock.Content or ContentBlock.BackgroundImage.
 * FullBlockStructure.Content should be used to display a content block.
 * FullBlockStructure.MainBlockImage should be used to display a background image.
 * @param rest - Additional props to pass to the MainBlock component.
 * @returns A div element.
 */
export function FullBlockStructure({ padding, contentPadding, children, ...rest }: Omit<BlockProps, "type">) {
  /** padding is re-routed to content because main block has no padding */
  const slots = mapSlots(children, [MainBlockImage.displayName, ContentBlockImage.displayName, Content.displayName]);
  return (
    <MainBlock {...rest} padding={padding}>
      {slots[MainBlockImage.displayName] && <MainBlock.BackgroundImage {...slots[MainBlockImage.displayName].props} />}
      <MainBlock.Content padding={contentPadding}>{slots[Content.displayName]}</MainBlock.Content>
    </MainBlock>
  );
}

FullBlockStructure.Content = Content;
FullBlockStructure.MainBlockImage = MainBlockImage;
FullBlockStructure.ContentBlockImage = ContentBlockImage;
