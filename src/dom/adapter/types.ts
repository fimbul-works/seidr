export interface DOMFactoryAdapter<ElementType, NodeType, FragmentType> {
  createElement(tag: string): ElementType;
  createTextNode(text: string): NodeType;
  createComment(text: string): NodeType;
  createFragment(): FragmentType;
}
