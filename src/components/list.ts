import { getAppState } from "../app-state/app-state.js";
import { createComponent } from "../component/create-component.js";
import { getComponentScope } from "../component/lifecycle/component-scope.js";
import { onUnmounted } from "../component/lifecycle/on-unmounted.js";
import type { SeidrComponent } from "../component/types.js";
import { normalizeChildNodes } from "../dom/append-child.js";
import { getMarkerComments } from "../component/util/get-marker-comments.js";
import type { SeidrChild } from "../element/types.js";
import type { Value } from "../observable/value.js";
import { createValue } from "../observable/value.js";

/**
 * Keyed list rendering component.
 * Efficiently reconciles and reorders DOM nodes from a reactive array Value.
 *
 * @template T - List item type
 * @template {string | number} K - Unique key type
 *
 * @param {Value<T[]>} observable - Array observable Value
 * @param {(item: T) => K} getKey - Unique key extractor
 * @param {(itemValue: Value<T>, key: K) => SeidrChild} factory - Item render factory receiving a reactive item Value
 * @param {string} [name="List"] - Component name
 * @returns {SeidrComponent} The List component
 */
export const List = <T, K extends string | number>(
  observable: Value<T[]>,
  getKey: (item: T) => K,
  factory: (itemValue: Value<T>, key: K) => SeidrChild,
  name: string = "List",
): SeidrComponent =>
  createComponent(() => {
    const listComponent = getComponentScope()!;
    const itemMap = new Map<K, { itemValue: Value<T>; nodes: ChildNode[] }>();

    const renderItem = (item: T, key: K) => {
      const itemValue = createValue(item);
      const result = factory(itemValue, key);
      const nodes = normalizeChildNodes(result);
      return { itemValue, nodes };
    };

    const items = observable() ?? [];
    const initialNodes: ChildNode[] = [];
    for (const item of items) {
      const key = getKey(item);
      const entry = renderItem(item, key);
      itemMap.set(key, entry);
      initialNodes.push(...entry.nodes);
    }

    const [startMarker, endMarker] = getMarkerComments(listComponent)!;

    const update = (newItems?: T[]) => {
      if (!Array.isArray(newItems)) {
        return;
      }
      const items = newItems;
      const parent = endMarker.parentNode;
      if (!parent) {
        // Not attached to DOM yet: update itemMap and initialNodes directly
        for (const [key, entry] of Array.from(itemMap.entries())) {
          entry.itemValue.destroy();
          itemMap.delete(key);
        }
        initialNodes.length = 0;
        for (const item of items) {
          const key = getKey(item);
          const entry = renderItem(item, key);
          itemMap.set(key, entry);
          initialNodes.push(...entry.nodes);
        }
        return;
      }

      const newKeys = new Set(items.map(getKey));
      const appState = getAppState();

      // 1. Remove deleted items
      for (const [key, entry] of Array.from(itemMap.entries())) {
        if (!newKeys.has(key)) {
          entry.nodes.forEach((n) => {
            const comp = appState.nodeIndex.get(n);
            if (comp && comp !== listComponent && !comp.nodes.includes(endMarker)) {
              comp.unmount();
            }
            n.remove();
          });
          entry.itemValue.destroy();
          itemMap.delete(key);
        }
      }

      // 2. Insert or reorder items in reverse order before endMarker
      let currentAnchor: Node = endMarker;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let entry = itemMap.get(key);

        if (!entry) {
          entry = renderItem(item, key);
          itemMap.set(key, entry);
        } else {
          entry.itemValue(item);
        }

        const lastNode = entry.nodes[entry.nodes.length - 1];
        if (lastNode && lastNode !== currentAnchor.previousSibling) {
          for (const node of entry.nodes) {
            parent.insertBefore(node, currentAnchor);
          }
        }

        if (entry.nodes.length > 0) {
          currentAnchor = entry.nodes[0];
        }
      }
    };

    const cleanup = observable.watch(update);
    onUnmounted(() => {
      cleanup();
      itemMap.forEach((entry) => entry.itemValue.destroy());
      itemMap.clear();
    });

    return [startMarker, ...initialNodes, endMarker];
  }, name)();
