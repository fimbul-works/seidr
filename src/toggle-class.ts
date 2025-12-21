import { bind } from "./bind.js";
import type { ObservableValue } from "./value.js";

/**
 * Toggles a CSS class on an element based on a boolean observable.
 *
 * When the observable is true, the class is added to the element.
 * When false, the class is removed. The binding is reactive and updates
 * automatically when the observable changes.
 *
 * @template E - The type of HTML element being bound to
 *
 * @param observable - Boolean ObservableValue that controls the class
 * @param element - The DOM element to toggle the class on
 * @param className - The CSS class name to toggle
 *
 * @returns A cleanup function that removes the binding when called
 */
export function toggleClass<E extends HTMLElement>(
  observable: ObservableValue<boolean>,
  element: E,
  className: string,
) {
  return bind(observable, element, (value, el) => el.classList.toggle(className, value));
}
