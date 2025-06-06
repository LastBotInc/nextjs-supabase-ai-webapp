import { cn } from "@/lib/utils";
import { getPaddingStyles } from "../styling/resolveStyles";
import { ReactNode } from "react";
import { BlockProps } from "./types";

export function ContentArea({ children, className, padding = "full" }: BlockProps): ReactNode {
  return <div className={cn("content-area", getPaddingStyles(padding), className)}>{children}</div>;
}
