import type { SeidrComponentFactory } from "@fimbul-works/seidr";
import { AccordionShowcase } from "./accordion.js";
import { AlertShowcase } from "./alert.js";
import { AlertDialogShowcase } from "./alert-dialog.js";
import { BadgeShowcase } from "./badge.js";
import { ButtonShowcase } from "./button.js";
import { CheckboxShowcase } from "./checkbox.js";
import { CollapsibleShowcase } from "./collapsible.js";
import { ComboboxShowcase } from "./combobox.js";
import { ContextMenuShowcase } from "./context-menu.js";
import { DialogShowcase } from "./dialog.js";
import { DropdownMenuShowcase } from "./dropdown-menu.js";
import { FileFieldShowcase } from "./file-field.js";
import { FormControlShowcase } from "./form-control.js";
import { HoverCardShowcase } from "./hover-card.js";
import { ImageShowcase } from "./image.js";
import { ListboxShowcase } from "./listbox.js";
import { MenuShowcase } from "./menu.js";
import { MenubarShowcase } from "./menubar.js";
import { MeterShowcase } from "./meter.js";
import { NavigationMenuShowcase } from "./navigation-menu.js";
import { NumberFieldShowcase } from "./number-field.js";
import { PaginationShowcase } from "./pagination.js";
import { PopoverShowcase } from "./popover.js";
import { PopperShowcase } from "./popper.js";
import { ProgressShowcase } from "./progress.js";
import { RadioGroupShowcase } from "./radio-group.js";
import { RatingShowcase } from "./rating.js";
import { SearchShowcase } from "./search.js";
import { SegmentedControlShowcase } from "./segmented-control.js";
import { SelectShowcase } from "./select.js";
import { SeparatorShowcase } from "./separator.js";
import { SkeletonShowcase } from "./skeleton.js";
import { SliderShowcase } from "./slider.js";
import { SpinButtonShowcase } from "./spin-button.js";
import { SwitchShowcase } from "./switch.js";
import { TabsShowcase } from "./tabs.js";
import { TextFieldShowcase } from "./text-field.js";
import { TimeFieldShowcase } from "./time-field.js";
import { ToastShowcase } from "./toast.js";
import { ToggleButtonShowcase } from "./toggle-button.js";
import { ToggleGroupShowcase } from "./toggle-group.js";
import { TooltipShowcase } from "./tooltip.js";

export * from "./accordion.js";
export * from "./alert.js";
export * from "./alert-dialog.js";
export * from "./badge.js";
export * from "./button.js";
export * from "./checkbox.js";
export * from "./collapsible.js";
export * from "./combobox.js";
export * from "./context-menu.js";
export * from "./dialog.js";
export * from "./dropdown-menu.js";
export * from "./file-field.js";
export * from "./form-control.js";
export * from "./hover-card.js";
export * from "./image.js";
export * from "./listbox.js";
export * from "./menu.js";
export * from "./menubar.js";
export * from "./meter.js";
export * from "./navigation-menu.js";
export * from "./number-field.js";
export * from "./pagination.js";
export * from "./popover.js";
export * from "./popper.js";
export * from "./progress.js";
export * from "./radio-group.js";
export * from "./rating.js";
export * from "./search.js";
export * from "./segmented-control.js";
export * from "./select.js";
export * from "./separator.js";
export * from "./skeleton.js";
export * from "./slider.js";
export * from "./spin-button.js";
export * from "./switch.js";
export * from "./tabs.js";
export * from "./text-field.js";
export * from "./time-field.js";
export * from "./toast.js";
export * from "./toggle-button.js";
export * from "./toggle-group.js";
export * from "./tooltip.js";

export interface ComponentShowcase {
  id: string;
  title: string;
  badge: string;
  category: "Atom" | "Compound Atom" | "Widget" | "Form";
  component: SeidrComponentFactory;
}

export const componentShowcases: ComponentShowcase[] = [
  { id: "accordion", title: "Accordion", badge: "Widget", category: "Widget", component: AccordionShowcase },
  { id: "alert", title: "Alert", badge: "Atom", category: "Atom", component: AlertShowcase },
  { id: "alert-dialog", title: "AlertDialog", badge: "Widget", category: "Widget", component: AlertDialogShowcase },
  { id: "badge", title: "Badge", badge: "Atom", category: "Atom", component: BadgeShowcase },
  { id: "button", title: "Button", badge: "Atom", category: "Atom", component: ButtonShowcase },
  { id: "checkbox", title: "Checkbox", badge: "Form", category: "Form", component: CheckboxShowcase },
  { id: "collapsible", title: "Collapsible", badge: "Widget", category: "Widget", component: CollapsibleShowcase },
  { id: "combobox", title: "Combobox", badge: "Form", category: "Form", component: ComboboxShowcase },
  { id: "context-menu", title: "ContextMenu", badge: "Widget", category: "Widget", component: ContextMenuShowcase },
  { id: "dialog", title: "Dialog", badge: "Widget", category: "Widget", component: DialogShowcase },
  { id: "dropdown-menu", title: "DropdownMenu", badge: "Widget", category: "Widget", component: DropdownMenuShowcase },
  { id: "file-field", title: "FileField", badge: "Form", category: "Form", component: FileFieldShowcase },
  { id: "form-control", title: "FormControl", badge: "Form", category: "Form", component: FormControlShowcase },
  { id: "hover-card", title: "HoverCard", badge: "Widget", category: "Widget", component: HoverCardShowcase },
  { id: "image", title: "Image", badge: "Compound Atom", category: "Compound Atom", component: ImageShowcase },
  { id: "listbox", title: "Listbox", badge: "Widget", category: "Widget", component: ListboxShowcase },
  { id: "menu", title: "Menu", badge: "Widget", category: "Widget", component: MenuShowcase },
  { id: "menubar", title: "Menubar", badge: "Widget", category: "Widget", component: MenubarShowcase },
  { id: "meter", title: "Meter", badge: "Widget", category: "Widget", component: MeterShowcase },
  { id: "navigation-menu", title: "NavigationMenu", badge: "Widget", category: "Widget", component: NavigationMenuShowcase },
  { id: "number-field", title: "NumberField", badge: "Form", category: "Form", component: NumberFieldShowcase },
  { id: "pagination", title: "Pagination", badge: "Widget", category: "Widget", component: PaginationShowcase },
  { id: "popover", title: "Popover", badge: "Widget", category: "Widget", component: PopoverShowcase },
  { id: "popper", title: "Popper", badge: "Foundation", category: "Widget", component: PopperShowcase },
  { id: "progress", title: "Progress", badge: "Widget", category: "Widget", component: ProgressShowcase },
  { id: "radio-group", title: "RadioGroup", badge: "Form", category: "Form", component: RadioGroupShowcase },
  { id: "rating", title: "Rating", badge: "Form", category: "Form", component: RatingShowcase },
  { id: "search", title: "Search", badge: "Form", category: "Form", component: SearchShowcase },
  {
    id: "segmented-control",
    title: "SegmentedControl",
    badge: "Widget",
    category: "Widget",
    component: SegmentedControlShowcase,
  },
  { id: "select", title: "Select", badge: "Form", category: "Form", component: SelectShowcase },
  { id: "separator", title: "Separator", badge: "Atom", category: "Atom", component: SeparatorShowcase },
  { id: "skeleton", title: "Skeleton", badge: "Atom", category: "Atom", component: SkeletonShowcase },
  { id: "slider", title: "Slider", badge: "Form", category: "Form", component: SliderShowcase },
  { id: "spin-button", title: "SpinButton", badge: "Atom", category: "Atom", component: SpinButtonShowcase },
  { id: "switch", title: "Switch", badge: "Form", category: "Form", component: SwitchShowcase },
  { id: "tabs", title: "Tabs", badge: "Widget", category: "Widget", component: TabsShowcase },
  { id: "text-field", title: "TextField", badge: "Form", category: "Form", component: TextFieldShowcase },
  { id: "time-field", title: "TimeField", badge: "Form", category: "Form", component: TimeFieldShowcase },
  { id: "toast", title: "Toast", badge: "Widget", category: "Widget", component: ToastShowcase },
  { id: "toggle-button", title: "ToggleButton", badge: "Atom", category: "Atom", component: ToggleButtonShowcase },
  { id: "toggle-group", title: "ToggleGroup", badge: "Widget", category: "Widget", component: ToggleGroupShowcase },
  { id: "tooltip", title: "Tooltip", badge: "Widget", category: "Widget", component: TooltipShowcase },
];
