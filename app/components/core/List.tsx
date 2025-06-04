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
      className={cn(getTextClass({ variant }), "list-disc list-inside space-y-2 pt-6", textPaletteClassName, className)}
      {...props}
    >
      {children}
    </ul>
  );
}
List.displayName = "List";
List.Item = ListItem;
