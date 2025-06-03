"use client";

import { ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  variant?: "light" | "dark";
};

type SlotProps = { children: ReactNode };

function Heading({ children }: SlotProps) {
  return <h3 className="text-xl font-semibold">{children}</h3>;
}

function Content({ children }: SlotProps) {
  return <div className="text-sm text-muted-foreground">{children}</div>;
}

function Image({ children }: SlotProps) {
  return <div className="mb-4">{children}</div>;
}

const slotMap = {
  Heading,
  Content,
  Image,
};

export function Card({ children, variant = "light" }: CardProps) {
  const slots: Record<keyof typeof slotMap, ReactNode> = {
    Heading: null,
    Content: null,
    Image: null,
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const typeName = Object.entries(slotMap).find(([_, comp]) => child.type === comp)?.[0];
    if (typeName && slots[typeName as keyof typeof slotMap] === null) {
      slots[typeName as keyof typeof slotMap] = child.props.children;
    }
  });

  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm space-y-2",
        variant === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      )}
    >
      {slots.Image && <div>{slots.Image}</div>}
      {slots.Heading && <h3 className="text-xl font-semibold">{slots.Heading}</h3>}
      {slots.Content && <div className="text-sm text-muted-foreground">{slots.Content}</div>}
    </div>
  );
}

Card.Heading = Heading;
Card.Content = Content;
Card.Image = Image;
