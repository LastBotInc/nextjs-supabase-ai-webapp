import { Card } from "../core/Card";
import { GridLayout, GridLayoutProps } from "./GridLayout";
import { cn } from "@/lib/utils";

/**
 * BoxLayout is a component that is used to display a grid of elements. it uses GridLayout component to render the grid with columns.
 * It align contents differently with smaller padding so its content (boxes) are wider but content is aligned like all content.
 * Preferably use BoxLayout.Box as a child wrapper of BoxLayout and place actual content inside it.
 * Example:
 * <BoxLayout palette="default" fullSizeBoxes={true} oneColumnBreakpoint="lg">
 *   <BoxLayout.Box palette="maantie">
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </BoxLayout.Box>
 *   <BoxLayout.Box palette="kupari">
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </BoxLayout.Box>
 * </BoxLayout>
 * @param children - The children of the grid.
 * @param columns - The number of columns to display. This is a SizeDefinition object that sets column count per breakpoint.
 * @param className - The className of the grid.
 * @param fullSizeBoxes - Whether the boxes should be full size.
 * @param maxColumns - The maximum number of columns to display.
 * @param rest - Additional props to pass to the grid.
 * @returns A div element with a grid of boxes.
 */
export function BoxLayout({
  children,
  columns,
  className,
  fullSizeBoxes = false,
  maxColumns = 2,
  ...rest
}: GridLayoutProps & { maxColumns?: number; fullSizeBoxes?: boolean }) {
  if (!columns && maxColumns) {
    columns = {
      default: 1,
      [rest.oneColumnBreakpoint || "lg"]: maxColumns,
    };
  }
  return (
    <GridLayout
      columns={columns}
      className={cn(fullSizeBoxes ? "full-size-boxes" : "with-split-padding", className)}
      {...rest}
    >
      {children}
    </GridLayout>
  );
}

BoxLayout.Box = Card;
