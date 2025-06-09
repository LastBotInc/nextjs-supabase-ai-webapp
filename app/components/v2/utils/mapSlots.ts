import { SlotComponentCandidate } from "../core/types";
import { getSlotName } from "./getSlotName";
import { Children, isValidElement, ReactNode } from "react";

/**
 * mapSlots is a function that maps the children of a component to a record of slots.
 *
 * @param children - The children of the component.
 * @param allowedSlotNames - The allowed slot names.
 * @returns A record of slots.
 */
export function mapSlots<T extends Record<string, SlotComponentCandidate>>(
  children: ReactNode,
  allowedSlotNames: string[] = [],
): T {
  const slots: Record<string, SlotComponentCandidate> = {};
  if (children) {
    Children.forEach(children, (child) => {
      if (
        !isValidElement(child) || typeof child === "string" ||
        typeof child === "number" || typeof child === "boolean"
      ) {
        return;
      }
      const slotName = getSlotName(child);
      const isAllowed = slotName &&
        (!allowedSlotNames.length || allowedSlotNames.includes(slotName));
      if (slotName && isAllowed) {
        slots[slotName] = child;
      }
    });
  }
  return slots as T;
}
