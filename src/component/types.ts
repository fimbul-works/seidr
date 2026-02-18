import { type TYPE_COMPONENT, type TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants";
import type { SeidrChild, SeidrNode } from "../element";
import type { Seidr } from "../seidr";
import type { CleanupFunction } from "../types";

/**
 * Seidr component factories has a boolean flag to identify it has been wrapped with `component()`.
 */
interface ComponentFactoryInterface {
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT_FACTORY;
  readonly name: string;
}

/**
 * Seidr component pure function type.
 *
 * @template P - Props object type (optional)
 */
export type ComponentFactoryPureFunction<P = void> = P extends void
  ? () => ComponentReturnValue
  : (props: P) => ComponentReturnValue;

/**
 * Seidr component factory function type.
 *
 * @template P - Props object type (optional)
 */
export type ComponentFactory<P = void> = (P extends void ? () => Component : (props: P) => Component) &
  ComponentFactoryInterface;

/**
 * Type representing a Seidr component factory, which can be either a pure function or a wrapped factory function.
 *
 * @template P - Props object type (optional)
 */
export type ComponentFactoryFunction<P = void> = ComponentFactoryPureFunction<P> | ComponentFactory<P>;

/**
 * Type representing a Seidr component, which can be either a factory or an instantiated component.
 *
 * @template P - Props object type (optional)
 */
export type ComponentType<P = void> = ComponentFactoryFunction<P> | Component;

/**
 * Type representing the children of a component.
 */
export type ComponentChildren = SeidrNode | SeidrNode[] | null | undefined;

/**
 * Type representing the return values of a component factory.
 */
export type ComponentReturnValue = SeidrChild | SeidrChild[] | null | undefined;

/**
 * Manages cleanup functions and child components within a component's lifecycle.
 *
 * The ComponentScope provides a centralized way to track all resources that
 * need to be cleaned up when a component is destroyed. This prevents memory
 * leaks and ensures proper resource management throughout the application.
 */
export interface ComponentScope {
  /**
   * The unique identifier of the component.
   */
  readonly id: string;

  /**
   * Whether the scope has been destroyed.
   */
  readonly isDestroyed: boolean;

  /**
   * The parent component of this scope.
   */
  readonly parent: Component | null;

  /**
   * The parent node of this scope.
   */
  readonly parentNode: Node | null;

  /**
   * The children of this component.
   */
  readonly children: ReadonlyMap<string, Component>;

  /**
   * Removes a child component from this scope.
   * @param child - The child component to remove
   */
  removeChild(child: Component): void;

  /**
   * Tracks a cleanup function to be executed when the component is destroyed.
   *
   * Use this method to register any cleanup logic that should run when
   * the component is no longer needed, such as removing event listeners,
   * cleaning up reactive bindings, or clearing timeouts.
   *
   * @param {CleanupFunction} cleanup - The cleanup function to execute
   */
  track(cleanup: CleanupFunction): void;

  /**
   * Observes a Seidr observable and executes the callback within the component's context.
   * This ensures that any components created during the update are correctly parented.
   *
   * @template T
   * @param {Seidr<T>} observable - The observable to watch
   * @param {(val: T) => void} callback - The callback to execute when value changes
   * @returns {CleanupFunction} Cleanup function to stop observation
   */
  observe<T>(observable: Seidr<T>, callback: (val: T) => void): CleanupFunction;

  /**
   * Register a promise to wait for (SSR integration).
   * @param promise - The promise to track
   * @returns {Promise<T>} The same promise, for chaining
   */
  waitFor<T>(promise: Promise<T>): Promise<T>;

  /**
   * Tracks a child component for automatic cleanup when this component is destroyed.
   *
   * Child components are automatically destroyed when their parent component
   * is destroyed, creating a proper cleanup hierarchy. This method ensures
   * that child components are properly managed and cleaned up.
   *
   * @param {Component} component - The child component to track
   * @returns {Component} The same child Component
   */
  child(component: Component): Component;

  /**
   * Destroys all tracked resources and marks the scope as destroyed.
   *
   * This method executes all registered cleanup functions in the order
   * they were added. Once destroyed, the scope can no longer be used
   * to track new cleanup functions.
   */
  destroy(): void;

  /**
   * Notifies the scope that it has been attached to the DOM.
   * This will trigger onAttached and propagate to child components.
   * @param parent - The parent DOM node
   */
  attached(parent: Node): void;

  /**
   * Optional callback triggered when the component is attached to a parent.
   */
  onAttached?: (parent: Node) => void;
}

/**
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management. Each component tracks its own reactive bindings, event listeners,
 * and child components.
 */
export interface Component {
  /**
   * Read-only identifier for Seidr components.
   * @type {typeof TYPE.COMPONENT}
   */
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT;

  /**
   * The unique identifier of the component.
   */
  readonly id: string;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {ComponentChildren}
   */
  element: ComponentChildren;

  /**
   * The start marker of the component.
   * @type {Comment}
   */
  startMarker: Comment;

  /**
   * The end marker of the component.
   * @type {Comment}
   */
  endMarker: Comment;

  /**
   * The ComponentScope of this element.
   * @type {ComponentScope}
   */
  scope: ComponentScope;

  /**
   * Unmounts the component, destroying its scope and removing its elements from the DOM.
   */
  unmount(): void;
}
