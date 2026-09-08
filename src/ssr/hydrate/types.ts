import type { SeidrComponent } from "../../component/types.js";
import type { Value } from "../../observable/value.js";
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
  pushComponent(component: SeidrComponent): void;
  /**
   * Pops a component from the stack.
   */
  popComponent(): void;

  /**
   * Removes a component from the hydration mapping.
   */
  removeComponent(component: SeidrComponent): void;

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
 * Storage for hydration data and Value instances.
 */
export interface HydrationDataRegistry extends HydrationData {
  /**
   * Set of Value instances that have been hydrated.
   */
  registry: Set<Value>;
}
