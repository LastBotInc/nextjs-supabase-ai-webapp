import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

type SizeDefinition = {
  default: string;
  md?: string;
  lg?: string;
  xl?: string;
};

const sizeDefinitionToStyle = (prefix: string, sizeDefinition: SizeDefinition | string): React.CSSProperties => {
  if (typeof sizeDefinition === "string") {
    return {
      [`--${prefix}`]: sizeDefinition,
    };
  }
  return Object.entries(sizeDefinition).reduce((acc, [key, value]) => {
    if (value && key) {
      const cssKey = `--${prefix}-${key}` as keyof React.CSSProperties;
      acc[cssKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
};

export const spacing = {
  md: 6,
  lg: 14,
  responsivePadding: "p-6 lg:p-14",
  responsivePaddingY: "py-6 lg:py-14",
  responsivePaddingX: "px-6 lg:px-14",
  gapMd: 4,
  gapLg: 8,
  responsiveGap: "gap-4 lg:gap-8",
};
const containerClassName = "relative w-full bg-white p-6 lg:p-14 max-w-7xl mx-auto first:pt-0";

/**
 * Wrapper for common sections with a max width, center aligned with margins and inner padding.
 * This component is used to wrap sections that have a max width, center aligned with margins and inner padding.
 * @param className - Optional extra classes for customizing the block.
 * passes also HTML attributes for the section element with rest props.
 * @param children - The children of the block.
 * @returns React.ReactNode
 */
export function CommonBlock({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  const classNames = cn(containerClassName, "flex", className);
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

/**
 * This is identical to CommonBlock, but with a two column layout.
 * @param className - Optional extra classes for customizing the block.
 * passes also HTML attributes for the section element with rest props.
 * @param children - The children of the block.
 * @returns React.ReactNode
 */
export function CommonBlockWithCols({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  const classNames = cn(containerClassName, "columns-2 gap-8", className);
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

/**
 * This block is used to wrap sections that extend its background to the full width of the screen.
 * Its content is centered and  like with CommonBlock and CommonBlockWithCols.
 * @param className - Optional extra classes for customizing the block.
 * passes also HTML attributes for the section element with rest props.
 * @param children - The children of the block.
 * @param withPadding - Whether to add padding to the block.
 * @returns React.ReactNode
 */
export function FullScreenWidthBlock({
  children,
  className,
  withPadding = false,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement> & { withPadding?: boolean }>) {
  const classNames = cn("relative w-full", className, withPadding ? spacing.responsivePadding : "");
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

/**
 * This block is used to wrap sections that have a max width, center aligned with margins and inner padding.
 * Different from CommonBlock, this block has no bg or vertical padding.
 * It has no padding on xl screens.
 * @param className - Optional extra classes for customizing the block.
 * passes also HTML attributes for the section element with rest props.
 * @param children - The children of the block.
 * @returns React.ReactNode
 */
export function MaxWidthContentBlock({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  const classNames = cn(`relative w-full max-w-7xl mx-auto xl:px-0 px-${spacing.md}`, className);
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

/**
 * This is like MaxWidthContentBlock, but with a background image covering the area.
 * @param image - The background image to use.
 * @param className - Optional extra classes for customizing the block.
 * passes also HTML attributes for the section element with rest props.
 * @param children - The children of the block.
 * @returns React.ReactNode
 */
export function MaxWidthContentBlockWithBg({
  children,
  className,
  image,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement> & { image: string }>) {
  const classNames = cn("bg-cover bg-center", className);
  const style = {
    backgroundImage: `url(${image})`,
  };
  return (
    <MaxWidthContentBlock style={style} className={classNames} {...props}>
      {children}
    </MaxWidthContentBlock>
  );
}

export function FullWidthContentBlockWithBg({
  children,
  className,
  image,
  backgroundPosition,
  backgroundSize,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    image: string;
    backgroundPosition?: string | SizeDefinition;
    backgroundSize?: string | SizeDefinition;
  }
>) {
  const classNames = cn("bg-cover bg-center bg-no-repeat responsive-background-image", className);

  let style = {
    "--image": `url("${image}")`,
  } as React.CSSProperties;

  if (backgroundPosition) {
    style = {
      ...style,
      ...sizeDefinitionToStyle("position", backgroundPosition),
    };
  }
  if (backgroundSize) {
    style = {
      ...style,
      ...sizeDefinitionToStyle("size", backgroundSize),
    };
  }

  return (
    <FullScreenWidthBlock style={style} className={classNames} {...props}>
      {children}
    </FullScreenWidthBlock>
  );
}

/**
 * This component is used to add common padding to block's children.
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @param vertical - Whether to add padding to the vertical sides.
 * @param horizontal - Whether to add padding to the horizontal sides.
 * @param innerOnly - Whether to add padding to the inner sides only.
 * passes also HTML attributes for the section element with rest props.
 * @returns React.ReactNode
 */
export function BlockPadding({
  children,
  className,
  vertical = true,
  horizontal = true,
  innerOnly = false,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLElement> & { vertical?: boolean; horizontal?: boolean; innerOnly?: boolean }
>) {
  const padding = [];
  if (innerOnly) {
    padding.push(`px-${spacing.md} xl:px-0`);
  } else {
    if (vertical && horizontal) {
      padding.push(`p-${spacing.md} lg:p-${spacing.lg}`);
    } else if (vertical) {
      padding.push(`py-${spacing.md} lg:py-${spacing.lg}`);
    } else if (horizontal) {
      padding.push(`px-${spacing.md} lg:px-${spacing.lg}`);
    }
  }
  const classNames = cn(...padding, className);
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}

/**
 * This component is used to wrap a block with a rounded border and a flex column layout.
 * @param children - The children of the block.
 * @param className - Optional extra classes for customizing the block.
 * @param noPadding - Whether to add padding to the block.
 * passes also HTML attributes for the section element with rest props.
 * @returns React.ReactNode
 */
export function ColumnBlock({
  children,
  className = "",
  noPadding = false,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement> & { noPadding?: boolean }>) {
  const defaultClassNames = "relative rounded-2xl overflow-hidden has-overlay-pattern flex flex-col";
  let contentClassNames = "pb-4 relative flex flex-col justify-between";
  if (!noPadding) {
    contentClassNames = "p-6";
  }
  const classNames = cn(defaultClassNames, className);
  return (
    <div className={classNames} {...props}>
      <div className={contentClassNames}>{children}</div>
    </div>
  );
}
