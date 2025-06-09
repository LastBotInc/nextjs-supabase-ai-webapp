import { cn } from "@/lib/utils";
import Link from "next/link";
import { buttonPaletteClassName, buttonTextPaletteClassName } from "../cssJs/cssJs";

/**
 * LinkButton is a link that looks like a button.
 * @param children - The children of the button.
 * @param className - Optional extra classes for customizing the button.
 * passes also HTML attributes for the button element with rest props.
 * @returns React.ReactNode
 */
export function LinkButton({
  children,
  className,
  ...props
}: { children: React.ReactNode } & Parameters<typeof Link>[0]) {
  const classes = cn(
    "inline-block py-2 px-8 rounded-full font-medium hover:bg-opacity-90 transition-all self-start text-lg z-10 highlight-effect overflow-hidden",
    className,
    buttonPaletteClassName,
    buttonTextPaletteClassName
  );
  return (
    <Link className={classes} {...props}>
      {children}
    </Link>
  );
}
