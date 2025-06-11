import { ReactNode } from "react";
import { ChildWrapper, FlexLayoutProps } from "./FlexLayout";
import { BasicLayout } from "./BasicLayout";

/**
 * TwoColumnLayout is a layout component that renders two columns side by side. It wraps both children with containers that set gaps and spacing
 * It uses FlexLayout component to render the layout and ChildWrapper component to wrap the children.
 * By default in mobile view the columns are stacked on top of each other. Breakpoint is  "lg" by default.
 * @param children - The children of the layout. There must be two children.
 * @param columnWidths - The widths of the columns as responsive a SizeDefinition object.
 * @param rest - The rest of the props.
 * @returns A div element with two columns.
 */
export function TwoColumnLayout({
  children,
  columnWidths,
  ...rest
}: Omit<FlexLayoutProps, "children"> & { children: [ReactNode, ReactNode] }) {
  console.log("###direction", "ROW!!!");
  return (
    <BasicLayout {...rest} direction="row">
      <ChildWrapper columnWidths={columnWidths}>{children}</ChildWrapper>
    </BasicLayout>
  );
}
