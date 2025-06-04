import { cn } from "@/lib/utils";
import { ElementType, HTMLAttributes } from "react";
import { getHeadingClass, textPaletteClassName } from "../cssJs/cssJs";

export type HeadingProps = React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  small?: boolean;
  medium?: boolean;
  responsive?: boolean;
};
type FixedHeadingProps = Omit<HeadingProps, "level" | "small">;

/**
 * HeadingComponent is the base component for all headings. It uses palette colors.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function HeadingComponent({ children, className, level, small, medium, responsive, ...props }: HeadingProps) {
  const Component = `h${level}` as ElementType<HTMLAttributes<HTMLHeadingElement>>;
  const headingClasses = getHeadingClass({ level, small, medium, responsive }) + " " + textPaletteClassName;
  return (
    <Component className={cn(headingClasses, className)} {...props}>
      {children}
    </Component>
  );
}

/**
 * Heading1 is the main heading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading1({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={1} {...props} />;
}

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

/**
 * Heading3 is a subheading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading3({ ...props }: FixedHeadingProps) {
  return <HeadingComponent level={3} {...props} small />;
}

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
