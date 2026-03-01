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
 * Lifecycle and resource management interface for components.
 * This is the public API surface exposed via useScope().
 */
export interface LifecycleScope {
  /**
   * The unique identifier of the component.
   */
  readonly id: string;

  /**
   * Whether the component has been destroyed.
   */
  readonly isUnmounted: boolean;

  /**
   * Tracks a cleanup function to be executed when the component is destroyed.
   * @param {CleanupFunction} cleanup - The cleanup function to execute
   */
  onUnmount(cleanup: CleanupFunction): void;

  /**
   * Observes a Seidr observable and executes the callback within the component's context.
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
   * Tracks a child component for automatic cleanup.
   * @param {Component} component - The child component to track
   * @returns {Component} The same child Component
   */
  child(component: Component): Component;

  /**
   * Callback triggered when the component is attached to a parent.
   * @param {(parent: Node) => void} callback - The callback to execute when attached
   */
  onMount(callback: (parent: Node) => void): void;
}

/**
 * Represents a Seidr component with automatic lifecycle management.
 *
 * Components are the primary building blocks of Seidr applications, encapsulating
 * both the visual element and the cleanup logic needed for proper resource
 * management.
 */
export interface Component extends LifecycleScope {
  /**
   * Read-only identifier for Seidr components.
   * @type {typeof TYPE.COMPONENT}
   */
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT;

  /**
   * The parent component.
   */
  readonly parent: Component | null;

  /**
   * The parent DOM node, if attached.
   */
  readonly parentNode: Node | null;

  /**
   * The root element of the component.
   * @type {ComponentChildren}
   */
  element: ComponentChildren;

  /**
   * The start marker of the component.
   * @type {Comment}
   */
  startMarker?: Comment;

  /**
   * The end marker of the component.
   * @type {Comment}
   */
  endMarker?: Comment;

  /**
   * Destroys the component, cleaning up resources and removing its elements from the DOM.
   */
  unmount(): void;

  /**
   * Removes a child component.
   * @param child - The child component to remove
   * @internal
   */
  removeChild(child: Component): void;

  /**
   * Notifies the component that it has been attached to the DOM.
   * @param parent - The parent DOM node
   * @internal
   */
  attached(parent: Node): void;

  /**
   * Resets the component's internal lifecycle state (cleanups and children).
   * Used for error recovery in Safe components.
   * @internal
   */
  reset(): void;

  /**
   * Execution sequence array populated during Server-Side Rendering.
   * Only present during SSR builds.
   * @internal
   */
  executionSequence: Node[];

  /**
   * Tracks a created node in the component's execution sequence.
   * Only used during SSR to build the hydration data payload.
   * @param node The node to track
   * @internal
   */
  trackNode(node: Node): void;
}
