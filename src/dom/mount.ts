import { watchMutations } from "../component/lifecycle/watch-mutations.js";
import { isComponent } from "../component/type-guards.js";
import type { SeidrComponent, SeidrComponentFactoryOrFunction } from "../component/types.js";
import { wrapComponent } from "../component/wrap-component.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isClient } from "../util/environment/is-client.js";
import { appendChild } from "./append-child.js";

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
 * @template {SeidrComponentFactoryOrFunction} C - Type of the component factory
 *
 * @param {C} componentOrFactory - The component instance, or a factory function (raw or wrapped)
 * @param {HTMLElement} container - The DOM container element to mount into
 * @param {AppStateData} [appStateData={}] - Optional AppState data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when AppState already has a root component
 */
export const mount = <C extends SeidrComponentFactoryOrFunction = SeidrComponentFactoryOrFunction>(
  componentOrFactory: C,
  container: HTMLElement,
): CleanupFunction => {
  if (!container) {
    throw new SeidrError("Cannot mount to null parent");
  }

  let cleanup: CleanupFunction;
  if (isClient()) {
    cleanup = watchMutations(container);
  }

  // Create the component
  const rootComponent: SeidrComponent = isComponent(componentOrFactory)
    ? componentOrFactory
    : wrapComponent(componentOrFactory, "Root")();

  appendChild(container, rootComponent);

  // Return cleanup function
  return () => (cleanup?.(), rootComponent.unmount());
};
