import { TYPE_ELEMENT } from "../../../constants";
import type { NodeTypeDocument, NodeTypeElement } from "../../../types";
import { ServerNodeList } from "../server-node-list";
import { SSRChildNode } from "./ssr-child-node";
import { SSRDocument } from "./ssr-document";
import { SSRTextNode } from "./ssr-text-node";

export abstract class SSRParentNode<T extends NodeTypeDocument | NodeTypeElement>
  extends SSRChildNode<T>
  implements ParentNode
{
  get childElementCount(): number {
    return this.children.length;
  }

  get children(): HTMLCollection {
    return this.serverChildNodes.nodes.filter((node) => node.nodeType === TYPE_ELEMENT) as unknown as HTMLCollection;
  }

  get firstElementChild(): Element | null {
    return this.serverChildNodes.nodes.find((node) => node.nodeType === TYPE_ELEMENT) as Element | null;
  }

  get lastElementChild(): Element | null {
    return this.serverChildNodes.nodes.findLast((node) => node.nodeType === TYPE_ELEMENT) as Element | null;
  }

  prepend(...nodes: (Node | string)[]): void {
    this.serverChildNodes.nodes.unshift(
      ...nodes.map((node) =>
        typeof node === "string"
          ? new SSRTextNode(node, this.ownerDocument ?? (new SSRDocument() as unknown as Document))
          : node,
      ),
    );
  }

  append(...nodes: (Node | string)[]): void {
    this.serverChildNodes.nodes.push(
      ...nodes.map((node) =>
        typeof node === "string"
          ? new SSRTextNode(node, this.ownerDocument ?? (new SSRDocument() as unknown as Document))
          : node,
      ),
    );
  }

  replaceChildren(...nodes: (Node | string)[]): void {
    this.serverChildNodes.nodes.splice(
      0,
      this.serverChildNodes.nodes.length,
      ...nodes.map((node) =>
        typeof node === "string"
          ? new SSRTextNode(node, this.ownerDocument ?? (new SSRDocument() as unknown as Document))
          : node,
      ),
    );
  }

  querySelector(selectors: string): Element | null {
    const children = this.children as unknown as Element[];
    return children.find((node) => node.matches(selectors)) ?? null;
  }

  querySelectorAll(selectors: string): NodeListOf<Element> {
    const children = this.children as unknown as Element[];
    return new ServerNodeList(
      children.filter((node) => node.matches(selectors)) as any,
    ) as unknown as NodeListOf<Element>;
  }
}
