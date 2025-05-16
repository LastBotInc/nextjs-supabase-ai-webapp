import Link from "next/link";
import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

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

export function Heading2({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h2 className={cn("text-6xl font-light mb-4 font-['Inter_Tight'] leading-tight", className)} {...props}>
      {children}
    </h2>
  );
}
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

export function Paragraph({
  children,
  className,
  ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("mb-6 text-lg", className)} {...props}>
      {children}
    </p>
  );
}

export function LinkLikeButton({
  children,
  className,
  ...props
}: { children: React.ReactNode } & Parameters<typeof Link>[0]) {
  return (
    <Link
      className={`inline-block py-2 px-8 rounded-full font-medium hover:bg-opacity-90 transition-all text-sm ${
        className ?? ""
      }`}
      {...props}
    >
      {children}
    </Link>
  );
}

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
    backgroundSize: "56%",
  };
  return (
    <div className={cn("flex", className)} {...props}>
      <Paragraph className="text-left bg-no-repeat bg-contain pl-6" style={style}>
        <span
          className="text-shape"
          style={{ "--shape": image.shape, aspectRatio: image.aspectRatio || "1/1" } as React.CSSProperties}
        ></span>
        {children}
      </Paragraph>
    </div>
  );
}
