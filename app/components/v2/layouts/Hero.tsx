import { cn } from "@/lib/utils";
import { HeadingComponent } from "../../core/Headings";
import { mapSlots } from "../../core/mapSlots";
import { ContentBlock } from "../blocks/ContentBlock";
import { MainBlock } from "../blocks/MainBlock";
import { BackgroundImageProps } from "../core/BackgroundImage";
import { Block } from "../core/Block";
import { BlockProps, SlotProps } from "../core/types";

function Heading({ children }: SlotProps) {
  return <>{children}</>;
}

function SubHeading({ children }: SlotProps) {
  return <>{children}</>;
}

function Text({ children }: SlotProps) {
  return <>{children}</>;
}

function Image(props: BackgroundImageProps) {
  return <Block.BackgroundImage {...props} />;
}

function ExtraContent({ children }: SlotProps) {
  return <>{children}</>;
}

Heading.displayName = "Hero.Heading";
SubHeading.displayName = "Hero.SubHeading";
Text.displayName = "Hero.Text";
Image.displayName = Block.BackgroundImage.displayName;
ExtraContent.displayName = "Hero.ExtraContent";

export function Hero({ children, fullWidth, isFirst, ...rest }: Omit<BlockProps, "type">) {
  const slots = mapSlots(children, [
    Heading.displayName,
    SubHeading.displayName,
    Text.displayName,
    Image.displayName,
    ExtraContent.displayName,
  ]);
  const hasText = !!slots[Text.displayName];
  const hasImage = !!slots[Image.displayName];
  return (
    <MainBlock {...rest}>
      {fullWidth && hasImage && slots[Image.displayName]}
      <MainBlock.Content>
        <ContentBlock>
          {!fullWidth && hasImage && slots[Image.displayName]}
          <ContentBlock.Content palette="piki" className="hero-content shadow-text">
            <div className="">
              {slots[Heading.displayName] && (
                <HeadingComponent level={isFirst ? 1 : 2} medium>
                  {slots[Heading.displayName]}
                  {slots[SubHeading.displayName] && (
                    <span
                      className={cn(
                        "hero-subheading with-shadow",
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
          </ContentBlock.Content>
        </ContentBlock>
      </MainBlock.Content>
    </MainBlock>
  );
}

Hero.Heading = Heading;
Hero.SubHeading = SubHeading;
Hero.Text = Text;
Hero.ExtraContent = ExtraContent;
Hero.Image = Image;
