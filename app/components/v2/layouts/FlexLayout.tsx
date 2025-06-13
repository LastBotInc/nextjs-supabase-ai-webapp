import { LayoutBlocksProps, SizeDefinition } from "../core/types";
import { FixedWidthColumn, Flex, FlexProps } from "../core/Flex";
import { FullBlockStructure } from "../blocks/FullBlockStructure";
import { Children, isValidElement, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getSlotName } from "../utils/getSlotName";

export type FlexLayoutProps = Omit<LayoutBlocksProps, "type"> &
  FlexProps & { columnWidths?: Array<string | SizeDefinition | undefined> };

export const isAlreadyWrapper = (child: ReactNode): boolean => {
  if (!isValidElement(child)) {
    return false;
  }
  const name = getSlotName(child as ReactElement);
  return name === FixedWidthColumn.displayName || name === Column.displayName || name === ChildWrapper.displayName;
};

export function ChildWrapper({
  children,
  columnWidths,
}: {
  children: FlexLayoutProps["children"];
  columnWidths?: Array<string | SizeDefinition | undefined>;
}): ReactNode {
  if (!children) {
    return null;
  }

  const childrenArray = Children.toArray(children);
  // if there are more than 3 children, return them as is
  // because there is no need to make columns etc.
  if (childrenArray.length > 3) {
    return children;
  }

  return childrenArray.map((child, index: number) => {
    const widthDefinition = columnWidths && columnWidths[index];
    const isClonable = isValidElement(child);

    if (isAlreadyWrapper(child)) {
      return child;
    }

    if (widthDefinition && isClonable) {
      return (
        <FixedWidthColumn key={index} width={widthDefinition}>
          {child}
        </FixedWidthColumn>
      );
    }
    return <Column key={index}>{child}</Column>;
  });
}

ChildWrapper.displayName = "FlexLayout.ChildWrapper";

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
 * @param autoWrapChildren - Whether to wrap children in a flex container. Default is true.
 * @param columnWidths - The widths of the children columns.
 */
export function FlexLayout({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentPadding,
  contentClassName,
  oneColumnBreakpoint,
  direction,
  gaps,
  ...rest
}: FlexLayoutProps) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content
        padding={contentPadding}
        contentImage={contentImage}
        palette={contentPalette}
        className={contentClassName}
      >
        <Flex oneColumnBreakpoint={oneColumnBreakpoint} direction={direction} gaps={gaps}>
          {children}
        </Flex>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

FlexLayout.FixedWidthColumn = FixedWidthColumn;
FlexLayout.Column = Column;
