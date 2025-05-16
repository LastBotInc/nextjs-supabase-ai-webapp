import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

const containerClassName = "relative w-full bg-white p-14 max-w-7xl mx-auto";

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
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  const classNames = cn("relative w-full", className);
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
  const classNames = cn("relative w-full max-w-7xl mx-auto", className);
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
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement> & { image: string; backgroundPosition?: string }>) {
  const classNames = cn("bg-cover bg-center bg-no-repeat", className);
  const style = {
    backgroundImage: `url("${image}")`,
  };
  if (backgroundPosition) {
    style.backgroundPosition = backgroundPosition;
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
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement> & { vertical?: boolean; horizontal?: boolean }>) {
  const padding = [];
  if (vertical && horizontal) {
    padding.push("p-14");
  } else if (vertical) {
    padding.push("py-14");
  } else if (horizontal) {
    padding.push("px-14");
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
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  const defaultClassNames = "relative rounded-2xl overflow-hidden has-overlay-pattern flex flex-col";
  const classNames = cn(defaultClassNames, className);
  return (
    <div className={classNames} {...props}>
      <div className="p-6 pb-16 relative flex flex-col justify-between">{children}</div>
    </div>
  );
}
