import {
  BlockTypeValue,
  BreakPoint,
  PaddingType,
  Palette,
  SizeDefinition,
} from "../core/types";

const classMap: {
  blockTypes: Record<BlockTypeValue, string>;
  padding: Record<string, string>;
} = {
  blockTypes: {
    main: "block-main",
    content: "block-content",
    box: "block-box",
    component: "block-component",
  },
  padding: {
    full: "block-padding-full",
    inline: "block-padding-inline",
    block: "block-padding-block",
    none: "block-padding-none",
  },
};
export function getBlockStyles(type: BlockTypeValue, padding: PaddingType) {
  return [classMap.blockTypes[type], classMap.padding[padding]];
}

export function getPaddingStyles(padding: PaddingType) {
  return [classMap.padding[padding]];
}

export function getPaletteClassName(palette: Palette) {
  if (palette === "none") {
    return "";
  }
  return `color-palette-${palette || "default"}`;
}

export function getValuePerBreakpoint(
  definition: SizeDefinition,
  defaultValue?: string | number,
): Record<BreakPoint, string> {
  const breakPoints = ["default", "sm", "md", "lg", "xl"];
  let currentValue = String(definition.default || defaultValue || "");
  const values = breakPoints.reduce((acc, breakPoint) => {
    const value = definition[breakPoint as BreakPoint];
    if (value === undefined) {
      acc[breakPoint as BreakPoint] = currentValue || "";
      return acc;
    }
    currentValue = String(value);
    acc[breakPoint as BreakPoint] = currentValue;
    return acc;
  }, {} as Record<BreakPoint, string>);
  return values;
}
