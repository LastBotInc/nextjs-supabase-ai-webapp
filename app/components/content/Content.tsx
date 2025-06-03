"use client";

import { ReactNode, ReactElement, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

type SlotProps = { children: ReactNode };

function Heading({ children }: SlotProps) {
  return <h2 className="text-2xl font-bold mb-2">{children}</h2>;
}

function Column({ children }: SlotProps) {
  return <div>{children}</div>;
}

function Text({ children }: SlotProps) {
  return <div className="text-base text-muted-foreground mt-4">{children}</div>;
}

function Wrapper({ children }: SlotProps) {
  return <div className="wrapper p-2 bg-muted rounded">{children}</div>;
}

function Highlight({ children }: SlotProps) {
  return <div className="highlight bg-yellow-100 p-3 rounded">{children}</div>;
}

type ContentProps = {
  children: ReactNode;
};

export function Content({ children }: ContentProps) {
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

      const { type, props } = child;

      if (type === Heading) {
        slots.Heading = props.children;
      } else if (type === Column) {
        slots.Columns.push(child);
      } else if (type === Text) {
        slots.Text = props.children;
      } else if (type === Wrapper) {
        extractSlots(props.children);
        slots.Wrapper = child;
      } else if (type === Highlight) {
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

  const renderedColumns = (
    <div className={cn("column-wrapper", columnClass)}>
      {slots.Columns.map((col, i) => (
        <div key={i}>{col.props.children}</div>
      ))}
    </div>
  );

  return (
    <section className="space-y-4">
      {slots.Heading && <Heading>{slots.Heading}</Heading>}

      {slots.Wrapper ? cloneElement(slots.Wrapper as ReactElement, {}, renderedColumns) : renderedColumns}

      {slots.Highlight
        ? cloneElement(slots.Highlight as ReactElement, {}, <Text>{slots.Text}</Text>)
        : slots.Text && <Text>{slots.Text}</Text>}
    </section>
  );
}

Content.Heading = Heading;
Content.Column = Column;
Content.Text = Text;
Content.Wrapper = Wrapper;
Content.Highlight = Highlight;
