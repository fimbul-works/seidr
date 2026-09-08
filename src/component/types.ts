import { type TYPE_COMPONENT, type TYPE_COMPONENT_FACTORY, TYPE_PROP } from "../constants.js";
import type { SeidrChild } from "../element/types.js";
import type { CleanupFunction } from "../types.js";

/**
 * Component metadata.
 */
export interface SeidrComponent {
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT;
  /** Component ID */
  id: number;
  /** Component name */
  name: string;
  /** Flag to indicate if component is mounted */
  isMounted: boolean;
  /** DOM nodes */
  nodes: ChildNode[];
  /** Parent component for cleanup propagation */
  owner: SeidrComponent | null;
  /** Child components */
  children: Set<SeidrComponent>;
  /** Lifecycle: called when component is mounted */
  onMount(fn: OnMountedFunction): void;
  /** Lifecycle: called when component is attached to Document */
  onAttach(fn: OnAttachedFunction): void;
  /** Lifecycle: called when component is removed from DOM */
  onUnmount(fn: CleanupFunction): void;
  /**
   * Destroys the component, cleaning up resources and removing its elements from the DOM.
   * @internal
   */
  unmount(): void;
  /**
   * The next available Value ID for this component.
   * @internal
   */
  readonly nextValueId: number;
  /**
   * Execution sequence array populated during Server-Side Rendering.
   * @internal
   */
  readonly createdIndex?: (ChildNode | SeidrComponent)[];
  /**
   * Map of child component root nodes to their component ID.
   * @internal
   */
  readonly childCreatedIndex?: Map<Node | SeidrComponent, string>;
  /**
   * Tracks a created node in the component's execution sequence.
   * @internal
   */
  trackChild?(child: ChildNode | SeidrComponent): void;
  /**
   * Removes a created node from the component's execution sequence.
   * @internal
   */
  untrackChild?(child: ChildNode | SeidrComponent): void;
}

/**
 * Seidr component factories has a boolean flag to identify it has been wrapped with `createComponent()`.
 */
interface SeidrComponentFactoryInterface {
  readonly [TYPE_PROP]: typeof TYPE_COMPONENT_FACTORY;
  readonly name: string;
}

/**
 * Type representing the return values of a component factory.
 */
export type SeidrComponentReturnValue = SeidrChild | SeidrChild[] | null | undefined;

/**
 * Seidr component pure function type.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactoryPureFunction<P = void> = P extends void
  ? () => SeidrComponentReturnValue
  : (props: P) => SeidrComponentReturnValue;

/**
 * Seidr component factory function type.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactory<P = void> = ((props: P) => SeidrComponent) & SeidrComponentFactoryInterface;

/**
 * Type representing a Seidr component, which can be either a factory or a pure function.
 *
 * @template P - Props object type (optional)
 */
export type SeidrComponentFactoryOrFunction<P = void> = SeidrComponentFactory<P> | SeidrComponentFactoryPureFunction<P>;

/**
 * Function to execute when a component is mounted.
 */
export type OnMountedFunction = (container: HTMLElement) => void;

/**
 * Function to execute when a component or DOM node is attached to the document.
 */
export type OnAttachedFunction = () => void;
