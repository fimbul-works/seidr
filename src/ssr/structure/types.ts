export type StructureMapTuple = [string, ...number[]];

export interface StructureTreeNode {
  _idx: number;
  tag: string;
  id?: string;
  children?: StructureTreeNode[];
}
