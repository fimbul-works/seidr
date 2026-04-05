import { component } from "../component/component";
import { useScope } from "../component/use-scope";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { getLastNode, mountComponent } from "../component/util";
import { wrapComponent } from "../component/wrap-component";
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
  C extends ComponentFactoryFunction<K> | ComponentFactoryFunction =
    | ComponentFactoryFunction<K>
    | ComponentFactoryFunction,
  M extends Map<K, C> | Record<K, C> = Map<K, C> | Record<K, C>,
>(
  observable: Seidr<K>,
  factories: M,
  fallbackFactory?: C | null,
  name?: string,
): Component =>
  component(() => {
    const SWITCH_CHILD_NAME = "SwitchBranch";

    /**
     * Gets the component for the current value of the observable.
     * @returns {Component | undefined} The component for the current value of the observable.
     */
    const getComponent = (): Component | undefined => {
      if (!factories) {
        if (fallbackFactory) {
          return wrapComponent(fallbackFactory as ComponentFactoryFunction<K>, name)(
            observable.value,
            switchComponent,
            observable.value,
          );
        }
        return undefined;
      }

      const factory =
        (factories instanceof Map ? factories.get(observable.value) : factories[observable.value as keyof M]) ||
        fallbackFactory;
      return factory
        ? wrapComponent(factory as ComponentFactoryFunction<K>, SWITCH_CHILD_NAME)(observable.value, switchComponent, observable.value)
        : undefined;
    };

    const switchComponent = useScope()!;
    let currentBranchComponent = getComponent();

    /**
     * Updates the component based on the new value.
     */
    const update = () => {
      // 1. Resolve anchor point before unmounting
      const lastNode = currentBranchComponent ? getLastNode(currentBranchComponent!) : null;
      const anchor = lastNode?.nextSibling || switchComponent.endMarker || null;
      const parent = lastNode?.parentNode || switchComponent.parentNode;

      // 2. Unmount previous component
      if (currentBranchComponent) {
        currentBranchComponent.unmount();
      }

      currentBranchComponent = getComponent();

      if (currentBranchComponent) {
        switchComponent.addChild(currentBranchComponent);
        switchComponent.element = currentBranchComponent;
        mountComponent(currentBranchComponent, anchor, parent!);
      } else {
        switchComponent.element = undefined;
      }
    };

    switchComponent.onUnmount(observable.observe(update));
    switchComponent.onUnmount(() => currentBranchComponent?.unmount());

    switchComponent.element = currentBranchComponent;
    return currentBranchComponent ? switchComponent.addChild(currentBranchComponent) : undefined;
  }, name || "Switch")();
