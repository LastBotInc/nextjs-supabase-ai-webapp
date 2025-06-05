/**
 * ContentContainer is a component that is used to wrap content in a container.
 *
 * It accepts any children unline Content component.
 *
 * @param children - The children of the content container.
 * @param palette - The palette of the content container.
 * @param noSpacing - If true, the content container will be rendered without spacing.
 * @param asGrid - If true, the content container will be rendered as a grid container.
 * @param asBlock - If true, the content container will be rendered as a block container.
 * @param addTextShadow - If true, the content container will have a text shadow.
 * @param setBg - If true, the content container will have a background from the palette.
 */

import { cn } from "@/lib/utils";
import { ContentBlock } from "../core/types";
import { bgPaletteClassName, getContentCss, getPaletteClassName } from "../cssJs/cssJs";
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
        getPaletteClassName(palette),
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
