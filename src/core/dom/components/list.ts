import type { Seidr } from "../../seidr";
import { uid } from "../../util/uid";
import { component, type SeidrComponent, useScope } from "../component";
import { $comment } from "../element";

/**
 * Renders an efficient list of components from an observable array.
 * Uses a marker node to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template {string | number} I - Unique key type
 * @template {SeidrComponent} C - Component type
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => I} getKey - Key extraction function
 * @param {(item: T) => C} componentFactory - Component creation function
 * @returns {SeidrComponent<Comment>} List component
 */
export function List<T, I extends string | number, C extends SeidrComponent>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  componentFactory: (item: T) => C,
): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-list:${uid()}`);
    const componentMap = new Map<I, C>();

    const update = (items: T[]) => {
      const parent = marker.parentNode;
      if (!parent) return;

      const newKeys = new Set(items.map(getKey));

      // Remove components no longer in list
      for (const [key, comp] of componentMap.entries()) {
        if (!newKeys.has(key)) {
          comp.destroy();
          componentMap.delete(key);
        }
      }

      // Add or reorder components by iterating backwards from marker
      let currentAnchor: Node = marker;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let comp = componentMap.get(key);

        if (!comp) {
          comp = componentFactory(item);
          componentMap.set(key, comp);
        }

        // Move to correct position if needed
        if (comp.element.nextSibling !== currentAnchor) {
          parent.insertBefore(comp.element, currentAnchor);
        }

        currentAnchor = comp.element;
      }
    };

    scope.onAttached = () => {
      update(observable.value);
    };

    scope.track(observable.observe(update));

    // Secondary cleanup tracking for map contents
    scope.track(() => {
      for (const comp of componentMap.values()) {
        comp.destroy();
      }
      componentMap.clear();
    });

    return marker;
  })();
}
