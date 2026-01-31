import type { Seidr } from "../seidr/seidr";
import type { CleanupFunction } from "../types";

/**
 * Reactively toggles a CSS class on an element based on a boolean observable.
 *
 * Creates a reactive binding between a Seidr boolean and a CSS class.
 * When the observable is true, the class is added; when false, it's removed.
 * The binding is automatically cleaned up when the element is destroyed.
 *
 * @param {Element} element - The DOM element to toggle the class on
 * @param {string} className - The CSS class name to toggle
 * @param {Seidr<boolean>} active - Boolean Seidr that controls the class
 * @returns {CleanupFunction} A cleanup function that removes the binding when called
 */
export const elementClassToggle = (element: Element, className: string, active: Seidr<boolean>): CleanupFunction =>
  active.bind(element, (active, el) => el.classList.toggle(className, active));
