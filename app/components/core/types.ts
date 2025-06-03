import { HTMLAttributes, ReactElement } from "react";
import { ReactPortal } from "react";
import { JSXElementConstructor } from "react";

export type SlotComponentProps = { slotName?: string };
export type SlotComponentCandidate =
  | ReactPortal
  | ReactElement<unknown, string | JSXElementConstructor<SlotComponentProps>>;

export type SlotComponent<P = unknown> = React.ComponentType<P> & {
  displayName?: string;
};

export type ContentBlock =
  & React.PropsWithChildren<HTMLAttributes<HTMLElement>>
  & {
    palette?: "kupari" | "piki" | "black" | "betoni" | "default";
    isFirst?: boolean;
  };
