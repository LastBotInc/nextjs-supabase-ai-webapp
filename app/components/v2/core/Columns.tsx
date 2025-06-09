import { CSSProperties, HTMLAttributes } from "react";
import { SizeDefinition } from "./types";
import { cn } from "@/lib/utils";
import { getGapClass, getValuePerBreakpoint } from "../styling/resolveStyles";
import { FlexProps } from "./Flex";

export type ColumnProps = HTMLAttributes<HTMLDivElement> & {
  columns?: SizeDefinition;
} & Pick<FlexProps, "gaps">;

const getColumnBreakpoint = (columns: SizeDefinition): CSSProperties => {
  return Object.entries(getValuePerBreakpoint(columns, 1)).reduce((acc, [breakpoint, count]) => {
    if (breakpoint === "default") {
      // this enables the count use in columns.css
      acc[`--column-count-active`] = "auto";
    }
    acc[`--column-count-${breakpoint}`] = String(count);

    return acc;
  }, {} as Record<string, string>);
};

/**
 * Columns is a component that is used to display a grid of columns.
 * Use Columns.Column as a child wrapper of Columns and place actual content inside it.
 * Example:
 * <Columns columns={{default: 1, md: 2, lg: 3, xl: 4}}>
 *   <Columns.Column>
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </Columns.Column>
 * </Columns>
 * @param children - The children of the columns.
 * @param columns - The number of columns to display. This is a SizeDefinition object that sets column count per breakpoint.
 * @param className - The className of the columns.
 * @param style - The style of the columns.
 * @param gaps - The gaps of the columns.
 * @param rest - Additional props to pass to the columns.
 * @returns A div element with a grid of columns.
 */
export function Columns({ children, columns, className, style, gaps = "level-based", ...rest }: ColumnProps) {
  const styles = { ...style, ...(columns && getColumnBreakpoint(columns)) };

  return (
    <div style={styles} className={cn("columns", className, getGapClass(gaps))} {...rest}>
      {children}
    </div>
  );
}
