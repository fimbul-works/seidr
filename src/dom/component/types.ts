import type { ComponentScope } from "./component-scope";

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
export interface SeidrComponent<T extends Node = any> {
  /**
   * Read-only identifier for Seidr components.
   * @type {true}
   */
  readonly isSeidrComponent: true;

  /**
   * The root element of the component.
   *
   * This element is enhanced with SeidrElement functionality including
   * reactive bindings, event handling, and cleanup capabilities.
   * @type {T}
   */
  element: T;

  /**
   * The ComponentScope of this element.
   * @type {ComponentScope}
   */
  scope: ComponentScope;

  /**
   * Destroys the component and all its resources.
   *
   * This method performs comprehensive cleanup:
   * - Destroys the root element and all children
   * - Removes all event listeners
   * - Cleans up all reactive bindings
   * - Executes all tracked cleanup functions
   * @type {() => void}
   */
  destroy(): void;
}

/**
 * Seidr component factories has a boolean flag to identify it has been wrapped with `component()`.
 */
interface SeidrComponentFactoryInterface {
  isComponentFactory: true;
}

/**
 * Seidr component factory type.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactory<P> = (P extends void ? () => SeidrComponent : (props: P) => SeidrComponent) &
  SeidrComponentFactoryInterface;
