import { SlotComponentCandidate } from "./types";
import { getSlotName } from "./getSlotName";
import { Children, isValidElement, ReactNode } from "react";

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
