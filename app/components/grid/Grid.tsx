// Grid.tsx
//
// Usage Example:
// <Grid>
//   <Grid.TopLeft>Top left content</Grid.TopLeft>
//   <Grid.MiddleCenter>Main content</Grid.MiddleCenter>
//   <Grid.BottomRight>Footer or action</Grid.BottomRight>
// </Grid>
//
// The Grid component arranges its children into a 3x3 grid using named slots. You can use row, column, or cell slots to position content.
//
// Slot types:
//   - Cell slots: TopLeft, TopCenter, TopRight, MiddleLeft, MiddleCenter, MiddleRight, BottomLeft, BottomCenter, BottomRight
//   - Row slots: Top, Middle, Bottom (span all columns in that row)
//   - Column slots: Left, Center, Right (span all rows in that column)
//
// Only one child per slot is allowed. The component auto-detects which slots are used and builds the grid accordingly.

import { ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { getSlotName } from "../core/getSlotName";

// Define all possible cell, row, and column slot names
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

// SlotName is a union of all possible slot names
type SlotName = (typeof cellSlots)[number] | (typeof rowSlots)[number] | (typeof colSlots)[number];

type GridProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Grid is a component that is used to display a grid. It has slots used for positioning its children.
 *
 * Usage Examples:
 *
 * // Example 1: Using cell slots for a 3x3 layout
 * <Grid>
 *   <Grid.TopLeft>Header Left</Grid.TopLeft>
 *   <Grid.TopCenter>Header Center</Grid.TopCenter>
 *   <Grid.TopRight>Header Right</Grid.TopRight>
 *   <Grid.MiddleLeft>Sidebar</Grid.MiddleLeft>
 *   <Grid.MiddleCenter>Main Content</Grid.MiddleCenter>
 *   <Grid.MiddleRight>Ads</Grid.MiddleRight>
 *   <Grid.BottomLeft>Footer Left</Grid.BottomLeft>
 *   <Grid.BottomCenter>Footer Center</Grid.BottomCenter>
 *   <Grid.BottomRight>Footer Right</Grid.BottomRight>
 * </Grid>
 * // Renders a full 3x3 grid with each cell filled.
 *
 * // Example 2: Using row slots to span all columns in a row
 * <Grid>
 *   <Grid.Top>Header (spans all columns)</Grid.Top>
 *   <Grid.MiddleCenter>Main Content</Grid.MiddleCenter>
 *   <Grid.Bottom>Footer (spans all columns)</Grid.Bottom>
 * </Grid>
 * // Renders header and footer spanning the grid width, with main content centered.
 *
 * // Example 3: Using column slots to span all rows in a column
 * <Grid>
 *   <Grid.Left>Sidebar (spans all rows)</Grid.Left>
 *   <Grid.MiddleCenter>Main Content</Grid.MiddleCenter>
 * </Grid>
 * // Renders a sidebar on the left spanning all rows, with main content centered.
 *
 * // Example 4: Mixing row, column, and cell slots
 * <Grid>
 *   <Grid.Top>Header</Grid.Top>
 *   <Grid.Left>Sidebar</Grid.Left>
 *   <Grid.MiddleCenter>Main Content</Grid.MiddleCenter>
 *   <Grid.BottomRight>Footer Action</Grid.BottomRight>
 * </Grid>
 * // Header spans top, sidebar spans left, main content is centered, and a footer action is in the bottom right.
 *
 * Notes:
 * - You can use any combination of cell, row, and column slots.
 * - Each slot can only be used once per grid instance.
 * - Unused slots are left empty.
 */
export function Grid({ children, className }: GridProps) {
  // Map to hold which slot contains which child
  const slots: Partial<Record<SlotName, ReactNode>> = {};

  // Track which columns and rows are used (for grid sizing)
  const usedCols = new Set<number>();
  const usedRows = new Set<number>();

  // Maps for converting slot names to grid indices
  const colIndexMap = { left: 1, center: 2, right: 3 };
  const rowIndexMap = { top: 1, middle: 2, bottom: 3 };

  // Extract slots and track used row/column indices
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    // getSlotName reads the displayName of the slot wrapper
    const slotName = getSlotName(child);
    if (!slotName || slots[slotName as SlotName]) return;

    // Store the child content in the correct slot
    slots[slotName as SlotName] = child.props.children;

    // Track which rows/cols are used for grid sizing
    if (rowSlots.includes(slotName as (typeof rowSlots)[number])) {
      const row = rowIndexMap[slotName.toLowerCase() as keyof typeof rowIndexMap];
      usedRows.add(row);
    } else if (colSlots.includes(slotName as (typeof colSlots)[number])) {
      const col = colIndexMap[slotName.toLowerCase() as keyof typeof colIndexMap];
      usedCols.add(col);
    } else {
      // For cell slots, extract row and col from the slot name
      const rowKey = slotName.match(/^(Top|Middle|Bottom)/)?.[0].toLowerCase();
      const colKey = slotName.match(/(Left|Center|Right)$/)?.[0].toLowerCase();
      if (rowKey) usedRows.add(rowIndexMap[rowKey as keyof typeof rowIndexMap]);
      if (colKey) usedCols.add(colIndexMap[colKey as keyof typeof colIndexMap]);
    }
  });

  // Determine how many columns and rows are needed
  const colCount = usedCols.size || 1;
  const rowCount = usedRows.size || 1;

  // Tailwind grid classes for column/row count
  const gridColsClass = `grid-cols-${colCount}`;
  const gridRowsClass = `grid-rows-${rowCount}`;

  // Build CSS grid-template-areas for row/cell slots
  const templateAreas: string[] = [];
  for (const row of rowSlots) {
    if (slots[row]) {
      // If a row slot is used, it spans all columns
      const name = row.toLowerCase();
      templateAreas.push(`"${name} ${name} ${name}"`);
    } else {
      // Otherwise, check for cell slots in this row
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
      {/* Render row slots (span all columns) */}
      {rowSlots.map((slot) =>
        slots[slot] ? (
          <div key={slot} style={{ gridArea: slot.toLowerCase() }} className="w-full">
            {slots[slot]}
          </div>
        ) : null
      )}

      {/* Render column slots (span all rows) */}
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

      {/* Render cell slots (specific cell) */}
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

// Helper to create slot wrappers with displayName for slot detection
function makeSlot(name: string) {
  // Slot is a wrapper that just renders its children
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>;
  Slot.displayName = name;
  return Slot;
}

// Helper to get column index for column slots
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

// Attach slot wrappers to Grid for easy usage
// Example: <Grid.TopLeft>...</Grid.TopLeft>
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
