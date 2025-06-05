/**
 * Content is a component that is used to render content with common spacing.
 *
 * It can be rendered as a flex or grid container.
 *
 * It accepts only its own slots as children:
 *
 * - Heading - A slot for a heading of the content. Renders a heading component. Use "level" prop to set the heading level.
 *     If the Heading component is passed as a child for the Content component, it will be rendered, not two headings.
 * - Columns - A slot for a columns of the content. Renders a columns component. If the Columns component is passed as a child for the Content component, it will be rendered as a columns.
 * - Text - A slot for a text of the content. Renders a text component. If the Text component is passed as a child for the Content component, it will be rendered as a text.
 * - Wrapper - A slot for a wrapper of the content. Renders a wrapper component. If the Wrapper component is passed as a child for the Content component, it will be rendered as a wrapper.
 *
 * - Heading, Columns, Text and Wrapper are rendered as is, no wrappers are set.
 *
 * @param children - The children of the content.
 * @param palette - The palette of the content. "default" is the default palette.
 * @param noSpacing - If true, the content will be rendered without spacing.
 * @param asGrid - If true, the content will be rendered as a grid container.
 * @param addTextShadow - If true, the content will have a text shadow.
 * @param className - Optional extra classes for customizing the content.
 * @returns React.ReactNode
 */
import { ReactNode, ReactElement, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";
import { getSlotName } from "../core/getSlotName";
import { ContentBlock } from "../core/types";
import { getContentCss } from "../cssJs/cssJs";
import { HeadingComponent, HeadingProps, isHeadingComponent } from "../core/Headings";

type SlotProps = { children: ReactNode; className?: string };

function Heading({ level = 2, children, ...rest }: Omit<HeadingProps, "level"> & { level?: HeadingProps["level"] }) {
  const firstChild = Children.toArray(children)[0];
  const isHeading = !!firstChild && isHeadingComponent(firstChild);
  if (isHeading) {
    return <>{children}</>;
  }
  return (
    <HeadingComponent level={level} {...rest}>
      {children}
    </HeadingComponent>
  );
}

function Column({ children, addContainer = false, className }: SlotProps & { addContainer?: boolean }) {
  return <>{addContainer ? <div className={cn("flex flex-col space-y-8", className)}>{children}</div> : children}</>;
}

function Text({ children, className }: SlotProps) {
  return <div className={cn(className)}>{children}</div>;
}

function Wrapper({ children, className }: SlotProps & { className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

Heading.displayName = "Content.Heading";
Column.displayName = "Content.Column";
Text.displayName = "Content.Text";
Wrapper.displayName = "Content.Wrapper";

export function Content({
  children,
  palette = "default",
  noSpacing = false,
  asGrid = false,
  addTextShadow = false,
  className,
}: ContentBlock & { noSpacing?: boolean; asGrid?: boolean; addTextShadow?: boolean }) {
  const slots: {
    Heading: ReactNode;
    Columns: ReactElement[];
    Text: ReactNode;
    Wrapper: ReactNode;
  } = {
    Heading: null,
    Columns: [],
    Text: null,
    Wrapper: null,
  };

  function extractSlots(nodes: ReactNode): void {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const slotName = getSlotName(child);
      const { props } = child;

      if (slotName === Heading.displayName) {
        slots.Heading = child;
      } else if (slotName === Column.displayName) {
        slots.Columns.push(child);
      } else if (slotName === Text.displayName) {
        slots.Text = child;
      } else if (slotName === Wrapper.displayName) {
        extractSlots(props.children);
        slots.Wrapper = child;
      } else if (props?.children) {
        extractSlots(props.children); // recursively dig through unknown wrappers
      }
    });
  }

  extractSlots(children);

  const columnCount = slots.Columns.length;
  const columnClass = `columns-${columnCount}`;

  const columns = (
    <>
      {slots.Columns.map((col, i) => (
        <Column key={i} {...col.props}>
          {col.props.children}
        </Column>
      ))}
    </>
  );
  const flexClasses = asGrid ? "" : "flex flex-row gap-4 lg:gap-8";
  const gridClasses = asGrid ? "grid gap-4 lg:gap-8 grid-cols-1 lg:grid-cols-2 bg-transparent" : "";
  const renderedColumns = (
    <div className={cn(flexClasses, gridClasses, columnClass, addTextShadow && "shadow-text")}>{columns}</div>
  );

  return (
    <div
      className={cn(
        `color-palette-${palette}`,
        getContentCss({ omitKeys: noSpacing ? ["padding", "paddingInline", "paddingBlock"] : [] }),
        className
      )}
    >
      {slots.Heading && <>{slots.Heading}</>}

      {slots.Wrapper ? cloneElement(slots.Wrapper as ReactElement, {}, columns) : renderedColumns}

      {slots.Text && <Text>{slots.Text}</Text>}
    </div>
  );
}

Content.Heading = Heading;
Content.Column = Column;
Content.Text = Text;
Content.Wrapper = Wrapper;
