import { escapeHTML } from "../../util/html";
import { isStr } from "../../util/type-guards";
import { renderElementToString } from "./render-server-html-element";
import { type BaseServerNodeInterface, ELEMENT_NODE, type NodeTypeElement } from "./types";
import type { ServerNodeWithChildNodes } from "./with-child-nodes";

export interface ServerElementPropertiesExtension {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string | null;
  innerHTML?: string;
  toString(): string;
}

export function nodeWithElementPropertiesExtension<
  N extends BaseServerNodeInterface<NodeTypeElement> & ServerNodeWithChildNodes<NodeTypeElement>,
>(node: N): N & ServerElementPropertiesExtension {
  const properties: PropertyDescriptorMap = {
    textContent: {
      enumerable: true,
      configurable: true,
      get() {
        return node.childNodes.map((c: any) => c.textContent ?? "").join("");
      },
      set(value: string) {
        node.childNodes.forEach((c) => c.remove());
        node.appendChild(value);
      },
    },
    innerHTML: {
      enumerable: true,
      configurable: true,
      get() {
        return node.childNodes.map((c: any) => c.toString()).join("");
      },
      set(value: string) {
        node.childNodes.forEach((c) => c.remove());
        // Simple mock: wrap raw HTML in an object that looks like a node
        node.appendChild({
          nodeType: 3, // Treat as text node for traversal but bypass escaping
          toString: () => value,
          remove: () => {}, // mock
        } as any);
      },
    },
    toString: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function (this: N & ServerElementPropertiesExtension) {
        return renderElementToString(this.tagName, {
          id: this.id,
          className: this.className,
          innerHTML: this.innerHTML,
        });
      },
    },
  };

  return Object.defineProperties(node, properties) as N & ServerElementPropertiesExtension;
}
