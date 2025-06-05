import { ReactNode } from "react";

export function ExtraBlockPadding({ children, mobileOnly = false }: { children: ReactNode; mobileOnly?: boolean }) {
  const css = mobileOnly ? "extra-padding-block-only-md" : "extra-padding-block";
  return <div className={css}>{children}</div>;
}
