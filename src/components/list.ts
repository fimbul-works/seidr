import { component } from "../component/component";
import { getCurrentComponent } from "../component/component-stack/get-current-component";
import { componentWithId } from "../component/component-with-id";
import { getMarkerComments } from "../component/get-marker-comments";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { getFirstNode, getLastNode, mountComponent } from "../component/util";
import type { Seidr } from "../seidr";
import { isHydrating } from "../ssr/hydrate/storage";
import { isServer } from "../util/environment";

/**
 * Renders an efficient list of components from an observable array.
 * Uses marker nodes to position the list and key-based diffing for minimal DOM updates.
 *
 * @template T - The type of list items
 * @template K - Unique key type
 * @template {ComponentFactoryFunction<T>} C - The type of component factory
 *
 * @param {Seidr<T[]>} observable - Array observable
 * @param {(item: T) => K} getKey - Key extraction function
 * @param {C} factory - Component creation function (raw or wrapped)
 * @returns {Component} List component
 */
export const List = <T extends {}, K, C extends ComponentFactoryFunction<T> = ComponentFactoryFunction<T>>(
  observable: Seidr<T[]>,
  getKey: (item: T) => K,
  factory: C,
  name?: string,
): Component =>
  component(() => {
    const LIST_CHILD_NAME = "ListItem";
    const listComponent = getCurrentComponent()!;
    const componentMap = new Map<K, Component>();

    // Force marker creation as List always needs them for diffing/hydration
    const [, endMarker] = getMarkerComments(listComponent.id)!;

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
        }
      }

      // Add or reorder components by iterating backwards from end marker
      let currentAnchor: Node = endMarker;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let itemComponent = componentMap.get(key);

        if (!itemComponent) {
          itemComponent = componentWithId(key, factory, LIST_CHILD_NAME)(item);
          componentMap.set(key, itemComponent);
        }

        const lastNode = getLastNode(itemComponent);

        if (lastNode !== currentAnchor.previousSibling) {
          mountComponent(itemComponent, currentAnchor);
        }

        currentAnchor = getFirstNode(itemComponent);
      }

      listComponent.element = items.map((item) => componentMap.get(getKey(item))!);
    };

    listComponent.observe(observable, update);
    listComponent.onUnmount(() => {
      componentMap.values().forEach((c) => c.unmount());
      componentMap.clear();
    });

    return observable.value.map((item) => {
      const key = getKey(item);
      const itemComponent = componentWithId(key, factory, LIST_CHILD_NAME)(item);
      componentMap.set(key, itemComponent);

      if (!process.env.CORE_DISABLE_SSR && !isServer() && isHydrating() && endMarker?.parentNode) {
        itemComponent.mount(endMarker.parentNode);
      }

      return itemComponent;
    });
  }, name || "List")();
