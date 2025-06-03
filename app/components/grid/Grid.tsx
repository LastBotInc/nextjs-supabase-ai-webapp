import { ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { getSlotName } from "../core/getSlotName";

const cellSlots = [
  "TopLeft",
  "TopCenter",
  "TopRight",
  "MiddleLeft",
  "MiddleCenter",
  "MiddleRight",
  "BottomLeft",
  "BottomCenter",
  "BottomRight",
] as const;

const rowSlots = ["Top", "Middle", "Bottom"] as const;
const colSlots = ["Left", "Center", "Right"] as const;

type SlotName = (typeof cellSlots)[number] | (typeof rowSlots)[number] | (typeof colSlots)[number];

type GridProps = {
  children: ReactNode;
  className?: string;
};

export function Grid({ children, className }: GridProps) {
  const slots: Partial<Record<SlotName, ReactNode>> = {};

  const usedCols = new Set<number>();
  const usedRows = new Set<number>();

  const colIndexMap = { left: 1, center: 2, right: 3 };
  const rowIndexMap = { top: 1, middle: 2, bottom: 3 };

  // Extract slots and track used row/column indices
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const slotName = getSlotName(child);
    if (!slotName || slots[slotName as SlotName]) return;

    slots[slotName as SlotName] = child.props.children;

    // Track row/col usage
    if (rowSlots.includes(slotName as (typeof rowSlots)[number])) {
      const row = rowIndexMap[slotName.toLowerCase() as keyof typeof rowIndexMap];
      usedRows.add(row);
    } else if (colSlots.includes(slotName as (typeof colSlots)[number])) {
      const col = colIndexMap[slotName.toLowerCase() as keyof typeof colIndexMap];
      usedCols.add(col);
    } else {
      const rowKey = slotName.match(/^(Top|Middle|Bottom)/)?.[0].toLowerCase();
      const colKey = slotName.match(/(Left|Center|Right)$/)?.[0].toLowerCase();
      if (rowKey) usedRows.add(rowIndexMap[rowKey as keyof typeof rowIndexMap]);
      if (colKey) usedCols.add(colIndexMap[colKey as keyof typeof colIndexMap]);
    }
  });

  const colCount = usedCols.size || 1;
  const rowCount = usedRows.size || 1;

  const gridColsClass = `grid-cols-${colCount}`;
  const gridRowsClass = `grid-rows-${rowCount}`;

  // Build grid-template-areas
  const templateAreas: string[] = [];
  for (const row of rowSlots) {
    if (slots[row]) {
      const name = row.toLowerCase();
      templateAreas.push(`"${name} ${name} ${name}"`);
    } else {
      const line = ["Left", "Center", "Right"]
        .map((pos) => {
          const cell = `${row}${pos}` as SlotName;
          const name = `${row.toLowerCase()}-${pos.toLowerCase()}`;
          return slots[cell] ? name : ".";
        })
        .join(" ");
      templateAreas.push(`"${line}"`);
    }
  }

  return (
    <div
      className={cn("grid gap-2 place-items-center", gridColsClass, gridRowsClass, className)}
      style={{ gridTemplateAreas: templateAreas.join("\n") }}
    >
      {/* Row slots */}
      {rowSlots.map((slot) =>
        slots[slot] ? (
          <div key={slot} style={{ gridArea: slot.toLowerCase() }} className="w-full">
            {slots[slot]}
          </div>
        ) : null
      )}

      {/* Column slots */}
      {colSlots.map((slot) =>
        slots[slot] ? (
          <div
            key={slot}
            style={{
              gridColumn: getColumnIndex(slot),
              gridRow: "1 / -1",
            }}
            className="w-full"
          >
            {slots[slot]}
          </div>
        ) : null
      )}

      {/* Cell slots */}
      {cellSlots.map((slot) => {
        const row = slot.match(/^(Top|Middle|Bottom)/)?.[0].toLowerCase();
        const col = slot.match(/(Left|Center|Right)$/)?.[0].toLowerCase();
        const area = `${row}-${col}`;
        return slots[slot] ? (
          <div key={slot} style={{ gridArea: area }} className="w-full">
            {slots[slot]}
          </div>
        ) : null;
      })}
    </div>
  );
}

function makeSlot(name: string) {
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>;
  Slot.displayName = name;
  return Slot;
}

function getColumnIndex(col: string): string {
  switch (col) {
    case "Left":
      return "1";
    case "Center":
      return "2";
    case "Right":
      return "3";
    default:
      return "auto";
  }
}

// Grid API bindings
Grid.TopLeft = makeSlot("TopLeft");
Grid.TopCenter = makeSlot("TopCenter");
Grid.TopRight = makeSlot("TopRight");
Grid.MiddleLeft = makeSlot("MiddleLeft");
Grid.MiddleCenter = makeSlot("MiddleCenter");
Grid.MiddleRight = makeSlot("MiddleRight");
Grid.BottomLeft = makeSlot("BottomLeft");
Grid.BottomCenter = makeSlot("BottomCenter");
Grid.BottomRight = makeSlot("BottomRight");

Grid.Top = makeSlot("Top");
Grid.Middle = makeSlot("Middle");
Grid.Bottom = makeSlot("Bottom");

Grid.Left = makeSlot("Left");
Grid.Center = makeSlot("Center");
Grid.Right = makeSlot("Right");
