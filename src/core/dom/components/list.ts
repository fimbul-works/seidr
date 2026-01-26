import type { Seidr } from "../../seidr";
import { uid } from "../../util/uid";
import { component, type SeidrComponent } from "../component";
import { $comment, type SeidrNode } from "../element";
import { useScope } from "../use-scope";
import { wrapComponent } from "../wrap-component";

/**
 * Renders an efficient list of components from an observable array.
 * Uses a marker node to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template {string | number} I - Unique key type
 * @template {SeidrNode} C - The type of SeidrNode for list items
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => I} getKey - Key extraction function
 * @param {(item: T) => C} factory - Component creation function (raw or wrapped)
 * @returns {SeidrComponent<Comment>} List component
 */
export function List<T, I extends string | number, C extends SeidrNode>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => C,
): SeidrComponent<Comment> {
  return component(() => {
    const scope = useScope();
    const marker = $comment(`seidr-list:${uid()}`);
    const componentMap = new Map<I, SeidrComponent>();

    const update = (items: T[]) => {
      const parent = marker.parentNode;
      if (!parent) {
        return;
      }

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
          comp = wrapComponent<typeof item>(factory as any)(item);
          componentMap.set(key, comp);
        }

        // Move to correct position if needed
        if (comp.element.nextSibling !== currentAnchor) {
          const needsAttachment = !comp.element.parentNode;
          parent.insertBefore(comp.element as Node, currentAnchor);

          // Trigger onAttached if component was newly added to DOM
          if (needsAttachment && comp.scope.onAttached) {
            comp.scope.onAttached(parent);
          }
        }

        currentAnchor = comp.element as Node;
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
