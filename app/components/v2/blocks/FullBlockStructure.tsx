import { ReactNode } from "react";
import { ContentBlock } from "./ContentBlock";
import { MainBlock } from "./MainBlock";
import { BlockProps, NestedBlocksProps } from "../core/types";
import { mapSlots } from "../../core/mapSlots";
import { BackgroundImageProps } from "../core/BackgroundImage";

export function Content({
  children,
  contentImage,
  ...rest
}: { children: ReactNode; contentImage: NestedBlocksProps["contentImage"] } & Omit<BlockProps, "type">) {
  return (
    <ContentBlock {...rest}>
      {contentImage && <ContentBlock.BackgroundImage {...contentImage} />}
      <ContentBlock.Content>{children}</ContentBlock.Content>
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

export function FullBlockStructure({ padding, children, ...rest }: Omit<BlockProps, "type">) {
  /** padding is re-routed to content because main block has no padding */
  const slots = mapSlots(children, [MainBlockImage.displayName, ContentBlockImage.displayName, Content.displayName]);
  return (
    <MainBlock {...rest}>
      {slots[MainBlockImage.displayName] && <MainBlock.BackgroundImage {...slots[MainBlockImage.displayName].props} />}
      <MainBlock.Content padding={padding}>{slots[Content.displayName]}</MainBlock.Content>
    </MainBlock>
  );
}

FullBlockStructure.Content = Content;
FullBlockStructure.MainBlockImage = MainBlockImage;
FullBlockStructure.ContentBlockImage = ContentBlockImage;
