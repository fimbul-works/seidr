import { DependencyGraph } from "./dependency-graph/types.js";

/**
 * Result of SSR rendering containing HTML and hydration data.
 */
export interface SSRRenderResult {
  html: string;
  hydrationData: HydrationData;
}

/**
 * Represents a single reactive binding on an element.
 *
 * Each binding connects a Seidr instance to an element property,
 * along with the paths to traverse from that Seidr to its root values.
 */
export interface ElementBinding {
  /** Numeric ID of the bound Seidr instance */
  seidrId: number;
  /** Property name on the element (e.g., "disabled", "textContent") */
  prop: string;
  /**
   * Paths to traverse from this Seidr to root observables.
   *
   * Each path is an array of parent indices. For example:
   * - `[0]` means this Seidr's first parent is a root
   * - `[1, 0]` means this Seidr's second parent's first parent is a root
   *
   * During hydration, we follow these paths to find which root values to update.
   */
  paths: number[][];
}

/**
 * Complete hydration data for client-side restoration.
 *
 * This structure contains everything needed to restore reactive state
 * on the client, including root observable values, element bindings,
 * and the dependency graph for traversal.
 */
export interface HydrationData {
  /**
   * Numeric ID -> value mapping for root observables.
   *
   * Only contains root observables (isDerived = false) that are
   * transitively depended on by bound elements. Derived observables
   * are recreated on the client and don't need their values stored.
   */
  observables: Record<number, any>;

  /**
   * Element ID -> bindings mapping.
   *
   * Maps the data-seidr-id attribute value to all reactive bindings
   * on that element. Each binding includes the Seidr numeric ID and
   * the paths to traverse to find root values.
   */
  bindings: Record<string, ElementBinding[]>;

  /**
   * Complete dependency graph with numeric IDs.
   *
   * Used during hydration to traverse parent chains and understand
   * the relationships between observables.
   */
  graph: DependencyGraph;
}
