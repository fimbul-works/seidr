import type { ComponentTreeNode } from "src/ssr/structure";
import type { Component } from "../../../component";
import { SeidrError } from "../../../types";

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

  // /**
  //  * Pushes a node onto the stack.
  //  */
  // pushNode(index: number): void;
  // /**
  //  * Pops a node from the stack.
  //  */
  // popNode(): void;

  /**
   * Marks the current subtree as mismatched.
   */
  markSubtreeMismatched(): void;

  /**
   * Claims a node from the DOM.
   */
  claim<T extends ChildNode>(tag: string): T | null;
}
