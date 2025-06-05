/**
 * Accordion is a component that is used to create an accordion.
 *
 * It accepts only its own slots as children:
 *
 * - Item - A slot for an item of the accordion. Renders an item component. If the Item component is passed as a child for the Accordion component, it will be rendered as an item.
 *
 * - Item has a slot:
 *   - Heading - A slot for a heading of the item. Renders a heading component. Use "level" prop to set the heading level.
 *   - Content - A slot for a content of the item. Renders a content component. If the Content component is passed as a child for the Item component, it will be rendered as a content.
 *
 * Item has props:
 * - heading - The heading of the item.
 * - className - Optional extra classes for customizing the item.
 *
 * Its children are rendered to a Accordion content.
 *
 * @param children - The children of the accordion.
 */
/* eslint-disable react/display-name */
import { Header, Content, Trigger, Root, Item } from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { bgPaletteClassName, borderPaletteClassName, textPaletteClassName, iconPaletteClassName } from "../cssJs/cssJs";
import { ContentBlock } from "./types";

const AccordionTrigger = forwardRef<HTMLButtonElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, forwardedRef) => (
    <Header className="flex">
      <Trigger
        className={cn(
          "p-6 h-16 flex-1 flex items-center justify-between text-xl line-height-1",
          "hover:font-medium",
          textPaletteClassName,
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
        <ChevronDownIcon className={cn("accordion-chevron-animation", "w-6 h-6", iconPaletteClassName)} aria-hidden />
      </Trigger>
    </Header>
  )
);

const AccordionContent = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  ({ children, className, ...props }, forwardedRef) => (
    <Content
      className={cn("accordion-animation-content overflow-hidden px-6 pb-6", textPaletteClassName, className)}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Content>
  )
);

function AccordionItem({
  children,
  className,
  heading,
}: Pick<ContentBlock, "children" | "className"> & { heading: string }) {
  return (
    <Item
      className={cn(
        "mt-1 overflow-hidden first:mt-0 focus-within:z-10 focus-within:relative border-b",
        borderPaletteClassName,
        className
      )}
      value={heading.toLowerCase()}
    >
      <AccordionTrigger>{heading}</AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </Item>
  );
}
AccordionItem.displayName = "Accordion.AccordionItem";

export function Accordion({ children, className }: Pick<ContentBlock, "children" | "className">) {
  return (
    <Root
      className={cn("w-full border-t border-piki", bgPaletteClassName, borderPaletteClassName, className)}
      type="single"
      defaultValue="item-1"
      collapsible
    >
      {children}
    </Root>
  );
}

Accordion.Item = AccordionItem;

/*

export function AccordionDemo() {
  return (
    <Root
      className={cn("w-full border-t border-piki", bgPaletteClassName, borderPaletteClassName)}
      type="single"
      defaultValue="item-1"
      collapsible
    >
      <Item
        className={cn(
          "mt-1 overflow-hidden first:mt-0 focus-within:z-1 focus-within:relative border-b",
          borderPaletteClassName
        )}
        value="item-1"
      >
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </Item>

      <Item className="mt-1 overflow-hidden" value="item-2">
        <AccordionTrigger>Is it unstyled?</AccordionTrigger>
        <AccordionContent>Yes. It's unstyled by default, giving you freedom over the look and feel.</AccordionContent>
      </Item>

      <Item className="mt-1 overflow-hidden" value="item-3">
        <AccordionTrigger>Can it be animated?</AccordionTrigger>
        <Content className="AccordionContent">
          <div className="AccordionContentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
        </Content>
      </Item>
    </Root>
  );
}

*/
