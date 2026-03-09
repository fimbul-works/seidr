import { component } from "../component/component";
import { getCurrentComponent } from "../component/component-stack";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { getFirstNode, getLastNode, mountComponent } from "../component/util";
import { wrapComponent } from "../component/wrap-component";
import type { Seidr } from "../seidr";
import { getHydrationMap } from "../ssr/hydrate";

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
export const List = <T, K, C extends ComponentFactoryFunction<T> = ComponentFactoryFunction<T>>(
  observable: Seidr<T[]>,
  getKey: (item: T) => K,
  factory: C,
  name?: string,
): Component =>
  component(() => {
    const listComponent = getCurrentComponent()!;
    const componentMap = new Map<K, Component>();

    const update = (items: T[]) => {
      const realEndMarker =
        (!process.env.CORE_DISABLE_SSR && getHydrationMap().get(listComponent.endMarker!)) || listComponent.endMarker;
      const parent = realEndMarker?.parentNode;
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
      let currentAnchor: Node = realEndMarker;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const key = getKey(item);
        let itemComponent = componentMap.get(key);

        if (!itemComponent) {
          itemComponent = wrapComponent<T>(factory)(item);
          componentMap.set(key, itemComponent);
        }

        let lastNode = getLastNode(itemComponent);
        if (!process.env.CORE_DISABLE_SSR) {
          lastNode = getHydrationMap().get(lastNode) || lastNode;
        }

        if (lastNode !== currentAnchor.previousSibling) {
          mountComponent(itemComponent, currentAnchor);
        }

        currentAnchor = getFirstNode(itemComponent);
        if (!process.env.CORE_DISABLE_SSR) {
          currentAnchor = getHydrationMap().get(currentAnchor) || currentAnchor;
        }
      }

      listComponent.element = items.map((item) => componentMap.get(getKey(item))!);
    };

    listComponent.observe(observable, update);
    listComponent.onUnmount(() => {
      componentMap.values().forEach((c) => c.unmount());
      componentMap.clear();
    });

    return observable.value.map((item) => {
      const itemComponent = wrapComponent<T>(factory)(item);
      componentMap.set(getKey(item), itemComponent);

      return itemComponent;
    });
  }, name ?? "List")();
