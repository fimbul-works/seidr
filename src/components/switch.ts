import { component } from "../component/component.js";
import type { Component, ComponentFactoryFunction } from "../component/types.js";
import { useScope } from "../component/use-scope.js";
import { getLastNode, mountComponent } from "../component/util/index.js";
import { wrapComponent } from "../component/wrap-component.js";
import { isSeidr } from "../index.core.js";
import type { Seidr } from "../seidr/seidr.js";
import { unwrapSeidr } from "../seidr/unwrap-seidr.js";

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
 * @param {string} [name="Switch"] - Optional name for the component
 * @returns {Component} Switch component
 */
export const Switch = <
  K extends string,
  C extends ComponentFactoryFunction<K> | ComponentFactoryFunction =
    | ComponentFactoryFunction<K>
    | ComponentFactoryFunction,
  M extends Map<K, C> | Record<K, C> = Map<K, C> | Record<K, C>,
>(
  observable: Seidr<K>,
  factories: M | Seidr<M>,
  fallbackFactory?: C | null,
  name: string = "Switch",
): Component =>
  component(() => {
    /**
     * Gets the component for the current value of the observable.
     * @returns {Component | undefined} The component for the current value of the observable.
     */
    const getComponent = (): Component | undefined => {
      if (!factories) {
        if (fallbackFactory) {
          return wrapComponent(fallbackFactory as ComponentFactoryFunction<K>, `${name}Fallback`)(
            observable.value,
            switchComponent,
            observable.value,
          );
        }
        return undefined;
      }

      // If factories is an observable, we need to unwrap it to get the current value
      const currentFactories = unwrapSeidr(factories);

      // Look up the current factory
      const factory =
        (currentFactories instanceof Map
          ? currentFactories.get(observable.value)
          : currentFactories[observable.value as keyof M]) || fallbackFactory;

      return factory
        ? wrapComponent(factory as ComponentFactoryFunction<K>, `${name}Branch`)(
            observable.value,
            switchComponent,
            observable.value,
          )
        : undefined;
    };

    const switchComponent = useScope()!;
    let currentBranchComponent = getComponent();

    /**
     * Updates the component based on the new value.
     */
    const update = () => {
      // Resolve anchor point before unmounting
      const lastNode = currentBranchComponent ? getLastNode(currentBranchComponent!) : null;
      const anchor = lastNode?.nextSibling || switchComponent.endMarker || null;
      const parent = lastNode?.parentNode || switchComponent.parentNode;

      // Unmount previous component
      if (currentBranchComponent) {
        currentBranchComponent.unmount();
      }

      currentBranchComponent = getComponent();

      // Mount the current branch, or clear the element if no component is available
      if (currentBranchComponent) {
        switchComponent.addChild(currentBranchComponent);
        switchComponent.element = currentBranchComponent;
        mountComponent(currentBranchComponent, anchor, parent!);
      } else {
        switchComponent.element = undefined;
      }
    };

    switchComponent.element = currentBranchComponent;
    switchComponent.onUnmount(observable.observe(update));
    switchComponent.onUnmount(() => currentBranchComponent?.unmount());

    // If factories is an observable, we also need to update when it changes
    if (isSeidr(factories)) {
      switchComponent.onUnmount(factories.observe(update));
    }

    return currentBranchComponent ? switchComponent.addChild(currentBranchComponent) : undefined;
  }, name)();
