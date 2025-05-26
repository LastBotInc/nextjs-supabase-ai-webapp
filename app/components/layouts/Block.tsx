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
 * @param htmlAttributes - HTML attributes for the section element.
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
