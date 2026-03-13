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

/**
 * A resolved virtualization of a component during hydration, holding
 * mapped physical DOM nodes and internal local state for claiming.
 */
export interface ComponentDomTree {
  /**
   * Component ID.
   */
  id: string;

  /**
   * Physical DOM nodes mapped exactly to the component's StructureMapTuple indices.
   * `claimNodes[i]` corresponds to `StructureMapTuple[i]`.
   */
  claimNodes: ChildNode[];

  /**
   * Pointer resolving which index the next claim() call retrieves.
   */
  claimCursor: number;

  /**
   * Child components instantiated within this component.
   */
  children: Map<string, ComponentDomTree>;

  /**
   * Parent node in the virtual tree.
   */
  parent?: ComponentDomTree;
}
