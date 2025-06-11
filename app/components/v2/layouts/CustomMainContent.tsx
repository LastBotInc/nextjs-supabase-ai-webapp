import { LayoutBlocksProps, Padding } from "../core/types";
import { FullBlockStructure } from "../blocks/FullBlockStructure";

/**
 * CustomMainContent is a component that is used to render children with FullBlockStructure.
 * Use only in special cases, like when you need to use a full block structure with a main image and a content image.
 * @param children - The children of the custom main content.
 * @param mainImage - The main image of the custom main content.
 * @param contentImage - The content image of the custom main content.
 * @param contentPalette - The palette of the custom main content.
 * @param contentClassName - The className of the custom main content.
 * @param rest - Additional props to pass to the custom main content.
 * @returns A div element with a custom main content.
 */
export function CustomMainContent({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  ...rest
}: LayoutBlocksProps) {
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
