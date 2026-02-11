import { component } from "../component/component";
import type { SeidrComponent, SeidrComponentFactory, SeidrComponentFunction } from "../component/types";
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
 * @param {SeidrComponentFactory<T>} factory - Component creation function (raw or wrapped)
 * @returns {SeidrComponent} List component
 */
export const List = <T, I extends string | number>(
  observable: Seidr<T[]>,
  getKey: (item: T) => I,
  factory: SeidrComponentFunction<T>,
): SeidrComponent =>
  component(() => {
    const scope = useScope();
    const [, endMarker] = getMarkerComments(scope.id);
    const componentMap = new Map<I, SeidrComponent>();

    function update(items: T[]) {
      const parent = endMarker.parentNode;
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
      let currentAnchor: Node = endMarker;

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
            parent.insertBefore(comp.startMarker, currentAnchor);

          if (isArray(el)) {
            el.forEach((n) => isDOMNode(n) && parent.insertBefore(n, currentAnchor));
          } else if (isDOMNode(el)) {
            parent.insertBefore(el, currentAnchor);
          }

          parent.insertBefore(comp.endMarker, currentAnchor);

          comp.scope.attached(parent);
        }

        currentAnchor = comp.startMarker;
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
      const comp = wrapComponent<T>(factory)(item);
      componentMap.set(getKey(item), comp);
      return comp;
    });
  }, "List")();
