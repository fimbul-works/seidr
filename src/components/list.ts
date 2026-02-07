import { component, type SeidrComponent, useScope, wrapComponent } from "../component";
import { getMarkerComments } from "../dom-utils";
import type { SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import { isArr, isDOMNode } from "../util/type-guards";

/**
 * Renders an efficient list of components from an observable array.
 * Uses marker nodes to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template {string | number} I - Unique key type
 * @template {SeidrNode} C - The type of SeidrNode for list items
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => I} getKey - Key extraction function
 * @param {(item: T) => C} factory - Component creation function (raw or wrapped)
 * @returns {SeidrComponent} List component
 */
export function List<T, I extends string | number, C extends SeidrNode>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => C,
): SeidrComponent {
  return component((_props, id) => {
    const scope = useScope();
    const markers = getMarkerComments(id);
    const componentMap = new Map<I, SeidrComponent>();

    function update(items: T[]) {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) return;

      const newKeys = new Set(items.map(getKey));

      // Remove components no longer in list
      for (const [key, comp] of componentMap.entries()) {
        if (!newKeys.has(key)) {
          comp.unmount();
          componentMap.delete(key);
        }
      }

      // Add or reorder components by iterating backwards from end marker
      let currentAnchor: Node = end;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let comp = componentMap.get(key);

        if (!comp) {
          comp = wrapComponent<typeof item>(factory as any)(item);
          componentMap.set(key, comp);
        }

        const el = comp.element;
        const lastNode = isArr(el) ? el[el.length - 1] : el;

        // Move to correct position if needed
        if (lastNode !== currentAnchor.previousSibling) {
          if (comp.start) parent.insertBefore(comp.start, currentAnchor);
          if (isArr(el)) {
            el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, currentAnchor));
          } else if (isDOMNode(el)) {
            parent.insertBefore(el, currentAnchor);
          }
          if (comp.end) parent.insertBefore(comp.end, currentAnchor);

          // Trigger attached (safe to call multiple times)
          comp.scope.attached(parent);
        }

        currentAnchor = (comp.start || (isArr(el) ? el[0] : el)) as Node;
      }
    }

    // Initialize map with initial items and Return them so component() can mount them
    const initial = observable.value.map((item) => {
      const comp = wrapComponent<typeof item>(factory as any)(item);
      componentMap.set(getKey(item), comp);
      return comp;
    });

    // Track future updates
    scope.track(observable.observe(update));

    // Cleanup map contents on list destruction
    scope.track(() => {
      for (const comp of componentMap.values()) {
        comp.unmount();
      }
      componentMap.clear();
    });

    return initial;
  }, "list")();
}
