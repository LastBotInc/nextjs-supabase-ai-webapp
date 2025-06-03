import Link from "next/link";
import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

/**
 * Color palettes for 4 different themes. Only these combinations are allowed.
 * Each palette has a class name that defines a background color, text color and icon color.
 * The icon color is used for the icon color of the theme.
 * The text color is used for the text color of the theme.
 * The background color is used for the background color of the theme.
 * Palette has 4 names: kupari (copper/gold color), piki (dark gray color), black and betoni (middle gray color).
 * The classes sets colors as css variables:
 * --palette-background-color
 * --palette-text-color
 * --palette-icon-color
 *
 * Every card should have a color palette class name.
 *
 * The palette class name can be applied to any element, usually card or container. Its children will inherit the colors.
 *
 * The background color is applied to the element with class name "palette-background-color".
 * The text color is applied to the element with class name "palette-text-color".
 * The icon color is applied to the element with class name "palette-icon-color".
 *
 *
 *
 * Example using kupari theme:
 * <div className="color-palette-kupari palette-background-color">
 *   <h1 className="palette-text-color">Hello</h1>
 *   <Icon className="palette-icon-color">Hello</Icon>
 * </div>
 *
 * @param background - The background color of the theme.
 * @param text - The text color of the theme.
 * @param icon - The icon color of the theme.
 */
export const colorPaletteClasses = {
  kupari: "color-palette-kupari",
  piki: "color-palette-piki",
  black: "color-palette-black",
  betoni: "color-palette-betoni",
};

export const getPaletteAsStyleAttributes = (palette: "kupari" | "piki" | "black" | "betoni"): React.CSSProperties => {
  return {
    "--palette-background-color": colorPalette[palette].background,
    "--palette-text-color": colorPalette[palette].text,
    "--palette-icon-color": colorPalette[palette].iconColor,
  } as React.CSSProperties;
};

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
