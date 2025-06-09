import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { Size } from "./types";
import { textPaletteClassName } from "../styling/resolveStyles";

function getTextClass(variant?: Size) {
  if (!variant || variant === "default") {
    return "text";
  }
  if (variant === "small") {
    return "text small";
  }
  return "text large";
}

/**
 * Paragraph is a paragraph of the page.
 * Example:
 * <Paragraph>Paragraph</Paragraph>
 * <Paragraph variant="small">Small Paragraph</Paragraph>
 * <Paragraph variant="large">Large Paragraph</Paragraph>
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
    variant?: Size;
  }
>) {
  return (
    <p className={cn(getTextClass(variant), textPaletteClassName, className)} {...props}>
      {children}
    </p>
  );
}
