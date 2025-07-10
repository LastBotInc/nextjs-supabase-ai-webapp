"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

// Root component
const RadioGroupRoot = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("flex flex-col gap-2", className)} {...props} />
));
RadioGroupRoot.displayName = "RadioGroupRoot";

// Item component
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "h-5 w-5 rounded-full border border-slate-300 bg-white text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center transition-colors",
      "data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-100",
      className
    )}
    {...props}
  />
));
RadioGroupItem.displayName = "RadioGroupItem";

// Indicator component
const RadioGroupIndicator = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Indicator ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
    <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
  </RadioGroupPrimitive.Indicator>
));
RadioGroupIndicator.displayName = "RadioGroupIndicator";

// Prebuilt density radio group matching the requested structure
interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function RadioGroupOption({ value, label, id, ...rest }: { value: string; label: string; id?: string }) {
  const componentId = id || encodeURIComponent(label).replace(/[^a-zA-Z0-9]/g, "-");
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <RadioGroupItem value={value} id={componentId} {...rest}>
        <RadioGroupIndicator />
      </RadioGroupItem>
      <label className="px-4" htmlFor={componentId}>
        {label}
      </label>
    </div>
  );
}

export function RadioGroup({ value, onValueChange, className, children }: RadioGroupProps) {
  // Listen for bubbling click events

  // Add data-radio-value to each RadioOption/RadioGroupItem
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      ...child.props,
      checked: value === child.props.value,
      onClick: () => {
        if (child.props.value) {
          onValueChange(child.props.value);
        }
      },
    });
  });

  return (
    <RadioGroupRoot className={cn(className)} value={value} aria-label="View density">
      {enhancedChildren}
    </RadioGroupRoot>
  );
}
