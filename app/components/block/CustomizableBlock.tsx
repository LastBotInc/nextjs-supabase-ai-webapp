import { Block } from "./Block";
import { ContentBlock } from "../core/types";
import { cn } from "@/lib/utils";

export function CustomizableBlock({ children, palette, className }: ContentBlock & { className?: string }) {
  return (
    <Block className={cn(palette && `color-palette-${palette}`, className)}>
      <Block.CenteredContentArea>{children}</Block.CenteredContentArea>
    </Block>
  );
}
