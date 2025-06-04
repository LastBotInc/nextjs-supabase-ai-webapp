import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { getPadding, SizeDefinition } from "../cssJs/cssJs";

export function ImageContainer({
  children,
  className,
  padding,
  aspectRatio,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLParagraphElement> & {
    padding?: string | SizeDefinition;
    aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16" | "3/4";
  }
>) {
  const classes = cn(padding && getPadding(padding), "w-full", aspectRatio, className);
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
