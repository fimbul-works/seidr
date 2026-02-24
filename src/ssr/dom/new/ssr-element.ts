import { TYPE_ELEMENT } from "../../../constants";
import type { NodeTypeElement } from "../../../types";
import type { ServerNodeList } from "../server-node-list";
import { SSRParentNode } from "./ssr-parent-node";

export class SSRElement extends SSRParentNode<NodeTypeElement> implements Partial<Element> {
  readonly nodeType = TYPE_ELEMENT;

  readonly tagName: string;

  constructor(tagName: string, ownerDocument: Document) {
    super(ownerDocument);
    this.tagName = tagName.toUpperCase();
  }

  get nodeName(): string {
    return this.tagName;
  }

  get nodeValue(): null {
    return null;
  }

  get ownerDocument(): Document {
    return this._ownerDocument!;
  }

  get textContent(): string {
    const children = this.childNodes as unknown as ServerNodeList;
    return children.nodes.map((node) => node.textContent ?? "").join("");
  }

  set textContent(value: string) {
    const children = this.childNodes as unknown as ServerNodeList;
    children.nodes.length = 0;
    this.appendChild(this.ownerDocument.createTextNode(value));
  }

  toString(): string {
    const children = this.childNodes as unknown as ServerNodeList;
    return `<${this.tagName}>${children.nodes.map((node) => node.toString()).join("")}</${this.tagName}>`;
  }
}
