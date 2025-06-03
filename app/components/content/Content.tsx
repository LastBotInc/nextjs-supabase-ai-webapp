import { ReactNode, ReactElement, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";
import { getSlotName } from "../core/getSlotName";
import { ContentBlock } from "../core/types";
import { getContentCss } from "../cssJs/cssJs";

type SlotProps = { children: ReactNode };

function Heading({ children }: SlotProps) {
  return <h2 className={`flex flex-col`}>{children}</h2>;
}

function Column({ children, addContainer = false }: SlotProps & { addContainer?: boolean }) {
  return <>{addContainer ? <div className="flex flex-col">{children}</div> : children}</>;
}

function Text({ children }: SlotProps) {
  return <div className="text-base text-muted-foreground mt-4">{children}</div>;
}

function Wrapper({ children, className }: SlotProps & { className?: string }) {
  return <div className={cn(className)}>{children}</div>;
}

function Highlight({ children }: SlotProps) {
  return <div className="highlight bg-yellow-100 p-3 rounded">{children}</div>;
}

Heading.displayName = "Content.Heading";
Column.displayName = "Content.Column";
Text.displayName = "Content.Text";
Wrapper.displayName = "Content.Wrapper";
Highlight.displayName = "Content.Highlight";

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
    Highlight: ReactNode;
  } = {
    Heading: null,
    Columns: [],
    Text: null,
    Wrapper: null,
    Highlight: null,
  };

  function extractSlots(nodes: ReactNode): void {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) return;
      const slotName = getSlotName(child);
      const { props } = child;

      if (slotName === Heading.displayName) {
        slots.Heading = props.children;
      } else if (slotName === Column.displayName) {
        slots.Columns.push(child);
      } else if (slotName === Text.displayName) {
        slots.Text = props.children;
      } else if (slotName === Wrapper.displayName) {
        extractSlots(props.children);
        slots.Wrapper = child;
      } else if (slotName === Highlight.displayName) {
        extractSlots(props.children);
        slots.Highlight = child;
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
        <Column key={i}>{col.props.children}</Column>
      ))}
    </>
  );
  const flexClasses = asGrid ? "" : "flex flex-row gap-4";
  const gridClasses = asGrid ? "grid gap-4 lg:gap-8 grid-cols-1 md:grid-cols-2 bg-transparent" : "";
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
      {slots.Heading && <Heading>{slots.Heading}</Heading>}

      {slots.Wrapper ? cloneElement(slots.Wrapper as ReactElement, {}, columns) : renderedColumns}

      {slots.Highlight
        ? cloneElement(slots.Highlight as ReactElement, {}, <Text>{slots.Text}</Text>)
        : slots.Text && <Text>{slots.Text}</Text>}
    </div>
  );
}

Content.Heading = Heading;
Content.Column = Column;
Content.Text = Text;
Content.Wrapper = Wrapper;
Content.Highlight = Highlight;
