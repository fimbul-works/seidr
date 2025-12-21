import type { Seidr } from "./seidr.js";

/**
 * Toggles a CSS class on an element based on a boolean observable.
 *
 * When the observable is true, the class is added to the element.
 * When false, the class is removed. The binding is reactive and updates
 * automatically when the observable changes.
 *
 * @template E - The type of HTML element being bound to
 *
 * @param observable - Boolean Seidr that controls the class
 * @param element - The DOM element to toggle the class on
 * @param className - The CSS class name to toggle
 *
 * @returns A cleanup function that removes the binding when called
 */
export function toggleClass<E extends HTMLElement>(observable: Seidr<boolean>, element: E, className: string) {
  return observable.bind(element, (value, el) => el.classList.toggle(className, value));
}
