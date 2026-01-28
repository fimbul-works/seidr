import type { DOMFactoryAdapter } from "./types";

export class DOMAdapter implements DOMFactoryAdapter<HTMLElement, Node, DocumentFragment> {
  createElement<T extends keyof HTMLElementTagNameMap>(tag: T): HTMLElementTagNameMap[T] {
    return document.createElement(tag);
  }
  createTextNode(text: string): Text {
    return document.createTextNode(text);
  }
  createComment(text: string): Comment {
    return document.createComment(text);
  }
  createFragment(): DocumentFragment {
    return document.createDocumentFragment();
  }
}
