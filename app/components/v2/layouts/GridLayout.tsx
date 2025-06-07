import { BreakPoint, NestedBlocksProps, SizeDefinition } from "../core/types";
import { Columns } from "../core/Columns";
import { Children, ReactNode } from "react";
import { FullBlockStructure } from "../blocks/FullBlockStructure";

export type SpecialColumns = "first-1/3" | "first-2/3" | "first-1/4" | "first-3/4" | "first-1/2";

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
  ...rest
}: Omit<NestedBlocksProps, "type"> & {
  columns?: SizeDefinition;
  oneColumnBreakpoint?: BreakPoint;
}) {
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
        <Columns columns={columns}>{children}</Columns>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

GridLayout.Column = Column;
