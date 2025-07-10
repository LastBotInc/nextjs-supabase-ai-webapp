import { cn } from "@/lib/utils";
import { ElementType, HTMLAttributes, isValidElement } from "react";
import { getSlotName } from "../utils/getSlotName";
import { headingPaletteClassName } from "../styling/resolveStyles";

export type HeadingProps = React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  small?: boolean;
  large?: boolean;
  bold?: boolean;
  responsive?: boolean;
  fixed?: boolean;
};
type FixedHeadingProps = Omit<HeadingProps, "level" | "small">;

export function getHeadingClass({ fixed, small, large, bold }: Omit<HeadingProps, "level">) {
  const classes = ["heading"];
  if (small) {
    classes.push("small");
  }
  if (large) {
    classes.push("large");
  }
  if (fixed) {
    classes.push("fixed");
  }
  if (bold) {
    classes.push("bold");
  }

  return classes.join(" ");
}

/**
 * HeadingComponent is the base component for all headings. It uses palette colors.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function HeadingComponent({
  children,
  className,
  level,
  small,
  large,
  fixed,
  bold,
  responsive,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as ElementType<HTMLAttributes<HTMLHeadingElement>>;
  const headingClasses = getHeadingClass({ small, large, bold, fixed, responsive }) + " " + headingPaletteClassName;
  return (
    <Component className={cn(headingClasses, className)} {...props}>
      {children}
    </Component>
  );
}
HeadingComponent.displayName = "HeadingComponent";

export const isHeadingComponent = (component: React.ReactNode): component is React.ReactElement<HeadingProps> => {
  if (!isValidElement(component)) {
    return false;
  }
  const name = getSlotName(component);
  return name === HeadingComponent.displayName;
};

/**
 * Heading1 is the main heading of the page.
 * Example:
 * <Heading1>Heading</Heading1>
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading1({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={1} {...props} />;
}

Heading1.displayName = "HeadingComponent";

/**
 * Heading2 is the high level heading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading2({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={2} {...props} />;
}

Heading2.displayName = "HeadingComponent";
/**
 * Heading2Small is a smaller heading than Heading2.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading2Small({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={2} {...props} small />;
}

Heading2Small.displayName = "HeadingComponent";
/**
 * Heading2Large is a larger heading than Heading2.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading2Large({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={2} {...props} large />;
}

Heading2Small.displayName = "HeadingComponent";

/**
 * Heading3 is a subheading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading3({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={3} {...props} />;
}

Heading3.displayName = "HeadingComponent";

/**
 * Heading3Small is a smaller heading than Heading3.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading3Small({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={3} {...props} small />;
}

Heading3Small.displayName = "HeadingComponent";
