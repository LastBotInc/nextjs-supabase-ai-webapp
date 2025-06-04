import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { mapSlots } from "../core/mapSlots";
import { bgPaletteClassName, getBlockContentAreaCss, getBlockCss } from "../cssJs/cssJs";
import { BackgroundImageProps } from "../core/BackgroundImage";
import { BackgroundImage } from "../core/BackgroundImage";

type SlotProps = { children: ReactNode; className?: string };

function FullWidthBackgroundImage(props: BackgroundImageProps) {
  return <BackgroundImage {...props} />;
}
FullWidthBackgroundImage.displayName = "FullWidthBackgroundImage";

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
//  fullWidth = false, backgroundColor,
export function Block({ children, className }: BlockProps) {
  const slots = mapSlots(children, [FullWidthBackgroundImage.displayName, CenteredContentArea.displayName]);

  return (
    <section
      className={cn(
        getBlockCss(),
        className,
        !!slots[FullWidthBackgroundImage.displayName] && "relative",
        bgPaletteClassName
      )}
    >
      {slots[FullWidthBackgroundImage.displayName] && <>{slots[FullWidthBackgroundImage.displayName]}</>}
      {slots[CenteredContentArea.displayName] && <>{slots[CenteredContentArea.displayName]}</>}
    </section>
  );
}

Block.FullWidthBackgroundImage = FullWidthBackgroundImage;
Block.CenteredContentArea = CenteredContentArea;
