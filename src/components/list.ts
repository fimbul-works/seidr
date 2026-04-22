import { component } from "../component/component.js";
import { getMarkerComments } from "../component/get-marker-comments.js";
import type { Component, ComponentFactoryFunction } from "../component/types.js";
import { useScope } from "../component/use-scope.js";
import { getFirstNode, getLastNode, mountComponent } from "../component/util/index.js";
import { wrapComponent } from "../component/wrap-component.js";
import { Seidr } from "../seidr/seidr.js";

/**
 * Renders an efficient list of components from an observable array.
 * Uses marker nodes to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template K - Unique key type
 * @template {ComponentFactoryFunction<Seidr<T>>} C - The type of component factory
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => K} getKey - Key extraction function
 * @param {C} factory - Component creation function (raw or wrapped)
 * @param {string} [name="List"] - Optional name for the component
 * @returns {Component} List component
 */
export const List = <
  T,
  K extends string | number,
  C extends ComponentFactoryFunction<Seidr<T>> = ComponentFactoryFunction<Seidr<T>>,
>(
  observable: Seidr<T[]>,
  getKey: (item: T) => K,
  factory: C,
  name: string = "List",
): Component =>
  component(() => {
    const LIST_CHILD_NAME = `${name}Item`;
    const listComponent = useScope()!;
    const componentMap = new Map<K, Component>();
    const seidrMap = new Map<K, Seidr<T>>();

    // Force marker creation as List always needs them for diffing/hydration
    const [, endMarker] = getMarkerComments(listComponent.id)!;

    const getSeidrId = (key: K) => `${listComponent.id}-${key}`;

    /**
     * Updates the list with the new items.
     * @param {T[]} items - The new items to render
     */
    const update = (items: T[]) => {
      const parent = endMarker?.parentNode;
      if (!parent) {
        return;
      }

      const newKeys = new Set(items.map(getKey));

      // Remove components no longer in list
      for (const [key, comp] of componentMap.entries()) {
        if (!newKeys.has(key)) {
          comp.unmount();
          componentMap.delete(key);
          seidrMap.delete(key);
        }
      }

      // Add or reorder components by iterating backwards from end marker
      let currentAnchor: Node = endMarker;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let itemComponent = componentMap.get(key);

        if (!itemComponent) {
          const itemSeidr = new Seidr(item, { id: getSeidrId(key), hydrate: false });
          itemSeidr.value = item; // Ensure latest data if reused from cache
          itemComponent = wrapComponent(factory, LIST_CHILD_NAME)(itemSeidr, listComponent, key);
          componentMap.set(key, itemComponent);
          seidrMap.set(key, itemSeidr);
        } else {
          seidrMap.get(key)!.value = item;
        }

        const lastNode = getLastNode(itemComponent);

        if (lastNode !== currentAnchor.previousSibling) {
          mountComponent(itemComponent, currentAnchor);
        }

        currentAnchor = getFirstNode(itemComponent);
      }

      listComponent.element = items.map((item) => componentMap.get(getKey(item))!);
    };

    listComponent.onMount(() => update(observable.value));

    listComponent.onUnmount(observable.observe(update));
    listComponent.onUnmount(() => {
      componentMap.values().forEach((c) => c.unmount());
      componentMap.clear();
      seidrMap.clear();
    });

    return observable.value.map((item) => {
      const key = getKey(item);
      const itemSeidr = new Seidr(item, { id: getSeidrId(key), hydrate: false });
      itemSeidr.value = item;
      const itemComponent = wrapComponent(factory, LIST_CHILD_NAME)(itemSeidr as any, listComponent, key);
      componentMap.set(key, itemComponent);
      seidrMap.set(key, itemSeidr);
      return itemComponent;
    });
  }, name)();
