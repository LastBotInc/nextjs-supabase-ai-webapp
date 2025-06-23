import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function ImagePlaceholder({
  aspectRatio,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { aspectRatio: "16:9" | "4:3" | "1:1" | "3:4" | "full" }) {
  return (
    <div
      className={cn(
        "w-full text-white bg-gray-600 flex items-center justify-center rounded-lg",
        className,
        aspectRatio === "full" && "h-full"
      )}
      style={{ aspectRatio: aspectRatio.replace(":", "/") }}
      {...rest}
    >
      Image placeholder
    </div>
  );
}
