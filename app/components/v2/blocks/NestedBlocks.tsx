import { NestedBlocksProps } from "../core/types";
import { ReactNode } from "react";
import { FullBlockStructure } from "./FullBlockStructure";

export function ContentColumn({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

ContentColumn.displayName = "NestedBlocks.ContentColumn";

export function NestedBlocksXXX({
  children,
  mainImage,
  contentImage,
  contentPalette,
  contentClassName,
  ...rest
}: Omit<NestedBlocksProps, "type">) {
  return (
    <FullBlockStructure {...rest}>
      {mainImage && <FullBlockStructure.MainBlockImage {...mainImage} />}
      <FullBlockStructure.Content contentImage={contentImage} palette={contentPalette} className={contentClassName}>
        {children}
      </FullBlockStructure.Content>
    </FullBlockStructure>
  );
}

NestedBlocksXXX.ContentColumn = ContentColumn;
