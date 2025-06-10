import { Padding } from "../core/types";
import { ChildWrapper, FlexLayout, FlexLayoutProps } from "./FlexLayout";

export function BasicLayout({ padding = Padding.Full, children, direction = "column", ...rest }: FlexLayoutProps) {
  return (
    <FlexLayout {...rest} padding={padding} direction={direction}>
      <ChildWrapper>{children}</ChildWrapper>
    </FlexLayout>
  );
}
