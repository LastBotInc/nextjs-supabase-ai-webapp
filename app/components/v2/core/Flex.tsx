import { cloneElement, CSSProperties, ReactElement, ReactNode } from "react";
import { BreakPoint, SizeDefinition } from "./types";
import { cn } from "@/lib/utils";
import { getGapClass, getValuePerBreakpoint } from "../styling/resolveStyles";

export type FlexProps = {
  oneColumnBreakpoint?: BreakPoint;
  direction?: "row" | "column";
  gaps?: "small" | "large" | "level-based";
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

export function Flex({
  children,
  oneColumnBreakpoint = "lg",
  className,
  style,
  direction = "row",
  gaps = "level-based",
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
    <div style={styles} className={cn("flex-container", className, getGapClass(gaps))}>
      {children}
    </div>
  );
}
Flex.FixedWidthColumn = FixedWidthColumn;
