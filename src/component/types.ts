import type { SeidrNode } from "src/element";
import type { CleanupFunction, TYPE } from "../types";
import { TYPE_PROP } from "../types";

/**
 * Manages cleanup functions and child components within a component's lifecycle.
 *
 * The ComponentScope provides a centralized way to track all resources that
 * need to be cleaned up when a component is destroyed. This prevents memory
 * leaks and ensures proper resource management throughout the application.
 */
export interface ComponentScope {
  /**
   * Whether the scope has been destroyed.
   */
  readonly isDestroyed: boolean;

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
   * @param {SeidrComponent} component - The child component to track
   * @returns {SeidrComponent} The same child SeidrComponent
   */
  child(component: SeidrComponent): SeidrComponent;

  /**
   * Destroys all tracked resources and marks the scope as destroyed.
   *
   * This method executes all registered cleanup functions in the order
   * they were added. Once destroyed, the scope can no longer be used
   * to track new cleanup functions.
   */
  destroy(): void;

  /**
   * Optional callback triggered when the component is attached to a parent.
   * @internal
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
 *
 * @template {Node} T - The type of SeidrElement this component contains
 */
export interface SeidrComponent<T extends SeidrNode | SeidrNode[] = SeidrNode | SeidrNode[]> {
  /**
   * Read-only identifier for Seidr components.
   * @type {typeof TYPE.COMPONENT}
   */
  readonly [TYPE_PROP]: typeof TYPE.COMPONENT;

  /**
   * The unique identifier of the component.
   */
  id: string;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {T}
   */
  element: T;

  /**
   * The start marker of the component.
   * @type {Comment | undefined}
   */
  start?: Comment;

  /**
   * The end marker of the component.
   * @type {Comment | undefined}
   */
  end?: Comment;

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

/**
 * Seidr component factories has a boolean flag to identify it has been wrapped with `component()`.
 */
interface SeidrComponentFactoryInterface {
  [TYPE_PROP]: typeof TYPE.COMPONENT_FACTORY;
}

/**
 * Seidr component factory type.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactory<P> = (P extends void ? () => SeidrComponent : (props: P) => SeidrComponent) &
  SeidrComponentFactoryInterface;
