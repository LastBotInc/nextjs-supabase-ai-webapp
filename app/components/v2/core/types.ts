import { HTMLAttributes, ReactNode } from "react";

export type Size = "default" | "small" | "large";
export type BreakPoint = "md" | "lg" | "xl";

export type SizeDefinition = {
  default: Size | PaddingType | string;
  md?: Size | PaddingType | string;
  lg?: Size | PaddingType | string;
  xl?: Size | PaddingType | string;
};

export type Palette =
  | "kupari"
  | "piki"
  | "black"
  | "betoni"
  | "default"
  | "light-gray"
  | "beige"
  | "maantie"
  | "none";

export const BlockType = {
  Main: "main",
  Content: "content",
  Box: "box",
  Component: "component",
} as const;

export type BlockTypeValue = (typeof BlockType)[keyof typeof BlockType];

export const Padding = {
  Full: "full",
  Inline: "inline",
  Block: "block",
  None: "none",
} as const;

export type PaddingType = (typeof Padding)[keyof typeof Padding];

export type BlockProps<T = HTMLDivElement> = HTMLAttributes<T> & {
  type: BlockTypeValue;
  padding?: PaddingType;
  palette?: Palette;
  isFirst?: boolean;
  fullWidth?: boolean;
};

export type SlotProps = { children: ReactNode; className?: string };
