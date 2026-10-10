import type { ReactiveValue } from "@fimbul-works/seidr";
import { VisuallyHidden } from "./visually-hidden.js";

/**
 * Creates an accessible SVG icon by adding a label.
 *
 * @param {SVGElement} icon - The SVG element to use as the icon.
 * @param {ReactiveValue<string>} label - The label to use for the icon.
 * @returns {[SVGElement, HTMLSpanElement]} An array containing the SVG element and the label.
 *
 * Ported from https://github.com/radix-ui/primitives/blob/main/packages/react/accessible-icon/src/accessible-icon.tsx
 * MIT License, Copyright (c) WorkOS
 */
export function AccessibleIcon(icon: SVGElement, label: ReactiveValue<string>): [SVGElement, HTMLSpanElement] {
  return [
    Object.assign(icon, {
      // accessibility
      "aria-hidden": "true",
      focusable: "false", // See: https://allyjs.io/tutorials/focusing-in-svg.html#making-svg-elements-focusable
    }),
    VisuallyHidden(label),
  ];
}
