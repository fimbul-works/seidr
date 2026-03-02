import { component } from "../component/component";
import { getMarkerComments } from "../component/get-marker-comments";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { useScope } from "../component/use-scope";
import { getComponent, getLastNode, mountComponent } from "../component/util";
import type { Seidr } from "../seidr";

/**
 * Switches between different components based on an observable value.
 *
 * @template {string} K - The type of the observable value
 * @template {ComponentFactoryFunction<K>} C - The type of component factory
 * @template {Map<K, C> | Record<K, C>} M - The type of the factories map or object
 *
 * @param {Seidr<K>} observable - Observable value to switch on
 * @param {M} factories - Map or object of cases to component factories (raw or wrapped)
 * @param {C | null | undefined} [fallbackFactory] - Optional fallback component factory
 * @returns {Component} Switch component
 */
export const Switch = <
  K extends string,
  C extends ComponentFactoryFunction<K> = ComponentFactoryFunction<K>,
  M extends Map<K, C> | Record<K, C> = Map<K, C> | Record<K, C>,
>(
  observable: Seidr<K>,
  factories: M,
  fallbackFactory?: C | null,
  name?: string,
): Component =>
  component(() => {
    const scope = useScope();
    const [, endMarker] = getMarkerComments(scope.id);

    let currentComponent: Component | undefined = getComponent(factories, observable.value, fallbackFactory);

    /**
     * Updates the component based on the new value.
     *
     * @param {K} value - The new value to update the component with.
     */
    const update = (value: K) => {
      // 1. Resolve anchor point before unmounting
      const lastNode = currentComponent ? getLastNode(currentComponent!) : null;
      const anchor = lastNode?.nextSibling || endMarker;
      const parent = lastNode?.parentNode || endMarker?.parentNode || scope.parentNode;

      // 2. Unmount previous component
      if (currentComponent) {
        currentComponent.unmount();
        currentComponent = undefined;
      }

      currentComponent = getComponent(factories, value, fallbackFactory);
      if (currentComponent) {
        scope.child(currentComponent);
        mountComponent(currentComponent, anchor, parent!);
      }
    };

    // Use scope.observe to ensure updates happen in the component's context
    scope.observe(observable, update);
    scope.onUnmount(() => currentComponent?.unmount());

    return currentComponent ? scope.child(currentComponent) : undefined;
  }, name ?? "Switch")();
