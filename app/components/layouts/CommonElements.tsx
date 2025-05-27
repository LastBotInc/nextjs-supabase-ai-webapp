import Link from "next/link";
import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

/**
 * Heading1 is the main heading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading1({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h1 className={cn("text-6xl font-light mb-4 font-['Inter_Tight'] leading-tight", className)} {...props}>
      {children}
    </h1>
  );
}

/**
 * Heading2 is the high level heading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading2({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("text-5xl lg:text-6xl font-light mb-4 font-['Inter_Tight'] leading-tight", className)} {...props}>
      {children}
    </h2>
  );
}

/**
 * Heading2Small is a smaller heading than Heading2.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading2Small({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("text-4xl font-light  font-['Inter_Tight']", className)} {...props}>
      {children}
    </h2>
  );
}

/**
 * Heading3 is a subheading of the page.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading3({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn("text-4xl font-light py-4font-['Inter_Tight']", className)} {...props}>
      {children}
    </h3>
  );
}

/**
 * Heading3Small is a smaller heading than Heading3.
 * @param children - The children of the heading.
 * @param className - Optional extra classes for customizing the heading.
 * passes also HTML attributes for the heading element with rest props.
 * @returns React.ReactNode
 */
export function Heading3Small({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn("text-2xl font-light py-4font-['Inter_Tight']", className)} {...props}>
      {children}
    </h3>
  );
}

/**
 * Paragraph is a paragraph of the page.
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
    variant?: "default" | "small" | "large";
  }
>) {
  const textSize = variant === "small" ? "text-sm" : variant === "large" ? "lg:text-2xl" : "text-lg";
  return (
    <p className={cn("mb-6", textSize, className)} {...props}>
      {children}
    </p>
  );
}

/**
 * LinkLikeButton is a button that looks like a link.
 * @param children - The children of the button.
 * @param className - Optional extra classes for customizing the button.
 * passes also HTML attributes for the button element with rest props.
 * @returns React.ReactNode
 */
export function LinkLikeButton({
  children,
  className,
  ...props
}: { children: React.ReactNode } & Parameters<typeof Link>[0]) {
  return (
    <Link
      className={`inline-block py-2 px-8 rounded-full font-medium hover:bg-opacity-90 transition-all text-lg ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </Link>
  );
}

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
