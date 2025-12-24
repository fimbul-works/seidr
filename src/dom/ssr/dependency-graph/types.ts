/**
 * Represents a node in the dependency graph with numeric IDs.
 *
 * Each node is identified by a numeric ID (index) and contains
 * references to its parent nodes by their numeric IDs.
 */
export interface DependencyNode {
  /** Numeric ID (index in the observables array) */
  id: number;
  /** Array of parent numeric IDs (empty for root observables) */
  parents: number[];
}

/**
 * Represents the complete dependency graph with numeric IDs.
 *
 * This structure is used for hydration data serialization, providing
 * a compact representation of the dependency relationships.
 */
export interface DependencyGraph {
  nodes: DependencyNode[];
  /** IDs of root observables (isDerived = false) */
  rootIds: number[];
}
