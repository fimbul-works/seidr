import { ObservableValue } from "@fimbul-works/observable";

/**
 * A computed observable value that automatically cleans up its dependencies.
 *
 * Call destroy() when the computed value is no longer needed to prevent memory leaks.
 */
export class ComputedValue<T> extends ObservableValue<T> {
  private cleanups: (() => void)[] = [];

  /**
   * Adds a cleanup function to be called when destroy() is invoked
   */
  addCleanup(cleanup: () => void) {
    this.cleanups.push(cleanup);
  }

  /**
   * Removes all dependency subscriptions and cleans up resources
   */
  destroy() {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
  }
}

/**
 * Creates a reactive binding between an ObservableValue and a DOM element.
 *
 * The renderer function is called immediately with the current value, and then
 * automatically called whenever the observable changes. Returns a cleanup function
 * that removes the binding when called.
 *
 * @template T - The type of value stored in the observable
 * @template E - The type of HTML element being bound to
 *
 * @param observable - The ObservableValue to bind to the element
 * @param element - The DOM element to apply changes to
 * @param renderer - Function that applies the observable's value to the element
 *
 * @returns A cleanup function that removes the binding when called
 */
export function bind<T, E extends HTMLElement>(
  observable: ObservableValue<T>,
  element: E,
  renderer: (value: T, el: E) => void,
) {
  renderer(observable.get(), element);
  return observable.onChange((value) => renderer(value, element));
}

/**
 * Creates a computed observable value that automatically updates when its dependencies change.
 *
 * The compute function is called immediately and whenever any dependency changes.
 * Returns a new ComputedValue that can be used like any other observable.
 *
 * @template T - The return type of the computed value
 *
 * @param compute - Function that computes the derived value
 * @param dependencies - Array of ObservableValues that trigger recomputation when changed
 *
 * @returns A new ComputedValue containing the computed result
 */
export function computed<T>(compute: () => T, dependencies: ObservableValue<unknown>[]): ComputedValue<T> {
  if (dependencies.length === 0) {
    console.warn("Computed value with zero dependencies");
  }

  const computed = new ComputedValue<T>(compute());
  dependencies.forEach((dep) => computed.addCleanup(dep.onChange(() => computed.set(compute()))));
  return computed;
}

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
 * @param invert - Invert the boolean comparison
 *
 * @returns A cleanup function that removes the binding when called
 */
export function toggleClass<E extends HTMLElement>(
  observable: ObservableValue<boolean>,
  element: E,
  className: string,
  invert = false,
) {
  return bind(observable, element, (value, el) => el.classList.toggle(className, invert ? !value : value));
}
