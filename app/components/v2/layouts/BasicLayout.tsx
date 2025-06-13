import { cn } from "@/lib/utils";
import { hasVisualPalette } from "../styling/resolveStyles";
import { resolvePaddings } from "../utils/resolvePaddings";
import { FlexLayout, FlexLayoutProps } from "./FlexLayout";

export function BasicLayout(props: FlexLayoutProps) {
  const { children, className, direction = "column", ...rest } = props;
  // auto set padding if content palette is set and padding is not set
  // because then the content area should not need to be max sized
  const paddings = resolvePaddings(rest);
  const hasMainBg = !!rest.mainImage || hasVisualPalette(rest.palette);
  return (
    <FlexLayout
      className={cn(className, hasMainBg ? "block-main-with-bg" : "block-main-without-bg")}
      {...rest}
      padding={paddings.main}
      contentPadding={paddings.content}
      direction={direction}
    >
      {children}
    </FlexLayout>
  );
}
