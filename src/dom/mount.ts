import { getAppState } from "../app-state/app-state";
import type { Component, ComponentType } from "../component/types";
import { wrapComponent } from "../component/wrap-component";
import { getHydrationData, isHydrating } from "../ssr/hydrate/storage";
import { type CleanupFunction, SeidrError } from "../types";
import { isComponent } from "../util/type-guards/component-types";
import { appendChild } from "./append-child";

/**
 * Mounts a component or element factory into a container element with automatic cleanup.
 *
 * The mount function appends a component's element to the specified container
 * and returns a cleanup function that can properly unmount the component, including
 * destroying all child components, removing event listeners, and cleaning up
 * reactive bindings.
 *
 * If a plain function is provided, Seidr automatically wraps it in a component.
 *
 * If called within a parent component's render function, the cleanup is automatically
 * tracked and will be executed when the parent component is destroyed.
 *
 * @template {ComponentType} C - Type of the component or factory
 * @param {C} componentOrFactory - The component instance, or a factory function (raw or wrapped)
 * @param {HTMLElement} container - The DOM container element to mount into
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 */
export const mount = <C extends ComponentType = ComponentType>(
  componentOrFactory: C,
  container: HTMLElement,
): CleanupFunction => {
  const rootNodeId = "rootNode";
  const rootComponentId = "rootComponent";
  // Bind the container to the application state if not already bound
  const state = getAppState();
  const currentRootNode = state.getData<HTMLElement>(rootNodeId);
  if (!currentRootNode) {
    state.setData(rootNodeId, container);
  } else if (state.getData(rootComponentId)) {
    throw new SeidrError("Container already bound to a different root node");
  }

  // Create the component
  const component: Component = isComponent(componentOrFactory)
    ? componentOrFactory
    : wrapComponent(componentOrFactory)();

  state.setData(rootComponentId, component);

  // During hydration, skip appendChild if the container already contains the root component's element
  let skipAppend = false;
  if (isHydrating()) {
    const hydrationData = getHydrationData();
    // If the hydration root is the container itself, the elements are already inside
    if (hydrationData?.data?.root === container) {
      if (process.env.DEBUG_HYDRATION) {
        console.log("[mount] Skipping appendChild because container is the hydration root");
      }
      skipAppend = true;
    }
  }

  if (!skipAppend) {
    appendChild(container, component);
  }

  // Return cleanup function
  return () => {
    component.unmount();
    state.deleteData(rootComponentId);
    if (state.getData(rootNodeId) === container) {
      state.deleteData(rootNodeId);
    }
  };
};
