import { isHTMLElement, isStr } from "../../util/type-guards";
import {
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  type NodeTypeDocumentFragment,
  type NodeTypeElement,
  type ServerNodeType,
} from "./types";
import type { ServerNodeWithChildNodes } from "./with-child-nodes";

export interface ServerNodeWithChildElementNodes<T extends NodeTypeElement | NodeTypeDocumentFragment>
  extends ServerNodeWithChildNodes<T> {
  readonly childElementCount: number;
  readonly children: any[]; // Use any for now until ServerHTMLElement is converted
  readonly firstElementChild: any | null;
  readonly lastElementChild: any | null;
  append(...nodes: ServerNodeType[]): void;
  prepend(...nodes: ServerNodeType[]): void;
  moveBefore(node: ServerNodeType, referenceNode: ServerNodeType | null): void;
  replaceChildren(...nodes: ServerNodeType[]): void;
  querySelector(selector: string): any | null;
  querySelectorAll(selector: string): any[];
  getElementById(id: string): any | null;
  getElementsByTagName(tagName: string): any[];
  getElementsByClassName(className: string): any[];
}

export function nodeWithChildElementNodesExtension<
  T extends NodeTypeElement | NodeTypeDocumentFragment,
  N extends ServerNodeWithChildNodes<T>,
>(node: N): N & ServerNodeWithChildElementNodes<T> {
  const ext = {
    get childElementCount() {
      return this.children.length;
    },
    get children() {
      return node.childNodes.filter(isHTMLElement);
    },
    get firstElementChild() {
      return this.children[0] ?? null;
    },
    get lastElementChild() {
      const children = this.children;
      return children[children.length - 1] ?? null;
    },
    append(...nodes: ServerNodeType[]) {
      for (const n of nodes) {
        node.appendChild(n as any);
      }
    },
    prepend(...nodes: ServerNodeType[]) {
      const first = node.firstChild;
      for (const n of nodes) {
        node.insertBefore(n as any, first);
      }
    },
    moveBefore(n: ServerNodeType, referenceNode: ServerNodeType | null) {
      node.insertBefore(n as any, referenceNode as any);
    },
    replaceChildren(...nodes: ServerNodeType[]) {
      const children = [...node.childNodes];
      for (const child of children) {
        node.removeChild(child);
      }
      this.append(...nodes);
    },
    querySelector(selector: string): any | null {
      if (selector.startsWith("#")) return this.getElementById(selector.slice(1));
      if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1))[0] ?? null;
      return this.getElementsByTagName(selector)[0] ?? null;
    },
    querySelectorAll(selector: string): any[] {
      if (selector.startsWith("#")) {
        const el = this.getElementById(selector.slice(1));
        return el ? [el] : [];
      }
      if (selector.startsWith(".")) return this.getElementsByClassName(selector.slice(1));
      return this.getElementsByTagName(selector);
    },
    getElementById(id: string): any | null {
      const children = node.childNodes;
      for (const child of children) {
        if (!isHTMLElement(child)) continue;
        if ((child as any).id === id) return child;
        const found = (child as any).getElementById?.(id);
        if (found) return found;
      }
      return null;
    },
    getElementsByTagName(tagName: string): any[] {
      const results: any[] = [];
      const tag = tagName.toLowerCase();
      const children = node.childNodes;
      for (const child of children) {
        if (!isHTMLElement(child)) continue;
        if ((child as any).tagName?.toLowerCase() === tag || tag === "*") {
          results.push(child);
        }
        if ((child as any).getElementsByTagName) {
          results.push(...(child as any).getElementsByTagName(tagName));
        }
      }
      return results;
    },
    getElementsByClassName(className: string): any[] {
      const results: any[] = [];
      const children = node.childNodes;
      for (const child of children) {
        if (!isHTMLElement(child)) continue;
        const classes = (child as any).className?.split(/\s+/) ?? [];
        if (classes.includes(className)) {
          results.push(child);
        }
        if ((child as any).getElementsByClassName) {
          results.push(...(child as any).getElementsByClassName(className));
        }
      }
      return results;
    },
  };

  return Object.defineProperties(node, Object.getOwnPropertyDescriptors(ext)) as any;
}
