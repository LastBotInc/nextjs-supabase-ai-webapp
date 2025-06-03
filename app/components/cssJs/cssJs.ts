type GetProps<T extends Record<string, string>> = {
  omitKeys?: (keyof T)[];
  padding?: "full" | "inline" | "block";
};
export const cssJs = {
  // always [size, weight, margin, font, leading]
  heading: {
    base: ["font-medium", "font-['Inter_Tight']", "leading-tight"],
    h1: [
      "text-6xl",
      "mb-4",
    ],
    h2: ["text-5xl"],
    h3: ["text-2xl"],
    h4: ["text-xl"],
    h5: ["text-lg"],
    h6: ["text-base"],
  },
  smallHeadings: {
    h1: ["text-2xl"],
    h2: ["text-2xl"],
    h3: ["text-xl"],
    h4: ["text-lg"],
    h5: ["text-base"],
    h6: ["text-sm"],
  },
  block: {
    padding: "",
    width: "w-full",
    marginInline: "",
    marginBlock: "",
  },
  blockContentArea: {
    padding: "p-6 lg:p-14",
    paddingInline: "px-4",
    paddingBlock: "py-4",
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
  },
  card: {
    padding: "p-6 lg:p-14",
    paddingInline: "px-4",
    paddingBlock: "py-4",
    gap: "gap-4",
    flex: "flex",
    flexDirection: "flex-col",
  },
};

export function getClassesAsString(
  { source, omitKeys = [], padding = "full" }:
    & GetProps<Record<string, string>>
    & { source: Record<string, string> },
) {
  const filterKeys = [...omitKeys];
  if (padding === "full") {
    filterKeys.push("paddingInline", "paddingBlock");
  } else if (padding === "inline") {
    filterKeys.push("padding", "paddingBlock");
  } else if (padding === "block") {
    filterKeys.push("padding", "paddingInline");
  }
  return Object.entries(source)
    .filter(([key]) => !filterKeys.includes(key as keyof typeof cssJs.content)) // filter out keys that are in omitKeys
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, value]) => value) // map to values
    .join(" ");
}

export function getBlockCss() {
  return Object.values(cssJs.block).join(" ") + " first:pt-0";
}

export function getBlockContentAreaCss() {
  return Object.values(cssJs.blockContentArea).join(" ") +
    " relative overflow-hidden";
}

export function getCardsCss(
  { omitKeys = [], padding = "full" }: GetProps<typeof cssJs.card> = {},
) {
  return getClassesAsString({ source: cssJs.card, omitKeys, padding });
}

export function getContentCss(
  { omitKeys = [], padding = "full" }: {
    omitKeys?: (keyof typeof cssJs.content)[];
    padding?: "full" | "inline" | "block";
  } = {},
) {
  const filterKeys = [...omitKeys];
  if (padding === "full") {
    filterKeys.push("paddingInline", "paddingBlock");
  } else if (padding === "inline") {
    filterKeys.push("padding", "paddingBlock");
  } else if (padding === "block") {
    filterKeys.push("padding", "paddingInline");
  }
  return Object.entries(cssJs.content)
    .filter(([key]) => !filterKeys.includes(key as keyof typeof cssJs.content)) // filter out keys that are in omitKeys
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, value]) => value) // map to values
    .join(" ");
}

export function getHeadingClass(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return [...cssJs.heading.base, ...cssJs.heading[`h${level}`]];
}
export function getSmallHeadingClass(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const originalClass = cssJs.heading[`h${level}`];
  const smallClass = cssJs.smallHeadings[`h${level}`];
  return [...cssJs.heading.base, ...originalClass, ...smallClass];
}

export const bgPaletteClassName = "palette-background-color";
export const textPaletteClassName = "palette-text-color";
export const iconPaletteClassName = "palette-icon-color";
