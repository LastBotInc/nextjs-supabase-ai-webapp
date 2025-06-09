import { NestedBlocksProps } from "../core/types";
import { FixedWidthColumn, Flex, FlexProps } from "../core/Flex";
import { FullBlockStructure } from "../blocks/FullBlockStructure";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Column({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex-column gap-container", className)}>{children}</div>;
}

Column.displayName = "FlexLayout.Column";

/**
 * FlexLayout is a component that renders content in a flex container.
 * It uses FullBlockStructure component to display the flex container and controls the FullBlockStructure with props.
 * Preferably use FlexLayout.Column as a child wrapper of FlexLayout and place actual content inside it.
 * Example:
 * <FlexLayout oneColumnBreakpoint="lg">
 *   <FlexLayout.Column>
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </FlexLayout.Column>
 * </FlexLayout>
 * @param children - The children of the flex container.
 * @param mainImage - The main image of the flex container.
 * @param contentImage - The content image of the flex container.
 * @param contentPalette - The palette of the content.
 * @param contentClassName - The className of the content.
 * @param oneColumnBreakpoint - The breakpoint at which the flex container should switch to a single column.
 * @param direction - The direction of the flex container.
 * @param gaps - The gaps of the flex container.
 */
export function FlexLayout({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  oneColumnBreakpoint,
  direction,
  gaps,
  ...rest
}: Omit<NestedBlocksProps, "type"> & FlexProps) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content contentImage={contentImage} palette={contentPalette} className={contentClassName}>
        <Flex oneColumnBreakpoint={oneColumnBreakpoint} direction={direction} gaps={gaps}>
          {children}
        </Flex>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

FlexLayout.FixedWidthColumn = FixedWidthColumn;
FlexLayout.Column = Column;
