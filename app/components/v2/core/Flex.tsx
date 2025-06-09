import { cloneElement, CSSProperties, ReactElement, ReactNode } from "react";
import { BreakPoint, SizeDefinition } from "./types";
import { cn } from "@/lib/utils";
import { getGapClass, getValuePerBreakpoint } from "../styling/resolveStyles";

export type FlexProps = {
  oneColumnBreakpoint?: BreakPoint;
  direction?: "row" | "column";
  gaps?: "small" | "large" | "level-based" | "none";
  autoFlexChildren?: boolean;
};

export function FixedWidthColumn({ children, width }: { children: ReactElement; width: string | SizeDefinition }) {
  const widthsAsVars = getValuePerBreakpoint(typeof width === "string" ? { default: width } : width, "0");
  const style = Object.entries(widthsAsVars).reduce((acc, [breakpoint, width]) => {
    acc[`--fixed-width-${breakpoint}`] = width;
    return acc;
  }, {} as Record<string, string>);

  const props = children.props || {};
  return cloneElement(children, {
    ...props,
    className: cn("fixed-with-column", props.className),
    style: { ...props.style, ...style },
  });
}

FixedWidthColumn.displayName = "Flex.FixedWidthColumn";

/**
 * Flex is a component that is used to display a flex container. It auto-sets gaps and flex direction. It breaks to single column at oneColumnBreakpoint.
 * Use Flex.FixedWidthColumn if a child needs to be fixed width. It uses responsive width to alter width with breakpoints.
 * Example:
 * <Flex>
 *   <Flex.FixedWidthColumn width="300px">
 *     <Heading2>Heading</Heading2>
 *     <Paragraph>Paragraph</Paragraph>
 *   </Flex.FixedWidthColumn>
 * @param children - The children of the flex container.
 * @param oneColumnBreakpoint - The breakpoint at which the flex container should switch to a single column.
 * @param className - The className of the flex container.
 * @param style - The style of the flex container.
 */
export function Flex({
  children,
  oneColumnBreakpoint = "lg",
  className,
  style,
  direction = "row",
  gaps = "level-based",
  autoFlexChildren = true,
}: { children: ReactNode; className?: string; style?: CSSProperties } & FlexProps) {
  /* default direction is row (in css specs), so we don't need to set it */
  const styles = {
    ...style,
    ...(direction !== "row" && { ["--flex-direction"]: direction }),
    ...(direction !== "column" && {
      [`--flex-direction-default`]: "column",
      [`--flex-direction-${oneColumnBreakpoint}`]: "row",
    }),
  };
  return (
    <div
      style={styles}
      className={cn("flex-container", className, getGapClass(gaps), autoFlexChildren && "auto-flex-children")}
    >
      {children}
    </div>
  );
}
Flex.FixedWidthColumn = FixedWidthColumn;
