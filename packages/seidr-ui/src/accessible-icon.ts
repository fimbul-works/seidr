import { assignProps, type ReactiveValue } from "@fimbul-works/seidr";
import { VisuallyHidden } from "./visually-hidden.js";

/**
 * Creates an accessible SVG icon by adding a label.
 *
 * @param {SVGSVGElement} icon - The SVG element to use as the icon.
 * @param {ReactiveValue<string>} label - The label to use for the icon.
 * @returns {[SVGSVGElement, HTMLSpanElement]} An array containing the SVG element and the label.
 *
 * Ported from https://github.com/radix-ui/primitives/blob/main/packages/react/accessible-icon/src/accessible-icon.tsx
 * MIT License, Copyright (c) WorkOS
 */
export function AccessibleIcon(icon: SVGSVGElement, label: ReactiveValue<string>): [SVGSVGElement, HTMLSpanElement] {
  assignProps<any>(icon as any, {
    ariaHidden: true,
    focusable: false,
  });
  return [icon, VisuallyHidden(label)];
}
