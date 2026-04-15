import type { Component } from "../../component/types.js";
import type { Seidr } from "../../seidr/seidr.js";
import { SeidrError } from "../../types.js";
import type { ComponentTreeNode } from "../structure/types.js";
import type { HydrationData } from "../types.js";

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
 * Storage for hydration data and Seidr instances.
 */
export interface HydrationDataRegistry extends HydrationData {
  /**
   * Set of Seidr instances that have been hydrated.
   */
  registry: Set<Seidr>;
}
