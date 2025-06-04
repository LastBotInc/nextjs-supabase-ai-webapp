type GetProps<T extends Record<string, string>> = {
  omitKeys?: (keyof T)[];
  padding?: "full" | "inline" | "block" | "none";
};

export type Size = "default" | "small" | "large";
export type Direction = "full" | "inline" | "block";

export type SizeDefinition = {
  default: Size | Direction | string;
  md?: Size | Direction | string;
  lg?: Size | Direction | string;
  xl?: Size | Direction | string;
};

const paddingPropsToOmitByType = {
  full: ["paddingInline", "paddingBlock"],
  inline: ["padding", "paddingBlock"],
  block: ["padding", "paddingInline"],
  none: ["padding", "paddingInline", "paddingBlock"],
};

const textPropsToOmitByType = {
  default: ["small", "large"],
  small: ["size", "large"],
  large: ["size", "small"],
};

export const cssJs = {
  heading: {
    base: {
      font: "font-light",
      family: "font-['Inter_Tight']",
      leading: "leading-tight",
      mediumFont: "font-medium",
    },
    h1: {
      size: "text-6xl",
      responsive: "lg:text-7xl",
      margin: "mb-4",
      small: "text-5xl",
    },
    h2: {
      size: "text-5xl",
      responsive: "lg:text-6xl",
      small: "text-4xl",
    },
    h3: {
      size: "text-2xl",
      responsive: "lg:text-3xl",
      small: "text-2xl",
    },
    h4: {
      size: "text-xl",
      responsive: "lg:text-2xl",
      small: "text-lg",
    },
    h5: {
      size: "text-lg",
      responsive: "lg:text-xl",
      small: "text-xl",
    },
    h6: {
      size: "text-base",
      responsive: "lg:text-lg",
      small: "text-lg",
    },
  },

  block: {
    padding: "",
    width: "w-full",
    marginInline: "",
    marginBlock: "",
  },
  blockContentArea: {
    padding: "p-6 lg:p-14",
    paddingInline: "px-6 lg:px-14",
    paddingBlock: "py-6 lg:py-14",
    width: "w-full",
    maxWidth: "max-w-7xl",
    margin: "mx-auto",
    marginInline: "px-0 lg:px-0",
    marginBlock: "",
  },
  content: {
    padding: "p-6 lg:p-14",
    paddingInline: "px-4",
    paddingBlock: "py-4",
    width: "w-full",
    gap: "gap-4 lg:gap-8",
  },
  card: {
    padding: "p-6 lg:p-14",
    paddingInline: "px-6 lg:px-14",
    paddingBlock: "py-6 lg:py-14",
    gap: "gap-4 lg:gap-8",
    flex: "flex",
    flexDirection: "flex-col",
  },
  container: {
    padding: {
      small: "4",
      default: "6",
      large: "14",
    },
  },
  text: {
    size: "text-lg",
    small: "text-sm",
    large: "lg:text-2xl",
  },
};

export function getClassesAsString(
  { source, omitKeys = [], padding = "full" }:
    & GetProps<Record<string, string>>
    & { source: Record<string, string> },
) {
  const filterKeys = [...omitKeys, ...paddingPropsToOmitByType[padding]];

  return Object.entries(source)
    .filter(([key]) => !filterKeys.includes(key as keyof typeof cssJs.content)) // filter out keys that are in omitKeys
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, value]) => value) // map to values
    .join(" ");
}

export function getBlockCss() {
  return Object.values(cssJs.block).join(" ") + " first:pt-0";
}

export function getCssProp(sourceName: keyof typeof cssJs, prop: string) {
  return (cssJs[sourceName] as Record<string, string>)[prop] as string;
}

// note: this gets all!
export function getBlockContentAreaCss() {
  return Object.values(cssJs.blockContentArea).join(" ") +
    " relative";
}

export function getFilteredBlockContentAreaCss(
  { omitKeys = [], padding = "full" }: GetProps<typeof cssJs.blockContentArea> =
    {},
) {
  return getClassesAsString({ source: cssJs.card, omitKeys, padding });
}

export function getCardsCss(
  { omitKeys = [], padding = "full" }: GetProps<typeof cssJs.card> = {},
) {
  return getClassesAsString({ source: cssJs.card, omitKeys, padding });
}

export function getContentCss(
  { omitKeys = [], padding = "full" }: GetProps<typeof cssJs.content> = {},
) {
  return getClassesAsString({ source: cssJs.content, omitKeys, padding });
}

export function getHeadingClass(
  {
    level,
    omitKeys = [],
    padding = "full",
    small = false,
    medium = false,
    responsive = false,
  }:
    & GetProps<typeof cssJs.heading.base & typeof cssJs.heading.h1>
    & {
      level: 1 | 2 | 3 | 4 | 5 | 6;
      small?: boolean;
      medium?: boolean;
      responsive?: boolean;
    },
) {
  const base = getClassesAsString({
    source: cssJs.heading.base,
    omitKeys: [...omitKeys, medium ? "font" : "mediumFont"],
    padding,
  });

  const hX = getClassesAsString({
    source: cssJs.heading[`h${level}`],
    omitKeys: [
      ...omitKeys,
      small ? "size" : "small",
      responsive ? "size" : "responsive",
    ],
    padding,
  });
  return [base, hX].join(" ");
}

export function getTextClass(
  { omitKeys = [], padding = "full", variant = "default" }:
    & GetProps<typeof cssJs.text>
    & { variant?: Size },
) {
  const filterKeys = [...omitKeys, ...textPropsToOmitByType[variant]];
  return getClassesAsString({
    source: cssJs.text,
    omitKeys: filterKeys,
    padding,
  });
}

/**
 * Converts padding string or SizeDefinition to padding string
 * If padding is a string, getContainerPadding() is called
 * If padding is a SizeDefinition it is converted to a string and getContainerPadding() is called
 * Examples:
 *  - getPadding({default: "p-small", md: "px-large p-0", lg: "px-default"}) -> "p-4 md:px-14 md:p-0 lg:px-6"
 *  - getPadding("p-small md:px-large lg:px-default") -> "p-4 md:px-14 lg:px-6"
 * @param padding - padding string or SizeDefinition
 * @returns - padding string
 */
export function getPadding(padding: string | SizeDefinition) {
  if (typeof padding === "string") {
    return getContainerPadding(padding);
  }
  return getContainerPadding(
    Object.entries(padding).map(([key, value]) => {
      if (key === "default") {
        return value;
      }
      return value.split(" ").map((v) => `${key}:${v}`).join(" ");
    }).join(" "),
  );
}
/**
 * Converts padding string like "p-small md:px-large lg:px-default" to "p-4 md:px-14 lg:px-6"
 * Also supports constants like "p-full" or "p-inline" or "p-block" or "p-none"
 * Or just "full" or "inline" or "block" or "none"
 * Examples:
 * - getContainerPadding
 * - "full" -> "p-6 lg:p-14"
 * - "inline" -> "px-4 lg:px-6"
 * - "block" -> "py-4 lg:py-14"
 * - "none" -> ""
 * - "md:p-small" -> "md:p-4"
 * - "full md:p-small" -> "p-6 lg:p-14 md:p-4"
 * - "inline md:p-none" -> "px-4 lg:px-6 md:p-0"

 * @param padding - padding string like "p-small md:px-large lg:px-default"
 * @returns - padding string like "p-4 md:px-14 lg:px-6"
 */
export function getContainerPadding(padding: string) {
  const getPaddingByConstant = (padding: string) => {
    if (padding === "none") {
      return "";
    }
    if (padding === "full") {
      return getCssProp("card", "padding");
    }
    if (padding === "inline") {
      return getCssProp("card", "paddingInline");
    }
    if (padding === "block") {
      return getCssProp("card", "paddingBlock");
    }
    return padding;
  };
  const sizeToValue = (value: string) => {
    if (!value.includes("-")) {
      return getPaddingByConstant(value);
    }
    const [direction, size] = value.split("-");
    const sizeValue =
      cssJs.container.padding[size as keyof typeof cssJs.container.padding];
    return `${direction}-${sizeValue || "0"}`;
  };
  return padding.split(" ").map((value) => {
    if (!value.includes(":")) {
      return sizeToValue(value);
    }
    const [breakPoint, size] = value.split(":");
    return `${breakPoint}:${sizeToValue(size)}`;
  }).filter(Boolean).join(" ");
}

export const bgPaletteClassName = "palette-background-color";
export const headingPaletteClassName = "palette-heading-color";
export const textPaletteClassName = "palette-text-color";
export const iconPaletteClassName = "palette-icon-color";
export const buttonPaletteClassName = "palette-button-color";
export const buttonTextPaletteClassName = "palette-button-text-color";
