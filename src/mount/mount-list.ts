import { type SeidrComponent, wrapComponent } from "../component";
import { $fragment, type SeidrElement, type SeidrFragment, type SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";
import { uid } from "../util/uid";

/**
 * Renders an efficient list of components from an observable array.
 *
 * mountList provides optimized list rendering with key-based diffing, ensuring
 * minimal DOM operations when the list changes. Components are reused when
 * possible, and only the necessary additions, removals, and reordering occur.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {any} T - The type of list items
 * @template {string | number} I - The type of unique item keys (string or number)
 * @template {SeidrNode} C - The type of SeidrNode for list items
 *
 * @param {Seidr<T[]>} observable - Array observable containing the list data
 * @param {(item: T) => I} getKey - Function to extract unique keys from list items
 * @param {(item: T) => C} factory - Function that creates components for individual items
 * @param {HTMLElement | SeidrElement} container - The DOM container for the list
 * @returns {CleanupFunction} A cleanup function that removes all components and reactive bindings
 */
export function mountList<T, I extends string | number, C extends SeidrNode>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => C,
  container: HTMLElement | SeidrElement,
): CleanupFunction {
  const fragment = $fragment([], `mount-list:${uid()}`);
  if ("appendChild" in container) {
    fragment.appendTo(container as any);
  }
  const componentMap = new Map<I, SeidrComponent>();

  const update = (items: T[]) => {
    const newKeys = new Set(items.map(getKey));

    // Remove components no longer in list
    for (const [key, comp] of componentMap.entries()) {
      if (!newKeys.has(key)) {
        comp.destroy();
        componentMap.delete(key);
      }
    }

    // Add or reorder components by iterating backwards from end marker
    let currentAnchor: Node = fragment.end;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const key = getKey(item);
      let comp = componentMap.get(key);

      if (!comp) {
        comp = wrapComponent<typeof item>(factory as any)(item);
        componentMap.set(key, comp as SeidrComponent);
      }

      // Move to correct position if needed
      if ((comp as SeidrComponent).element.nextSibling !== currentAnchor) {
        const needsAttachment = !(comp as any).element.parentNode;

        fragment.insertBefore((comp as SeidrComponent).element as any, currentAnchor);

        // Trigger onAttached if component was newly added to DOM
        if (needsAttachment && comp.scope.onAttached) {
          comp.scope.onAttached(container as any);
        }
      }

      currentAnchor = (comp as SeidrComponent).element;
    }
  };

  // Initial render
  update(observable.value);

  // Reactive updates
  const cleanup = observable.observe((items) => update(items));

  // Return combined cleanup
  return () => {
    cleanup();
    for (const comp of componentMap.values()) {
      comp.destroy();
    }
    componentMap.clear();
    fragment.remove();
  };
}
