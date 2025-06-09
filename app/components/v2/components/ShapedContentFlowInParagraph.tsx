import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import { Paragraph } from "../core/Paragraph";

/**
 * ShapedContentFlowInParagraph is a paragraph with an image and shape flowing the text.
 * @param image - The image to use as the background. Image src, alt, shape and aspect ratio are required.
 * @param className - Optional extra classes for customizing the paragraph.
 * passes also HTML attributes for the paragraph element with rest props.
 * @returns React.ReactNode
 */
export function ShapedContentFlowInParagraph({
  image,
  className,
  children,
  ...props
}: React.PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    image: { src: string; alt: string; shape: string; aspectRatio: string };
  }
>) {
  const style = {
    backgroundImage: `url(${image.src})`,
    backgroundPosition: "bottom right",
    "--shape": image.shape,
    aspectRatio: image.aspectRatio || "1/1",
  };
  return (
    <div className={cn("flex", className)} {...props}>
      <Paragraph className="text-left">
        <span className={`text-shape bg-no-repeat bg-contain`} style={style}></span>
        {children}
      </Paragraph>
    </div>
  );
}
