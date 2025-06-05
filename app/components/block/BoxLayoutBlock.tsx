import { ReactNode } from "react";
import { ContentContainer } from "../core/ContentContainer";
import { InnerBoxes } from "./InnerBoxes";
import { ContentBlock } from "../core/types";

function Box({
  children,
  className,
  palette,
}: {
  children: ReactNode;
  className?: string;
  palette?: ContentBlock["palette"];
}) {
  return (
    <InnerBoxes.Box palette={palette} className={className}>
      <ContentContainer asBlock noSpacing palette={palette}>
        {children}
      </ContentContainer>
    </InnerBoxes.Box>
  );
}

Box.displayName = "BoxLayoutBlock.Box";

export function BoxLayoutBlock({
  children,
  className,
  palette,
}: {
  children: React.ReactNode;
  className?: string;
  palette?: ContentBlock["palette"];
}) {
  return (
    <InnerBoxes palette={palette} className={className}>
      {children}
    </InnerBoxes>
  );
}

BoxLayoutBlock.Box = Box;
