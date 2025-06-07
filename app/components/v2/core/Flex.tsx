import { cloneElement, CSSProperties, ReactElement, ReactNode } from "react";
import { BreakPoint, SizeDefinition } from "./types";
import { cn } from "@/lib/utils";
import { getValuePerBreakpoint } from "../styling/resolveStyles";

export function FixedWidthColumn({ children, width }: { children: ReactElement; width: string | SizeDefinition }) {
  const widthsAsVars = getValuePerBreakpoint(typeof width === "string" ? { default: width } : width, "0");
  const style = Object.entries(widthsAsVars).reduce((acc, [breakpoint, width]) => {
    acc[`--fixed-width-${breakpoint}`] = width;
    return acc;
  }, {} as Record<string, string>);

  return cloneElement(children, {
    ...children.props,
    className: cn("fixed-with-column", children.props.className),
    style: { ...children.props.style, ...style },
  });
}

FixedWidthColumn.displayName = "Flex.FixedWidthColumn";

export function Flex({
  children,
  oneColumnBreakpoint = "lg",
  className,
  style,
}: { children: ReactNode; className?: string; style?: CSSProperties } & {
  oneColumnBreakpoint?: BreakPoint;
}) {
  const styles = {
    ...style,
    ...{ [`--flex-direction-${oneColumnBreakpoint}`]: "row" },
  };

  return (
    <div style={styles} className={cn("flex-container", className)}>
      {children}
    </div>
  );
}
Flex.FixedWidthColumn = FixedWidthColumn;
