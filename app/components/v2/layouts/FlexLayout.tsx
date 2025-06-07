import { BreakPoint, NestedBlocksProps } from "../core/types";
import { FixedWidthColumn, Flex } from "../core/Flex";
import { FullBlockStructure } from "../blocks/FullBlockStructure";
export function FlexLayout({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  oneColumnBreakpoint,
  ...rest
}: Omit<NestedBlocksProps, "type"> & {
  oneColumnBreakpoint?: BreakPoint;
}) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content contentImage={contentImage} palette={contentPalette} className={contentClassName}>
        <Flex oneColumnBreakpoint={oneColumnBreakpoint}>{children}</Flex>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

FlexLayout.FixedWidthColumn = FixedWidthColumn;
