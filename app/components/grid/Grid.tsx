import { ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";

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

type CellSlot = (typeof cellSlots)[number];
type RowSlot = (typeof rowSlots)[number];

type GridProps = {
  children: ReactNode;
  className?: string;
};

export function Grid({ children, className }: GridProps) {
  const slots: Partial<Record<CellSlot | RowSlot, ReactNode>> = {};

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const slotName = getSlotName(child.type);
    if (slotName) slots[slotName] = child.props.children;
  });

  const gridArea = (name: CellSlot) => {
    const row = name.startsWith("Top") ? "top" : name.startsWith("Middle") ? "middle" : "bottom";
    const col = name.endsWith("Left") ? "left" : name.endsWith("Center") ? "center" : "right";
    return `${row}-${col}`;
  };

  const usedAreas = new Set<string>();

  // Generate template area rows
  const templateAreas: string[] = [];

  for (const row of rowSlots) {
    if (slots[row]) {
      templateAreas.push(`"${row.toLowerCase()} ${row.toLowerCase()} ${row.toLowerCase()}"`);
      usedAreas.add(row.toLowerCase());
    } else {
      const rowLine = ["Left", "Center", "Right"]
        .map((pos) => {
          const cellKey = `${row}${pos}` as CellSlot;
          const areaName = gridArea(cellKey);
          if (slots[cellKey]) {
            usedAreas.add(areaName);
            return areaName;
          }
          return ".";
        })
        .join(" ");
      templateAreas.push(`"${rowLine}"`);
    }
  }

  return (
    <div
      className={cn("grid gap-2", "grid-cols-3 auto-rows-auto", "place-items-center", className)}
      style={{
        gridTemplateAreas: templateAreas.join("\n"),
      }}
    >
      {/* Row slots */}
      {rowSlots.map((slot) =>
        slots[slot] ? (
          <div key={slot} style={{ gridArea: slot.toLowerCase() }} className="w-full">
            {slots[slot]}
          </div>
        ) : null
      )}

      {/* Cell slots */}
      {cellSlots.map((slot) =>
        slots[slot] ? (
          <div key={slot} style={{ gridArea: gridArea(slot) }} className="w-full">
            {slots[slot]}
          </div>
        ) : null
      )}
    </div>
  );
}

// Helpers to map slot component types to names
function getSlotName(type: unknown): CellSlot | RowSlot | null {
  if (type && typeof type === "function" && (type as unknown as { slotName: string }).slotName)
    return (type as unknown as { slotName: string }).slotName as CellSlot | RowSlot;
  return null;
}

// Define all slot components
function makeSlot<T extends CellSlot | RowSlot>(slotName: T) {
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>;
  Slot.slotName = slotName;
  return Slot;
}

// Export main + slot bindings
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
