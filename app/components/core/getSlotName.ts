import { SlotComponent } from "./types";

import { SlotComponentCandidate } from "./types";

export function getSlotName(child: SlotComponentCandidate): string | null {
  if (!child) {
    return null;
  }
  const displayName = (child as unknown as SlotComponent).displayName;
  if (displayName) {
    return displayName;
  }

  const typeFunction = child.type && typeof child.type === "function";
  const displayNameInType = typeFunction &&
    (child.type as SlotComponent).displayName;
  if (displayNameInType) {
    return displayNameInType;
  }

  const nameInType = typeFunction &&
    (child.type as React.FC).name;
  if (nameInType) {
    return nameInType;
  }

  return null;
}
