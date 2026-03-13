import type { Component } from "../../../component";
import { SeidrError } from "../../../types";
import type { ComponentTreeNode } from "../../structure/types";

/**
 * Error thrown when a hydration mismatch occurs.
 */
export class HydrationMismatchError extends SeidrError {
  name = "HydrationMismatchError";
}

/**
 * Interface for the hydration context.
 */
export interface HydrationContext {
  /**
   * The current component node.
   */
  get currentNode(): ComponentTreeNode | null;
  /**
   * The current DOM node.
   */
  get currentDomNode(): ChildNode;
  /**
   * The path of the current DOM node.
   */
  get domPath(): number[];

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
   * Pushes a node onto the stack.
   */
  pushNode(index: number): void;
  /**
   * Pops a node from the stack.
   */
  popNode(): void;

  /**
   * Marks the current subtree as mismatched.
   */
  markSubtreeMismatched(): void;

  /**
   * Claims the SSR marker comments for a component.
   */
  claimComponentMarkers(componentId: string): { startMarker: Comment | null; endMarker: Comment | null };

  /**
   * Claims a node from the DOM.
   */
  claim<T extends ChildNode>(tag: string): T | undefined;
}
