import { CSSProperties, ReactNode } from "react";
import { BoxBlock } from "../blocks/BoxBlock";
import { GridLayout, GridLayoutProps } from "./GridLayout";
import { PaddingType, Palette } from "../core/types";
import { cn } from "@/lib/utils";

function Box({
  children,
  palette,
  rounded = true,
  padding,
  className,
  style,
}: {
  children: ReactNode;
  palette: Palette;
  rounded?: boolean;
  padding?: PaddingType;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <BoxBlock palette={palette} padding={padding} className={cn(rounded ? "rounded-box" : "", className)} style={style}>
      <BoxBlock.Content>{children}</BoxBlock.Content>
    </BoxBlock>
  );
}

Box.displayName = "BoxLayout.Box";

export function BoxLayout({ children, columns, maxColumns = 2, ...rest }: GridLayoutProps & { maxColumns?: number }) {
  if (!columns && maxColumns) {
    columns = {
      default: 1,
      [rest.oneColumnBreakpoint || "lg"]: maxColumns,
    };
  }
  return (
    <GridLayout columns={columns} className="with-split-padding" {...rest}>
      {children}
    </GridLayout>
  );
}

BoxLayout.Box = Box;
