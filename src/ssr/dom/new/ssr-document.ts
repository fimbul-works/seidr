import { TYPE_DOCUMENT } from "../../../constants";
import type { NodeTypeDocument } from "../../../types";
import type { ServerNodeList } from "../server-node-list";
import { SSRComment } from "./ssr-comment";
import { SSRElement } from "./ssr-element";
import { SSRParentNode } from "./ssr-parent-node";
import { SSRTextNode } from "./ssr-text-node";

export class SSRDocument extends SSRParentNode<NodeTypeDocument, null> implements Partial<Document> {
  readonly nodeType = TYPE_DOCUMENT;

  public readonly documentElement: HTMLElement;
  public readonly head: HTMLElement;
  public readonly body: HTMLElement;

  public readonly idMap: Map<string, SSRElement> = new Map();

  constructor() {
    super(null);
    this.documentElement = this.createElement("html");
    this.head = this.createElement("head");
    this.body = this.createElement("body");

    this.appendChild(this.documentElement);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
  }

  get mockDocument(): Document {
    return this as unknown as Document;
  }

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
    return new SSRTextNode(data, this).mockText;
  }

  createComment(data: string): Comment {
    return new SSRComment(data, this).mockComment;
  }

  createElement<K extends keyof HTMLElementTagNameMap | string>(
    tagName: K,
  ): K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement {
    return new SSRElement(tagName, this).mockElement as unknown as K extends keyof HTMLElementTagNameMap
      ? HTMLElementTagNameMap[K]
      : HTMLElement;
  }

  getElementById(id: string): HTMLElement | null {
    if (this.idMap.has(id)) {
      return this.idMap.get(id) as unknown as HTMLElement;
    }
    return this.querySelector(`#${id}`) as unknown as HTMLElement | null;
  }

  toString(): string {
    const children = this.childNodes as unknown as ServerNodeList;
    return children.nodes.map((node) => node.toString()).join("");
  }
}
