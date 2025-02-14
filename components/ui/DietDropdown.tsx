"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for DietDropdown
 */
interface DietDropdownProps {
  label?: string;                 // e.g. "Veg / Non Veg"
  dietOptions?: string[];         // e.g. ["veg", "non-veg", "both"]
  selectedDiet: string;           // which value is currently selected
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

/**
 * Default diet options if none are passed in
 */
const defaultDietOptions = ["veg", "non-veg", "both"];

// Radix Select re-exports
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectItemIndicator = SelectPrimitive.ItemIndicator;
const SelectTrigger = SelectPrimitive.Trigger;
const SelectContent = SelectPrimitive.Content;
const SelectViewport = SelectPrimitive.Viewport;
const SelectItem = SelectPrimitive.Item;
const SelectItemText = SelectPrimitive.ItemText;
const SelectPortal = SelectPrimitive.Portal;

/**
 * Basic styling for the trigger
 */
const CustomSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, children, disabled, ...props }, ref) => (
  <SelectTrigger
    ref={ref}
    disabled={disabled}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectTrigger>
));
CustomSelectTrigger.displayName = SelectTrigger.displayName;

/**
 * Basic styling for the content (dropdown panel)
 */
const CustomSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, position = "popper", children, ...props }, ref) => (
  <SelectPortal>
    <SelectContent
      ref={ref}
      side="bottom"
      position={position}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        position === "popper" && "data-[side=bottom]:translate-y-1",
        className
      )}
      {...props}
    >
      <SelectViewport className="p-1">{children}</SelectViewport>
    </SelectContent>
  </SelectPortal>
));
CustomSelectContent.displayName = SelectContent.displayName;

/**
 * Basic styling for each selectable item
 */
const CustomSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, children, ...props }, ref) => (
  <SelectItem
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-accent focus:text-accent-foreground",
      "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    {/* Check icon when selected */}
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check className="h-4 w-4" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>{children}</SelectItemText>
  </SelectItem>
));
CustomSelectItem.displayName = SelectItem.displayName;

/**
 * DietDropdown component
 */
export default function DietDropdown({
  label = "Veg / Non Veg",
  dietOptions = defaultDietOptions,
  selectedDiet,
  onChange,
  disabled = false,
}: DietDropdownProps) {
  return (
    <div className="w-full max-w-md">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      <Select value={selectedDiet} onValueChange={onChange} disabled={disabled}>
        <CustomSelectTrigger>
          <SelectValue placeholder="Select diet type..." />
        </CustomSelectTrigger>
        <CustomSelectContent side="bottom" className="min-w-[224px]">
          <SelectGroup>
            {dietOptions.map((diet) => (
              <CustomSelectItem key={diet} value={diet}>
                {diet}
              </CustomSelectItem>
            ))}
          </SelectGroup>
        </CustomSelectContent>
      </Select>
    </div>
  );
}
