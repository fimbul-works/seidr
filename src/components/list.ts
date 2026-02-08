import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentChildren, SeidrComponentFactory } from "../component/types";
import { useScope } from "../component/use-scope";
import { wrapComponent } from "../component/wrap-component";
import { getMarkerComments } from "../dom/get-marker-comments";
import type { Seidr } from "../seidr";
import { isDOMNode } from "../util/type-guards/dom-node-types";
import { isArray } from "../util/type-guards/primitive-types";

/**
 * Renders an efficient list of components from an observable array.
 * Uses marker nodes to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template {string | number} I - Unique key type
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => I} getKey - Key extraction function
 * @param {(item: T) => SeidrComponentChildren} factory - Component creation function (raw or wrapped)
 * @returns {SeidrComponent} List component
 */
export function List<T, I extends string | number>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: (item: T) => SeidrComponentChildren,
): SeidrComponent {
  return component(() => {
    const scope = useScope();
    const markers = getMarkerComments(scope.id);
    const componentMap = new Map<I, SeidrComponent>();

    function update(items: T[]) {
      const end = markers[1];
      const parent = end.parentNode;
      if (!parent) {
        return;
      }

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
          comp = wrapComponent<T>(factory as SeidrComponentFactory<T>)(item);
          componentMap.set(key, comp);
        }

        const el = comp.element;
        const lastNode = isArray(el) ? el[el.length - 1] : el;

        // Move to correct position if needed
        if (lastNode !== currentAnchor.previousSibling) {
          if (comp.start) {
            parent.insertBefore(comp.start, currentAnchor);
          }

          if (isArray(el)) {
            el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, currentAnchor));
          } else if (isDOMNode(el)) {
            parent.insertBefore(el, currentAnchor);
          }

          if (comp.end) {
            parent.insertBefore(comp.end, currentAnchor);
          }

          comp.scope.attached(parent);
        }

        currentAnchor = (comp.start || (isArray(el) ? el[0] : el)) as Node;
      }
    }

    scope.track(observable.observe(update));
    scope.track(() => {
      for (const comp of componentMap.values()) {
        comp.unmount();
      }
      componentMap.clear();
    });

    return observable.value.map((item) => {
      const comp = wrapComponent<T>(factory as SeidrComponentFactory<T>)(item);
      componentMap.set(getKey(item), comp);
      return comp;
    });
  }, "List")();
}
