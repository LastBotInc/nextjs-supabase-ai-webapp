"use client";

type CardProps = {
  children: React.ReactNode;
  image: string;
  title: string;
  description: string;
  link: string;
};
export function Card({ children, className }: CardProps) {
  const defaultClassNames = "relative rounded-2xl overflow-hidden has-overlay-pattern flex flex-row justify-between";
  return <div className={`${defaultClassNames} ${className}`}>{children}</div>;
}

export function CardContentWithTextFloatAroundShape({ children, className }: React.PropsWithChildren<unknown>) {
  const defaultClassNames = "p-6 pb-16 relative flex";
  return <div className={`${defaultClassNames} ${className}`}>{children}</div>;
}
export function AlignContentsTopBottom({ children }: React.PropsWithChildren<unknown>) {
  return <div className="card-content-aligned-top-bottom">{children}</div>;
}
