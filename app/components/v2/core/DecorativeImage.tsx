import { cn } from "@/utils/cn";
import { BackgroundImage, BackgroundImageProps } from "./BackgroundImage";

/**
 * DecorativeImage shows a narrow decorative image that can extend beyond the container.
 * It is used in text-heavy pages to break up the text and add visual interest.
 *
 * It accepts the same props as BackgroundImage which it uses internally.
 *
 * - src - The source of the background image.
 * - backgroundPosition - The position of the background image.
 * - backgroundSize - The size of the background image.
 *
 * backgroundPosition and size can be a string or a SizeDefinition object.
 * Example:
 *  backgroundPosition: "top"
 *  backgroundPosition: {default: "top", md: "center", lg: "bottom", xl: "center"}
 * Example:
 * <DecorativeImage src="/images/home/2aac41606f2f57c11c3d0586a3eb85cf49a267a7.png" backgroundPosition="top" backgroundSize="cover" />
 * @param src - The source of the background image.
 * @param backgroundPosition - The position of the background image.
 * @param backgroundSize - The size of the background image.
 * @param alwaysShow - If true, the image will be always shown.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @param useMask - If true, the image will be masked.
 * @returns React.ReactNode
 */

export function DecorativeImage({
  width = "medium",
  height = "max-block",
  src,
  backgroundPosition = "center right",
  backgroundSize = "cover",
  useMask = false,
  alwaysShow = false,
  className,
}: BackgroundImageProps & {
  width: "small" | "medium" | "large" | "full";
  height: "tiny" | "medium" | "max" | "overflow-paddings" | "max-block" | "overflow-paddings-xl";
  useMask?: boolean;
  alwaysShow?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("decorative-image", "relative", `width-${width}`, !alwaysShow && "hidden lg:block", className)}
    >
      <div className={cn("decorative-image-sizer", `height-${height}`, useMask && "decorative-image--with-holes")}>
        <BackgroundImage src={src} backgroundPosition={backgroundPosition} backgroundSize={backgroundSize} />
      </div>
    </div>
  );
}
