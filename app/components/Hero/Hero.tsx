import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BackgroundImage, BackgroundImageProps } from "../core/BackgroundImage";
import { mapSlots } from "../core/mapSlots";
import { Block } from "../block/Block";
import { ContentBlock } from "../core/types";
import { HeadingComponent } from "../core/Headings";
import { getCssProp } from "../cssJs/cssJs";

type SlotProps = { children: ReactNode; className?: string };

function Heading({ children }: SlotProps) {
  return <>{children}</>;
}

function SubHeading({ children }: SlotProps) {
  return <>{children}</>;
}

function Text({ children }: SlotProps) {
  return <p>{children}</p>;
}

function Image(props: BackgroundImageProps) {
  return <BackgroundImage {...props} />;
}

function ExtraContent({ children }: SlotProps) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

Heading.displayName = "Hero.Heading";
SubHeading.displayName = "Hero.SubHeading";
Text.displayName = "Hero.Text";
Image.displayName = "Hero.Image";
ExtraContent.displayName = "Hero.ExtraContent";

export function Hero({ children, palette = "default", isFirst = false }: ContentBlock) {
  const slots = mapSlots(children, [
    Heading.displayName,
    SubHeading.displayName,
    Text.displayName,
    Image.displayName,
    ExtraContent.displayName,
  ]);

  return (
    <Block>
      <Block.CenteredContentArea>
        <div
          className={cn(
            "relative xl:rounded-lg overflow-hidden",
            getCssProp("blockContentArea", "padding"),
            `color-palette-${palette}`
          )}
        >
          {/* bg image */}
          {slots[Image.displayName] && <>{slots[Image.displayName]}</>}
          {/* content area */}
          <div className="z-10 relative min-h-[500px] lg:h-[600px] w-full grid grid-cols-1 gap-2 lg:grid-cols-[33%_1fr] lg:gap-4 items-end">
            {/* heading */}
            <div className="shadow-text">
              {slots[Heading.displayName] && (
                <HeadingComponent level={isFirst ? 1 : 2}>
                  {slots[Heading.displayName]}
                  {slots[SubHeading.displayName] && (
                    <span className="block text-5xl font-light hero-text-split-to-lines with-shadow">
                      {slots[SubHeading.displayName]}
                    </span>
                  )}
                </HeadingComponent>
              )}
              {/* text */}
              {slots[Text.displayName] && <div className="">{slots[Text.displayName]}</div>}
            </div>
            {/* extra content like call us */}
            {slots[ExtraContent.displayName] && <>{slots[ExtraContent.displayName]}</>}
          </div>
        </div>
      </Block.CenteredContentArea>
    </Block>
  );
}

Hero.Heading = Heading;
Hero.SubHeading = SubHeading;
Hero.Text = Text;
Hero.ExtraContent = ExtraContent;
Hero.Image = Image;
