import { NestedBlocksProps, Padding } from "../core/types";
import { FullBlockStructure } from "../blocks/FullBlockStructure";

export function CustomMainContent({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  ...rest
}: NestedBlocksProps) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content
        padding={Padding.None}
        contentImage={contentImage}
        palette={contentPalette}
        className={contentClassName}
      >
        {children}
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}
