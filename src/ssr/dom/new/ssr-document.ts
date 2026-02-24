import { TYPE_DOCUMENT } from "../../../constants";
import type { NodeTypeDocument } from "../../../types";
import type { ServerNodeList } from "../server-node-list";
import { SSRComment } from "./ssr-comment";
import { SSRElement } from "./ssr-element";
import { SSRParentNode } from "./ssr-parent-node";
import { SSRTextNode } from "./ssr-text-node";

export class SSRDocument extends SSRParentNode<NodeTypeDocument> implements Partial<Document> {
  readonly nodeType = TYPE_DOCUMENT;

  get nodeName(): string {
    return "#document";
  }

  get nodeValue(): null {
    return null;
  }

  get ownerDocument(): null {
    return null;
  }

  get textContent(): null {
    return null;
  }

  set textContent(_value: string) {
    return;
  }

  createTextNode(data: string): Text {
    return new SSRTextNode(data, this as unknown as Document);
  }

  createComment(data: string): Comment {
    return new SSRComment(data, this as unknown as Document);
  }

  createElement(tagName: string): HTMLElement {
    return new SSRElement(tagName, this as unknown as Document) as unknown as HTMLElement;
  }

  toString(): string {
    const children = this.childNodes as unknown as ServerNodeList;
    return children.nodes.map((node) => node.toString()).join("");
  }
}
