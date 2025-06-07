import { NestedBlocksProps } from "../core/types";
import { FixedWidthColumn, Flex, FlexProps } from "../core/Flex";
import { FullBlockStructure } from "../blocks/FullBlockStructure";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Column({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex-column gap-container", className)}>{children}</div>;
}

Column.displayName = "FlexLayout.Column";

export function FlexLayout({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  oneColumnBreakpoint,
  direction,
  gaps,
  ...rest
}: Omit<NestedBlocksProps, "type"> & FlexProps) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content contentImage={contentImage} palette={contentPalette} className={contentClassName}>
        <Flex oneColumnBreakpoint={oneColumnBreakpoint} direction={direction} gaps={gaps}>
          {children}
        </Flex>
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

FlexLayout.FixedWidthColumn = FixedWidthColumn;
FlexLayout.Column = Column;
