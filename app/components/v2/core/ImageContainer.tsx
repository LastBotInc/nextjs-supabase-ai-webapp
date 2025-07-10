/**
 * ImageContainer is a component that is used as an image wrapper
 *
 * It accepts only its own props:
 *
 * @param children - The children of the image container.
 * @param padding - The padding of the image container as string or SizeDefinition object.
 * Example:
 *  padding: "10px"
 *  padding: {default: "10px", md: "20px", lg: "30px", xl: "40px"}
 * @param aspectRatio - The aspect ratio of the image container as string or SizeDefinition object.
 * @param className - The class name of the image container.
 * @param props - The props of the image container.
 *
 *
 * @returns React.ReactNode
 */
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { PaddingType } from "../core/types";
import { getPaddingStyles } from "../styling/resolveStyles";

export function ImageContainer({
  children,
  className,
  padding,
  aspectRatio,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLParagraphElement> & {
    padding?: PaddingType;
    aspectRatio?: "16/9" | "4/3" | "1/1" | "9/16" | "3/4";
  }
>) {
  const classes = cn(
    padding && getPaddingStyles(padding),
    "w-full",
    aspectRatio && `image-container-with-aspect-ratio-${aspectRatio.replace("/", "-")}`,
    className
  );
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
