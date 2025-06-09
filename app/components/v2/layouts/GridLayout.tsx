import { NestedBlocksProps } from "../core/types";
import { Columns, ColumnProps } from "../core/Columns";
import { Children, ReactNode } from "react";
import { FullBlockStructure } from "../blocks/FullBlockStructure";
import { FlexProps } from "../core/Flex";

export type GridLayoutProps = Omit<NestedBlocksProps, "type"> &
  Pick<ColumnProps, "columns" | "gaps"> &
  Pick<FlexProps, "oneColumnBreakpoint">;

export function Column({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

Column.displayName = "GridLayout.Column";

/**
 * GridLayout is a component that is used to render content in a grid.
 * It uses FullBlockStructure component to display the grid and controls the FullBlockStructure with props.
 * Preferably use GridLayout.Column as a child of GridLayout and place actual content inside it.
 * Example:
 * <GridLayout
 *    mainImage={{ src: "/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" }}
 *    contentImage={{ src: "/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" }}
 *    contentPalette="piki"
 *    oneColumnBreakpoint="lg"
 *   >
 *   <GridLayout.Column>
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </GridLayout.Column>
 * </GridLayout>
 * @param children - The children of the grid.
 * @param mainImage - The main image of the grid.
 * @param contentImage - The content image of the grid.
 * @param contentPalette - The palette of the content.
 * @param contentClassName - The className of the content.
 * @param columns - The number of columns to display. This is a SizeDefinition object that sets column count per breakpoint.
 * @param oneColumnBreakpoint - The breakpoint at which the grid should switch to a single column.
 * @param gaps - The gaps of the grid.
 * @param rest - Additional props to pass to the grid.
 * @returns A div element with a grid of elements.
 */
export function GridLayout({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  columns,
  oneColumnBreakpoint,
  gaps,
  ...rest
}: GridLayoutProps) {
  if (!columns && children) {
    columns = {
      default: 1,
      [oneColumnBreakpoint || "lg"]: Children.count(children) || 1,
    };
  }
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content contentImage={contentImage} palette={contentPalette} className={contentClassName}>
        <Columns columns={columns} gaps={gaps}>
          {children}
        </Columns>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

GridLayout.Column = Column;
