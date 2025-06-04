import { cn } from "@/lib/utils";
import { ContentBlock } from "../core/types";
import { bgPaletteClassName, getContentCss } from "../cssJs/cssJs";
import React from "react";

export function ContentContainer({
  children,
  palette = "default",
  noSpacing = false,
  asGrid = false,
  asBlock = false,
  addTextShadow = false,
  setBg = false,
  className,
}: ContentBlock & {
  noSpacing?: boolean;
  asGrid?: boolean;
  addTextShadow?: boolean;
  asBlock?: boolean;
  setBg?: boolean;
}) {
  const childCount = React.Children.count(children);
  const classes = asGrid
    ? `grid grid-cols-1 bg-transparent ${childCount > 1 ? "md:grid-cols-2" : ""}`
    : "flex flex-row ";

  return (
    <div
      className={cn(
        `color-palette-${palette}`,
        !asBlock && classes,
        asBlock && "flex flex-col",
        getContentCss({ omitKeys: noSpacing ? ["padding", "paddingInline", "paddingBlock"] : [] }),
        addTextShadow && "shadow-text",
        className,
        setBg && bgPaletteClassName
      )}
    >
      {children}
    </div>
  );
}
