import type { SeidrElement } from "../element/types";

export interface DOMAdapter {
  createElement(tag: string): SeidrElement;
  createTextNode(text: string): Node;
  createComment(text: string): Node;
  createFragment(): DocumentFragment;
  createPortal(element: Node, container: Node): Node;
}
