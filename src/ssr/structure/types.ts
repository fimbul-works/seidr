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
   * The physical DOM node associated with this virtual node (for elements and text).
   */
  domNode?: ChildNode;
  /**
   * Child nodes.
   */
  children?: ComponentTreeNode[];
  /**
   * Specifically for components: holding the list of nodes that this component will "claim".
   * For non-component nodes, this is usually empty or same as children.
   */
  claimNodes?: ChildNode[];

  /**
   * Whether this component or node has a hydration mismatch.
   */
  isMismatched: boolean;

  /**
   * The tag of the physical DOM node.
   */
  domTag?: string;
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
}
