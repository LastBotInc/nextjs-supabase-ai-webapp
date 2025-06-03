import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mapSlots } from "../core/mapSlots";
import { getBlockContentAreaCss, getBlockCss } from "../cssJs/cssJs";

type SlotProps = { children: ReactNode; className?: string };

function BackgroundImage({ children }: SlotProps) {
  return <div className="absolute inset-0 -z-10 overflow-hidden">{children}</div>;
}
BackgroundImage.displayName = "BackgroundImage";

function CenteredContentArea({ children, className }: SlotProps) {
  return <div className={cn(getBlockContentAreaCss(), className)}>{children}</div>;
}
CenteredContentArea.displayName = "CenteredContentArea";

type BlockProps = {
  children: ReactNode;
  fullWidth?: boolean; // true = 100vw, false = max-width only
  backgroundColor?: string; // Tailwind class like "bg-muted"
  className?: string;
};

export function Block({ children, fullWidth = false, backgroundColor, className }: BlockProps) {
  const slots = mapSlots(children, ["BackgroundImage", "CenteredContentArea"]);

  return (
    <section className={cn(getBlockCss(), className)}>
      {slots.BackgroundImage && <div className="absolute inset-0 -z-10">{slots.BackgroundImage}</div>}

      {slots.CenteredContentArea && <>{slots.CenteredContentArea}</>}
    </section>
  );
}

Block.BackgroundImage = BackgroundImage;
Block.CenteredContentArea = CenteredContentArea;
