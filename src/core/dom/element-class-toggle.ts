import type { Seidr } from "../seidr";
import { CleanupFunction } from "../types";

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
 *
 * @example
 * Basic reactive class toggling
 * ```typescript
 * import { elementClassToggle, $, Seidr } from '@fimbul-works/seidr';
 *
 * const isActive = new Seidr(false);
 * const button = $('button', { textContent: 'Toggle Me' });
 *
 * // Bind class to observable
 * elementClassToggle(button, 'active', isActive);
 *
 * isActive.value = true; // Adds 'active' class
 * isActive.value = false; // Removes 'active' class
 * ```
 *
 * @example
 * Multiple class bindings
 * ```typescript
 * import { elementClassToggle, $, Seidr } from '@fimbul-works/seidr';
 *
 * const isVisible = new Seidr(true);
 * const hasError = new Seidr(false);
 * const isLoading = new Seidr(false);
 *
 * const element = $('div');
 *
 * // Multiple reactive class bindings
 * elementClassToggle(element, 'visible', isVisible);
 * elementClassToggle(element, 'error', hasError);
 * elementClassToggle(element, 'loading', isLoading);
 * ```
 */
export const elementClassToggle = (element: Element, className: string, active: Seidr<boolean>) =>
  active.bind(element, (active, el) => el.classList.toggle(className, active));
