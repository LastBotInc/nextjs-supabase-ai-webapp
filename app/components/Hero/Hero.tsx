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

/**
 * Hero is a component that is used to display a hero section with a background image and a content area.
 *
 * It's output is restricted with slots and heading area is always tight to the bottom of the hero section.
 * If Here.Text exists, the Heading and Text area are wider and the extra content is aligned to the bottom of the hero section.
 * It has slots:
 * - Heading - A slot for a heading of the hero. Rendered as Heading1 or Heading2 depending on the isFirst prop.
 * - SubHeading - A slot for a subheading of the hero.
 * - Text - A slot for a text of the hero.
 * - Image - A slot for a background image of the hero. It is rendered as a BackgroundImage component.
 * - ExtraContent - A slot for extra content of the hero.
 * @param fullWidth - If true, the hero will be full width.
 * @param useMinHeight - If true, the hero will set the standard height of the hero section. Applied also if there is no text in the hero.
 * @returns React.ReactNode
 */
export function Hero({
  children,
  palette = "default",
  isFirst = false,
  fullWidth = false,
  useMinHeight = false,
}: ContentBlock & { useMinHeight?: boolean }) {
  const slots = mapSlots(children, [
    Heading.displayName,
    SubHeading.displayName,
    Text.displayName,
    Image.displayName,
    ExtraContent.displayName,
  ]);

  const classes = "z-10 relative  w-full grid grid-cols-1 gap-2 lg:gap-4 items-end";

  const ContainerWithoutText = ({ children }: { children: ReactNode }) => {
    return <div className={cn(classes, "min-h-[500px] lg:h-[600px] lg:grid-cols-[33%_1fr]")}>{children}</div>;
  };
  const ContainerWithText = ({ children }: { children: ReactNode }) => {
    return <div className={cn(classes, "pt-20", useMinHeight ? "min-h-[500px] lg:h-[600px]" : "")}>{children}</div>;
  };

  const hasText = !!slots[Text.displayName];

  const Container = hasText ? ContainerWithText : ContainerWithoutText;
  return (
    <Block>
      {fullWidth && slots[Image.displayName] && <Block.FullWidthBackgroundImage {...slots[Image.displayName].props} />}
      <Block.CenteredContentArea>
        <div
          className={cn(
            "relative xl:rounded-lg overflow-hidden",
            getCssProp("blockContentArea", fullWidth ? "paddingInline" : "padding"),
            `color-palette-${palette}`
          )}
        >
          {/* bg image */}
          {!fullWidth && slots[Image.displayName] && <>{slots[Image.displayName]}</>}
          {/* content area */}
          <Container>
            {/* heading */}
            <div className="shadow-text">
              {slots[Heading.displayName] && (
                <HeadingComponent level={isFirst ? 1 : 2} medium>
                  {slots[Heading.displayName]}
                  {slots[SubHeading.displayName] && (
                    <span
                      className={cn(
                        "block text-5xl font-light with-shadow",
                        hasText ? "hero-text-prefixed" : "hero-text-split-to-lines"
                      )}
                    >
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
          </Container>
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
