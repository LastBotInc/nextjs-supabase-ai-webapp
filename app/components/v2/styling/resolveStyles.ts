import { BlockTypeValue, PaddingType, Palette } from "../core/types";

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
