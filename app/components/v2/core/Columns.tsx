import { CSSProperties, ReactNode } from "react";
import { SizeDefinition } from "./types";
import { cn } from "@/lib/utils";
import { getValuePerBreakpoint } from "../styling/resolveStyles";

const getColumnBreakpoint = (columns: SizeDefinition): CSSProperties => {
  return Object.entries(getValuePerBreakpoint(columns, 1)).reduce((acc, [breakpoint, count]) => {
    if (breakpoint === "default") {
      // this enables the count use in columns.css
      acc[`--column-count-active`] = "auto";
    }
    acc[`--column-count-${breakpoint}`] = String(count);

    return acc;
  }, {} as Record<string, string>);
};

export function Columns({
  children,
  columns,
  className,
  style,
}: { children: ReactNode; className?: string; style?: CSSProperties } & {
  columns?: SizeDefinition;
}) {
  const styles = { ...style, ...(columns && getColumnBreakpoint(columns)) };

  return (
    <div style={styles} className={cn("columns", className)}>
      {children}
    </div>
  );
}
