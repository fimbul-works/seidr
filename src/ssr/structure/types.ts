/**
 * Tuple of a component child tag and it's children in the parent component
 */
export type StructureMapTuple = [string, ...number[]];

/**
 * Node in a component DOM tree.
 */
export interface ComponentTreeNode {
  /**
   * The sequence a child was created in.
   */
  creationIndex: number;
  /**
   * Child node tag.
   */
  tag: string;
  /**
   * Child component ID.
   */
  id?: string;
  /**
   * Child nodes.
   */
  children?: ComponentTreeNode[];
}
