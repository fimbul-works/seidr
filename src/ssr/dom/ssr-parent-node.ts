import { TYPE_ELEMENT } from "../../constants";
import type { NodeTypeDocument, NodeTypeElement } from "../../types";
import { isStr } from "../../util/type-guards/primitive-types";
import { SSRChildNode } from "./ssr-child-node";
import type { SSRDocument } from "./ssr-document";
import { SSRNodeList } from "./ssr-node-list";
import type { ServerNode } from "./types";

export abstract class SSRParentNode<
    T extends NodeTypeDocument | NodeTypeElement,
    D extends SSRDocument | null = SSRDocument | null,
  >
  extends SSRChildNode<T, D>
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
    const ref = this.firstChild;
    for (const node of nodes) {
      const newNode = isStr(node) ? this.ownerDocument!.createTextNode(node) : node;
      this.insertBefore(newNode, ref);
    }
  }

  append(...nodes: (Node | string)[]): void {
    for (const node of nodes) {
      const newNode = isStr(node) ? this.ownerDocument!.createTextNode(node) : node;
      this.appendChild(newNode);
    }
  }

  replaceChildren(...nodes: (Node | string)[]): void {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    this.append(...nodes);
  }

  querySelector(selectors: string): Element | null {
    for (const node of this.serverChildNodes.nodes) {
      if (node.nodeType === TYPE_ELEMENT) {
        const el = node as unknown as Element;
        if (el.matches(selectors)) return el;
        const found = el.querySelector(selectors);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll(selectors: string): NodeListOf<Element> {
    const results: Element[] = [];
    const traverse = (parentNode: SSRParentNode<any, D>) => {
      for (const node of parentNode.serverChildNodes.nodes) {
        if (node.nodeType === TYPE_ELEMENT) {
          const el = node as unknown as Element;
          if (el.matches(selectors)) results.push(el);
          traverse(el as unknown as SSRParentNode<any, D>);
        }
      }
    };
    traverse(this);
    return new SSRNodeList(results as unknown as ServerNode[]) as unknown as NodeListOf<Element>;
  }

  getElementsByClassName(className: string): HTMLCollectionOf<Element> {
    const results: Element[] = [];
    const traverse = (parentNode: SSRParentNode<any>) => {
      for (const node of parentNode.serverChildNodes.nodes) {
        if (node.nodeType === TYPE_ELEMENT) {
          const el = node as unknown as Element;
          if (el.classList.contains(className)) results.push(el);
          traverse(el as unknown as SSRParentNode<any>);
        }
      }
    };
    traverse(this);
    return results as unknown as HTMLCollectionOf<Element>;
  }

  getElementsByTagName(tagName: string): HTMLCollectionOf<Element> {
    const results: Element[] = [];
    const lowerTag = tagName.toLowerCase();
    const traverse = (parentNode: SSRParentNode<any>) => {
      for (const node of parentNode.serverChildNodes.nodes) {
        if (node.nodeType === TYPE_ELEMENT) {
          const el = node as unknown as Element;
          if (tagName === "*" || el.tagName.toLowerCase() === lowerTag) results.push(el);
          traverse(el as unknown as SSRParentNode<any>);
        }
      }
    };
    traverse(this);
    return results as unknown as HTMLCollectionOf<Element>;
  }
}
