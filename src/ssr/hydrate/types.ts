import type { Component } from "../../component/types.js";
import type { Seidr } from "../../seidr/seidr.js";
import { SeidrError } from "../../types.js";
import type { SSRScopeCapture } from "../ssr-scope.js";
import type { ComponentTreeNode } from "../structure/types.js";

/**
 * Error thrown when a hydration mismatch occurs.
 */
export class HydrationMismatchError extends SeidrError {
  name = "HydrationMismatchError";
}

/**
 * Node in a component DOM tree.
 */
export interface HydrationTreeNode extends ComponentTreeNode {
  /**
   * Node in the DOM.
   */
  node?: ChildNode;

  /**
   * Child nodes.
   */
  children?: HydrationTreeNode[];
}

/**
 * Interface for the hydration context.
 */
export interface HydrationContext {
  /**
   * Moves to the next node.
   */
  next(): void;
  /**
   * Pushes a component onto the stack.
   */
  pushComponent(component: Component): void;
  /**
   * Pops a component from the stack.
   */
  popComponent(): void;

  /**
   * Removes a component from the hydration mapping.
   */
  removeComponent(component: Component): void;

  /**
   * Returns true if the current component or any parent is mismatched.
   */
  isMismatched(): boolean;

  /**
   * Claims a node from the DOM.
   */
  claim<T extends ChildNode>(tag: string): T;
}

/**
 * A node that is mismatched during hydration.
 */
export interface HydrationMismatchNode extends HTMLElement {
  isHydrationMismatch: true;
}

/**
 * Complete hydration data for client-side restoration.
 *
 * This structure contains everything needed to restore reactive state
 * on the client, essentially just the root observable values.
 */
export interface HydrationData extends SSRScopeCapture {
  /**
   * Render context ID from the server.
   *
   * This ID is used to ensure deterministic marker IDs for components like Router,
   * allowing the client-side hydration to match SSR-rendered markers.
   *
   * During hydration, the client-side render context is updated to use this ID
   * instead of the default 0, enabling proper SSR/client marker matching.
   */
  ctxID: number;

  /** Serialized app data */
  data?: Record<string, any>;

  /**
   * Root container for path traversal relative lookup (client-side only).
   */
  root?: Element;
}

/**
 * Storage for hydration data and Seidr instances.
 */
export interface HydrationDataStorage {
  /**
   * Hydration data containing serialized app state and component structure.
   */
  data: HydrationData | undefined;

  /**
   * Set of Seidr instances that have been hydrated.
   */
  registry: Set<Seidr>;
}
