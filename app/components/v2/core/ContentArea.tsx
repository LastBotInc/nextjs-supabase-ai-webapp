import { cn } from "@/lib/utils";
import { getPaddingStyles } from "../styling/resolveStyles";
import { ReactNode } from "react";
import { BlockProps } from "./types";

/**
 * ContentArea is a component that is used to display a content area.
 * Example:
 * <ContentArea padding="full">
 *   <Heading2>Heading</Heading2>
 *   <Paragraph>Paragraph</Paragraph>
 * </ContentArea>
 * @param children - The children of the content area.
 * @param className - The className of the content area.
 * @param padding - The padding of the content area.
 * @returns A div element with a content area.
 */
export function ContentArea({ children, className, padding = "full" }: Omit<BlockProps, "type">): ReactNode {
  return <div className={cn("content-area", getPaddingStyles(padding), className)}>{children}</div>;
}
