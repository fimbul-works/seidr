import { component } from "../component/component";
import { setNextComponentId } from "../component/component-id";
import { getCurrentComponent } from "../component/component-stack";
import type { Component, ComponentFactoryFunction } from "../component/types";
import { getComponent, getLastNode, mountComponent } from "../component/util";
import type { Seidr } from "../seidr";

const SWITCH_CHILD_NAME = "SwitchBranch";

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
    const switchComponent = getCurrentComponent()!;
    let currentComponent: Component | undefined;

    // Initial evaluation
    setNextComponentId(observable.value);
    currentComponent = getComponent<K, C, M>(factories, observable.value, fallbackFactory, SWITCH_CHILD_NAME);

    /**
     * Updates the component based on the new value.
     *
     * @param {K} value - The new value to update the component with.
     */
    const update = (value: K) => {
      // 1. Resolve anchor point before unmounting
      const lastNode = currentComponent ? getLastNode(currentComponent!) : null;
      const anchor = lastNode?.nextSibling || switchComponent.endMarker || null;
      const parent = lastNode?.parentNode || switchComponent.parentNode;

      // 2. Unmount previous component
      if (currentComponent) {
        currentComponent.unmount();
      }

      setNextComponentId(value);
      currentComponent = getComponent(factories, value, fallbackFactory, SWITCH_CHILD_NAME);

      if (currentComponent) {
        switchComponent.addChild(currentComponent);
        switchComponent.element = currentComponent;
        mountComponent(currentComponent, anchor, parent!);
      } else {
        switchComponent.element = undefined;
      }
    };

    // Use scope.observe to ensure updates happen in the component's context
    switchComponent.observe(observable, update);
    switchComponent.onUnmount(() => currentComponent?.unmount());

    switchComponent.element = currentComponent;
    return currentComponent ? switchComponent.addChild(currentComponent) : undefined;
  }, name || "Switch")();
