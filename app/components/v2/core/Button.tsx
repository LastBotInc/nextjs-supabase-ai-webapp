import { cn } from "@/lib/utils";
import { buttonPaletteClassName, buttonTextPaletteClassName } from "../styling/resolveStyles";
import { HTMLAttributes } from "react";

/**
 * Button component. Uses palette colors for styling.
 * Example:
 * <Button>Button</Button>
 * Accepts all HTML button attributes.
 * @returns React.ReactNode
 */
export function Button({ children, className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const classes = cn(
    "inline-block py-2 px-8 rounded-full font-medium hover:bg-opacity-90 transition-all self-start text-lg z-10 highlight-effect overflow-hidden",
    className,
    buttonPaletteClassName,
    buttonTextPaletteClassName
  );
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
