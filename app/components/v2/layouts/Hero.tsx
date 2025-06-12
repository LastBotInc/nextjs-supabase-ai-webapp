import { cn } from "@/lib/utils";
import { HeadingComponent } from "../core/Headings";
import { mapSlots } from "../utils/mapSlots";
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

/**
 * Hero is a component that is used to display a hero section. It uses the MainBlock component to display a hero section and ContentBlock to display the content.
 * It uses slots to render content. The slots are:
 * - Hero.Heading - The heading of the hero section.
 * - Hero.SubHeading - The subheading of the hero section.
 * - Hero.Text - The text of the hero section.
 * - Hero.Image - The image of the hero section.
 * - Hero.ExtraContent - The extra content of the hero section.
 * @param children - The children of the hero section.
 * @param fullWidth - Whether the hero section should be full width. Affects the image position
 * @param rest - Additional props to pass to the MainBlock component.
 * @returns A div element with a hero section.
 */
export function Hero({ children, fullWidth, className, isFirst, ...rest }: Omit<BlockProps, "type">) {
  const slots = mapSlots(children, [
    Heading.displayName,
    SubHeading.displayName,
    Text.displayName,
    Image.displayName,
    ExtraContent.displayName,
  ]);
  const hasImage = !!slots[Image.displayName];
  return (
    <MainBlock className={className} {...rest}>
      {fullWidth && hasImage && slots[Image.displayName]}
      <MainBlock.Content>
        <ContentBlock className={cn(!fullWidth && hasImage && "xl:rounded-xl overflow-hidden")}>
          {!fullWidth && hasImage && slots[Image.displayName]}
          <ContentBlock.Content palette="piki" className="hero-content shadow-text">
            <div className="hero-title">
              {slots[Heading.displayName] && (
                <HeadingComponent level={isFirst ? 1 : 2} medium>
                  {slots[Heading.displayName]}
                  {slots[SubHeading.displayName] && (
                    <span className={cn("hero-subheading with-shadow", "hero-text-prefixed")}>
                      {slots[SubHeading.displayName]}
                    </span>
                  )}
                </HeadingComponent>
              )}
              {/* text */}
              {slots[Text.displayName] && <div className="hero-text">{slots[Text.displayName]}</div>}
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
