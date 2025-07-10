import {
  HTMLAttributes,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import { BackgroundImageProps } from "./BackgroundImage";

export type Size = "default" | "small" | "large";
export type BreakPoint = "md" | "lg" | "xl";

export type SizeDefinition = {
  default?: Size | PaddingType | string | number;
  md?: Size | PaddingType | string | number;
  lg?: Size | PaddingType | string | number;
  xl?: Size | PaddingType | string | number | undefined;
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
  Unset: "unset",
} as const;

export type PaddingType = (typeof Padding)[keyof typeof Padding];

export type BlockProps<T = HTMLDivElement> = HTMLAttributes<T> & {
  type: BlockTypeValue;
  padding?: PaddingType;
  contentPadding?: PaddingType;
  palette?: Palette;
  isFirst?: boolean;
  fullWidth?: boolean;
};

export type SlotProps = { children: ReactNode; className?: string };
export type LayoutBlocksProps = Omit<BlockProps, "type"> & {
  contentPalette?: Palette;

  contentClassName?: string;
  mainImage?: BackgroundImageProps;
  contentImage?: BackgroundImageProps;
  autoWrapChildren?: boolean;
};

export type SlotComponent<P = unknown> = React.ComponentType<P> & {
  displayName?: string;
};

export type SlotComponentCandidate =
  | ReactPortal
  | ReactElement<unknown, string | JSXElementConstructor<unknown>>;
