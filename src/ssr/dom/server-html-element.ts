import type { ReactiveCSSStyleDeclaration, ReactiveValue } from "../../element";
import { unwrapSeidr } from "../../seidr";
import { escapeHTML } from "../../util/html";
import { createAriaProxy } from "./aria-proxy";
import { createCaseProxy } from "./case-proxy";
import { createServerTextNode } from "./character-data";
import { createDatasetProxy } from "./dataset-proxy";
import { renderElementToString } from "./render-server-html-element";
import { createServerNode } from "./server-node";
import { createStyleProxy } from "./style-proxy";
import { ELEMENT_NODE, type NodeTypeElement, type ServerNodeType, TEXT_NODE } from "./types";
import { nodeWithChildElementNodesExtension, type ServerNodeWithChildElementNodes } from "./with-child-elements";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithElementPropertiesExtension, type ServerElementPropertiesExtension } from "./with-element-properties";
import { nodeWithParentExtension, type ServerNodeWithParent } from "./with-parent";

/**
 * Global map of server-side HTML elements indexed by their ID attribute.
 */
export const ServerElementMap = new Map<string, any>();

export type Attributes = Record<string, any>;

export interface ServerHTMLElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>
  extends HTMLElement, ServerNodeWithParent<NodeTypeElement>,
    ServerNodeWithChildElementNodes<NodeTypeElement>,
    ServerElementPropertiesExtension {
  readonly isSeidrElement: true;
  tagName: K;
  id?: ReactiveValue<string>;
  className?: string;
  innerHTML?: string;
  innerText?: string;
  textContent?: string;
  classList: any;
  style: ReactiveCSSStyleDeclaration;
  dataset: Record<string, string>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: any): void;
  removeAttribute(name: string): void;
  attributes: Record<string, any>;
  hasAttribute(name: string): boolean;
  on(event: string, handler: (ev: any) => any, options?: any): () => void;
  addEventListener(event: string, handler: any, options?: any): void;
  removeEventListener(event: string, handler: any, options?: any): void;
  clear(): void;
  destroy(): void;
}

export function createServerHTMLElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attributes = {},
  children: ServerNodeType[] = [],
): ServerHTMLElement<K> {
  const node = createServerNode(ELEMENT_NODE, { tagName: tag.toUpperCase() });
  const base = nodeWithParentExtension(
    nodeWithElementPropertiesExtension(nodeWithChildElementNodesExtension(nodeWithChildNodesExtension(node)) as any),
  );

  const _attributes: Record<string, any> = {};

  const {
    proxy: styleProxy,
    fromString: parseStyle,
    toString: styleToString,
  } = createStyleProxy({
    onUpdate: (key, val) => {
      if (key === "") return; // full string update handled by fromString
      _attributes["style"] = styleToString();
    },
  });

  const { proxy: datasetProxy } = createDatasetProxy(_attributes);
  const { proxy: ariaProxy } = createAriaProxy(_attributes);
  const { proxy: attributesProxy } = createCaseProxy({
    storage: _attributes,
    escapeKeyValue: (key, val) => (key === "style" ? String(val) : escapeHTML(String(val))),
  });

  const originalRemove = (base as any).remove;

  const elementProperties = {
    isSeidrElement: { value: true, enumerable: true },
    dataset: { value: datasetProxy, enumerable: true },
    id: {
      get() {
        return _attributes["id"] ?? "";
      },
      set(v: string) {
        (this as any).setAttribute("id", v);
      },
      enumerable: true,
      configurable: true,
    },
    className: {
      get() {
        return _attributes["class"] ?? "";
      },
      set(v: string) {
        (this as any).setAttribute("class", v);
      },
      enumerable: true,
      configurable: true,
    },
    attributes: { value: attributesProxy, enumerable: true },
    getAttribute: { value: (name: string) => attributesProxy[name] ?? null, enumerable: true },
    setAttribute: {
      value: function (name: string, value: any) {
        const resolved = unwrapSeidr(value);
        if (name === "id") {
          const oldId = _attributes["id"];
          if (oldId) ServerElementMap.delete(oldId);
          const newId = String(resolved);
          _attributes["id"] = newId;
          ServerElementMap.set(newId, this);
        } else if (name === "style") {
          parseStyle(String(resolved));
          _attributes["style"] = styleToString();
        } else if (name === "class" || name === "className") {
          _attributes["class"] = String(resolved);
        } else {
          attributesProxy[name] = resolved;
        }
      },
      enumerable: true,
    },
    removeAttribute: {
      value: (name: string) => {
        if (name === "id") {
          const oldId = _attributes["id"];
          if (oldId) ServerElementMap.delete(oldId);
          delete _attributes["id"];
        } else if (name === "style") {
          parseStyle("");
          delete _attributes["style"];
        } else if (name === "class" || name === "className") {
          delete _attributes["class"];
        } else {
          delete attributesProxy[name];
        }
      },
      enumerable: true,
    },
    hasAttribute: { value: (name: string) => name in _attributes, enumerable: true },
    on: { value: () => () => {}, enumerable: true },
    clear: {
      value: function () {
        while (this.firstChild) {
          this.removeChild(this.firstChild);
        }
      },
      enumerable: true,
    },
    remove: {
      value: function () {
        if ((this as any).clear) (this as any).clear();
        originalRemove.call(this);
      },
      enumerable: true,
      configurable: true,
    },
    destroy: {
      value: function () {
        (this as any).remove();
      },
      enumerable: true,
    },
    addEventListener: { value: () => {}, enumerable: true },
    removeEventListener: { value: () => {}, enumerable: true },
    style: {
      enumerable: true,
      get() {
        return styleProxy;
      },
      set(v: any) {
        const resolved = unwrapSeidr(v);
        if (typeof resolved === "string") {
          parseStyle(resolved);
          _attributes["style"] = styleToString();
        } else if (typeof resolved === "object" && resolved !== null) {
          parseStyle(""); // clear first
          for (const [k, val] of Object.entries(resolved)) {
            (styleProxy as any)[k] = val;
          }
          _attributes["style"] = styleToString();
        }
      },
    },
    classList: {
      enumerable: true,
      get() {
        const el = this as any;
        return {
          add(c: string) {
            const classes = (el.className ?? "").split(" ").filter(Boolean);
            if (!classes.includes(c)) {
              el.className = [...classes, c].join(" ").trim();
            }
          },
          remove(c: string) {
            el.className = (el.className ?? "")
              .split(" ")
              .filter((i: string) => i !== c)
              .join(" ");
          },
          contains(c: string) {
            return (el.className ?? "").split(" ").includes(c);
          },
          toggle(c: string, force?: boolean) {
            const has = this.contains(c);
            const want = force !== undefined ? force : !has;
            if (want !== has) {
              if (want) this.add(c);
              else this.remove(c);
            }
            return want;
          },
          toString() {
            return el.className ?? "";
          },
        };
      },
    },
    toString: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function (this: ServerHTMLElement) {
        return renderElementToString(this);
      },
    },
    innerHTML: {
      get() {
        return (this as any).childNodes.map((c: any) => c.toString()).join("");
      },
      set(v: string) {
        (this as any).clear();
        if (v) {
          (this as any).appendChild(createServerTextNode(v));
        }
      },
      enumerable: true,
      configurable: true,
    },
    textContent: {
      get() {
        return (this as any).childNodes
          .filter((c: any) => c.nodeType === TEXT_NODE)
          .map((c: any) => c.nodeValue)
          .join("");
      },
      set(v: string) {
        (this as any).clear();
        if (v) {
          (this as any).appendChild(createServerTextNode(v));
        }
      },
      enumerable: true,
      configurable: true,
    },
    innerText: {
      get() {
        return (this as any).textContent;
      },
      set(v: string) {
        (this as any).textContent = v;
      },
      enumerable: true,
      configurable: true,
    },
  };

  const element = Object.defineProperties(base, elementProperties);

  // Map common HTML and ARIA properties to attributes
  const commonProps = [
    "href",
    "src",
    "value",
    "type",
    "checked",
    "disabled",
    "readonly",
    "required",
    "placeholder",
    "name",
    "title",
    "alt",
  ];
  const ariaProps = [
    "ariaLabel",
    "ariaLabelledBy",
    "ariaDescribedBy",
    "ariaHidden",
    "ariaExpanded",
    "ariaChecked",
    "ariaDisabled",
    "ariaPressed",
    "ariaModal",
    "ariaHasPopup",
    "ariaCurrent",
    "ariaSelected",
  ];

  for (const prop of commonProps) {
    Object.defineProperty(element, prop, {
      get() {
        return this.getAttribute(prop);
      },
      set(v) {
        this.setAttribute(prop, v);
      },
      enumerable: true,
      configurable: true,
    });
  }

  for (const prop of ariaProps) {
    Object.defineProperty(element, prop, {
      get() {
        return (ariaProxy as any)[prop];
      },
      set(v) {
        (ariaProxy as any)[prop] = v;
      },
      enumerable: true,
      configurable: true,
    });
  }

  // Support dataset properties directly on the element (e.g. element.dataFoo)
  // as per the requirement for element.dataset.inCamelCase support
  // but wait, dataset ALREADY supports that on datasetProxy.
  // The user says "element.dataset.inCamelCase notation as well".
  // Our datasetProxy already handles camelCase.

  // Actually, some code might access element.dataset[prop] where prop is camelCase.
  // Our dataset proxy handles that.

  // Process initial attributes
  for (const [key, value] of Object.entries(attrs)) {
    const resolved = unwrapSeidr(value);
    if (key === "className") element.className = String(resolved);
    else if (key === "id") element.id = String(resolved);
    else if (key === "style") (element as any).style = resolved;
    else if (key === "textContent") element.textContent = String(resolved);
    else if (key === "innerHTML") element.innerHTML = String(resolved);
    else if (key.startsWith("on") && typeof resolved === "function") {
      /* ignore event handlers */
    } else if (key in element) {
      (element as any)[key] = resolved;
    } else element.setAttribute(key, resolved);
  }

  // Children can be passed to createServerHTMLElement
  for (const child of children) {
    element.appendChild(child as any);
  }

  return element as any;
}
