import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { getTextClass, textPaletteClassName } from "../cssJs/cssJs";

function ListItem({ children, className, ...props }: React.PropsWithChildren<HTMLAttributes<HTMLLIElement>>) {
  return (
    <li className={cn(textPaletteClassName, className)} {...props}>
      {children}
    </li>
  );
}

ListItem.displayName = "List.ListItem";

/**
 * List is a component that is used to display a list. Use it as a wrapper for a list of items and items should be List.Item
 *
 * It accepts HTMLUListElement props and:
 * @param variant - The variant of the list.
 * @returns React.ReactNode
 *
 *
 */
export function List({
  children,
  className,
  variant,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLUListElement> & {
    variant?: "default" | "small" | "large";
  }
>) {
  return (
    <ul
      className={cn(getTextClass({ variant }), "list-disc list-inside space-y-2", textPaletteClassName, className)}
      {...props}
    >
      {children}
    </ul>
  );
}
List.displayName = "List";
List.Item = ListItem;
