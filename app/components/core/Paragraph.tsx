import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { getTextClass, textPaletteClassName } from "../cssJs/cssJs";

/**
 * Paragraph is a paragraph of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * @param variant - Optional variant of the paragraph. It can be "default", "small" or "large".
 * passes also HTML attributes for the paragraph element with rest props.
 * @returns React.ReactNode
 */
export function Paragraph({
  children,
  className,
  variant,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLParagraphElement> & {
    variant?: "default" | "small" | "large";
  }
>) {
  return (
    <p className={cn(getTextClass({ variant }), textPaletteClassName, className)} {...props}>
      {children}
    </p>
  );
}
