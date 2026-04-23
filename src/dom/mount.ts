import type { Component, ComponentType } from "../component/types.js";
import { wrapComponent } from "../component/wrap-component.js";
import { type CleanupFunction, SeidrError } from "../types.js";
import { isComponent } from "../util/type-guards/component-types.js";
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
 * @template {ComponentType} C - Type of the component or factory
 * @param {C} componentOrFactory - The component instance, or a factory function (raw or wrapped)
 * @param {HTMLElement} container - The DOM container element to mount into
 * @param {AppStateData} [appStateData={}] - Optional AppState data
 * @returns {CleanupFunction} A cleanup function that unmounts the component when called
 * @throws {SeidrError} when AppState already has a root component
 */
export const mount = <C extends ComponentType = ComponentType>(
  componentOrFactory: C,
  container: HTMLElement,
): CleanupFunction => {
  if (!container) {
    throw new SeidrError("Cannot mount to null parent");
  }

  // Create the component
  const rootComponent: Component = isComponent(componentOrFactory)
    ? componentOrFactory
    : wrapComponent(componentOrFactory, "Root")();

  appendChild(container, rootComponent);

  // Return cleanup function
  return () => rootComponent.unmount();
};
