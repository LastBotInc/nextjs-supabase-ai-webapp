export const cssJs = {
  // always [size, weight, margin, font, leading]
  heading: {
    h1: [
      "text-6xl",
      "font-medium",
      "mb-4",
      "font-['Inter_Tight']",
      "leading-tight",
    ],
    h2: "text-3xl font-bold",
    h3: "text-2xl font-bold",
    h4: ["text-xl", "font-bold"],
    h5: ["text-lg", "font-bold"],
    h6: ["text-base", "font-bold"],
  },
  smallHeadings: {
    h1: ["text-2xl", "font-bold"],
    h2: ["text-2xl", "font-bold"],
    h3: ["text-xl", "font-bold"],
    h4: ["text-lg", "font-bold"],
    h5: ["text-base", "font-bold"],
    h6: ["text-sm", "font-bold"],
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
  palette: {
    kupari: {
      bg: "bg-kupari",
      text: "text-piki",
      icon: "text-piki",
    },
  },
};

export function getBlockCss() {
  return Object.values(cssJs.block).join(" ") + " first:pt-0";
}
export function getBlockContentAreaCss() {
  return Object.values(cssJs.blockContentArea).join(" ") +
    " relative overflow-hidden";
}

export function getHeadingClass(level: 1 | 2 | 3 | 4 | 5 | 6) {
  return [...cssJs.heading[`h${level}`]];
}
export function getSmallHeadingClass(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const originalClass = cssJs.heading[`h${level}`];
  const smallClass = cssJs.smallHeadings[`h${level}`];
  return [...originalClass, ...smallClass];
}

export const bgPaletteClassName = "palette-background-color";
export const textPaletteClassName = "palette-text-color";
export const iconPaletteClassName = "palette-icon-color";
