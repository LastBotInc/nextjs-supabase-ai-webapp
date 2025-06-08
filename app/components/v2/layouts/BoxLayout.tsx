import { CSSProperties, Fragment, ReactNode } from "react";
import { BoxBlock } from "../blocks/BoxBlock";
import { GridLayout, GridLayoutProps } from "./GridLayout";
import { PaddingType, Palette } from "../core/types";
import { cn } from "@/lib/utils";
import { Flex, FlexProps } from "../core/Flex";

function Box({
  children,
  palette,
  rounded = true,
  padding,
  className,
  style,
  gaps,
}: {
  children: ReactNode;
  palette?: Palette;
  rounded?: boolean;
  padding?: PaddingType;
  className?: string;
  style?: CSSProperties;
  gaps?: FlexProps["gaps"] | boolean;
}) {
  const Gapper = gaps ? Flex : Fragment;
  return (
    <BoxBlock palette={palette} padding={padding} className={cn(rounded ? "rounded-box" : "", className)} style={style}>
      <BoxBlock.Content>
        <Gapper gaps={typeof gaps === "boolean" ? "level-based" : gaps} direction="column">
          {children}
        </Gapper>
      </BoxBlock.Content>
    </BoxBlock>
  );
}

Box.displayName = "BoxLayout.Box";

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

BoxLayout.Box = Box;
