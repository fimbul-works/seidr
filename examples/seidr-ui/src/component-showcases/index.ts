import type { SeidrComponentFactory } from "@fimbul-works/seidr";
import { AccordionShowcase } from "./accordion.js";
import { AlertShowcase } from "./alert.js";
import { BadgeShowcase } from "./badge.js";
import { ButtonShowcase } from "./button.js";
import { CheckboxShowcase } from "./checkbox.js";
import { CollapsibleShowcase } from "./collapsible.js";
import { FormControlShowcase } from "./form-control.js";
import { ImageShowcase } from "./image.js";
import { MeterShowcase } from "./meter.js";
import { ProgressShowcase } from "./progress.js";
import { RadioGroupShowcase } from "./radio-group.js";
import { SeparatorShowcase } from "./separator.js";
import { SkeletonShowcase } from "./skeleton.js";
import { SliderShowcase } from "./slider.js";
import { SwitchShowcase } from "./switch.js";
import { TabsShowcase } from "./tabs.js";
import { TextFieldShowcase } from "./text-field.js";
import { ToggleButtonShowcase } from "./toggle-button.js";
import { ToggleGroupShowcase } from "./toggle-group.js";

export * from "./accordion.js";
export * from "./alert.js";
export * from "./badge.js";
export * from "./button.js";
export * from "./checkbox.js";
export * from "./collapsible.js";
export * from "./form-control.js";
export * from "./image.js";
export * from "./meter.js";
export * from "./progress.js";
export * from "./radio-group.js";
export * from "./separator.js";
export * from "./skeleton.js";
export * from "./slider.js";
export * from "./switch.js";
export * from "./tabs.js";
export * from "./text-field.js";
export * from "./toggle-button.js";
export * from "./toggle-group.js";

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
  { id: "badge", title: "Badge", badge: "Atom", category: "Atom", component: BadgeShowcase },
  { id: "button", title: "Button", badge: "Atom", category: "Atom", component: ButtonShowcase },
  { id: "checkbox", title: "Checkbox", badge: "Form", category: "Form", component: CheckboxShowcase },
  { id: "collapsible", title: "Collapsible", badge: "Widget", category: "Widget", component: CollapsibleShowcase },
  { id: "form-control", title: "FormControl", badge: "Form", category: "Form", component: FormControlShowcase },
  { id: "image", title: "Image", badge: "Compound Atom", category: "Compound Atom", component: ImageShowcase },
  { id: "meter", title: "Meter", badge: "Widget", category: "Widget", component: MeterShowcase },
  { id: "progress", title: "Progress", badge: "Widget", category: "Widget", component: ProgressShowcase },
  { id: "radio-group", title: "RadioGroup", badge: "Form", category: "Form", component: RadioGroupShowcase },
  { id: "separator", title: "Separator", badge: "Atom", category: "Atom", component: SeparatorShowcase },
  { id: "skeleton", title: "Skeleton", badge: "Atom", category: "Atom", component: SkeletonShowcase },
  { id: "slider", title: "Slider", badge: "Form", category: "Form", component: SliderShowcase },
  { id: "switch", title: "Switch", badge: "Form", category: "Form", component: SwitchShowcase },
  { id: "tabs", title: "Tabs", badge: "Widget", category: "Widget", component: TabsShowcase },
  { id: "text-field", title: "TextField", badge: "Form", category: "Form", component: TextFieldShowcase },
  { id: "toggle-button", title: "ToggleButton", badge: "Atom", category: "Atom", component: ToggleButtonShowcase },
  { id: "toggle-group", title: "ToggleGroup", badge: "Widget", category: "Widget", component: ToggleGroupShowcase },
];
