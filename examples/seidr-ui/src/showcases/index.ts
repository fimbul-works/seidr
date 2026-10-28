import type { SeidrComponentFactory } from "@fimbul-works/seidr";
import { AlertShowcase } from "./alert.js";
import { BadgeShowcase } from "./badge.js";
import { ButtonShowcase } from "./button.js";
import { CheckboxShowcase } from "./checkbox.js";
import { CollapsibleShowcase } from "./collapsible.js";
import { FormControlShowcase } from "./form-control.js";
import { ImageShowcase } from "./image.js";
import { RadioGroupShowcase } from "./radio-group.js";
import { SeparatorShowcase } from "./separator.js";
import { SkeletonShowcase } from "./skeleton.js";
import { SwitchShowcase } from "./switch.js";
import { ToggleButtonShowcase } from "./toggle-button.js";

export * from "./alert.js";
export * from "./badge.js";
export * from "./button.js";
export * from "./checkbox.js";
export * from "./collapsible.js";
export * from "./form-control.js";
export * from "./image.js";
export * from "./radio-group.js";
export * from "./separator.js";
export * from "./skeleton.js";
export * from "./switch.js";
export * from "./toggle-button.js";

export interface ComponentExample {
  id: string;
  title: string;
  badge: string;
  category: "Atom" | "Compound Atom" | "Widget" | "Form";
  component: SeidrComponentFactory;
}

export const examples: ComponentExample[] = [
  { id: "alert", title: "Alert", badge: "Atom", category: "Atom", component: AlertShowcase },
  { id: "badge", title: "Badge", badge: "Atom", category: "Atom", component: BadgeShowcase },
  { id: "button", title: "Button", badge: "Atom", category: "Atom", component: ButtonShowcase },
  { id: "checkbox", title: "Checkbox", badge: "Form", category: "Form", component: CheckboxShowcase },
  { id: "collapsible", title: "Collapsible", badge: "Widget", category: "Widget", component: CollapsibleShowcase },
  { id: "form-control", title: "FormControl", badge: "Form", category: "Form", component: FormControlShowcase },
  { id: "image", title: "Image", badge: "Compound Atom", category: "Compound Atom", component: ImageShowcase },
  { id: "radio-group", title: "RadioGroup", badge: "Form", category: "Form", component: RadioGroupShowcase },
  { id: "separator", title: "Separator", badge: "Atom", category: "Atom", component: SeparatorShowcase },
  { id: "skeleton", title: "Skeleton", badge: "Atom", category: "Atom", component: SkeletonShowcase },
  { id: "switch", title: "Switch", badge: "Form", category: "Form", component: SwitchShowcase },
  { id: "toggle-button", title: "ToggleButton", badge: "Atom", category: "Atom", component: ToggleButtonShowcase },
];
