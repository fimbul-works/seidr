import type { Component, ComponentType } from "../component/types";
import { wrapComponent } from "../component/wrap-component";
import { getRenderContext } from "../render-context";
import { type CleanupFunction, SeidrError } from "../types";
import { isComponent } from "../util/type-guards/seidr-dom-types";
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
  // Bind the container to the render context if not already bound
  const ctx = getRenderContext();
  if (!ctx.rootNode) {
    ctx.rootNode = container;
  } else if (ctx.rootComponent) {
    throw new SeidrError("Container already bound to a different root node");
  }

  // Create the component
  const component: Component = isComponent(componentOrFactory)
    ? componentOrFactory
    : wrapComponent(componentOrFactory)();

  ctx.rootComponent = component;
  appendChild(container, component);

  // Return cleanup function
  return () => {
    component.unmount();
    ctx.rootComponent = undefined;
    if (ctx.rootNode === container) {
      ctx.rootNode = undefined;
    }
  };
};
