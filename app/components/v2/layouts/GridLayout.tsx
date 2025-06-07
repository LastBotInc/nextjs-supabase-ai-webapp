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
 *        columns={{
          default: 1,
          md: 2,
          lg: 3,
          xl: 4,
        }}
 * oneColumnBreakpoint
 * @param param0 
 * @returns 
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
