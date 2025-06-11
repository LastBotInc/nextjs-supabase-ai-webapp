import { Padding } from "../core/types";
import { ChildWrapper, FlexLayout, FlexLayoutProps } from "./FlexLayout";

export function BasicLayout({ padding, children, direction = "column", ...rest }: FlexLayoutProps) {
  // auto set padding if content palette is set and padding is not set
  // because then the content area should not need to be max sized
  if (rest.contentPalette && !padding) {
    padding = Padding.Full;
  } else {
    padding = Padding.None;
  }
  return (
    <FlexLayout {...rest} padding={padding} direction={direction}>
      <ChildWrapper>{children}</ChildWrapper>
    </FlexLayout>
  );
}
