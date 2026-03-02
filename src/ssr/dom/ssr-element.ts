import { TYPE_ELEMENT } from "../../constants";
import type { NodeTypeElement } from "../../types";
import { escapeAttribute } from "../../util/escape";
import { camelToKebab, str } from "../../util/string";
import { isComment } from "../../util/type-guards/dom-node-types";
import { isFn } from "../../util/type-guards/primitive-types";
import type { SSRDocument } from "./ssr-document";
import type { SSRNodeList } from "./ssr-node-list";
import { SSRParentNode } from "./ssr-parent-node";
import { SSRTextNode } from "./ssr-text-node";

const INTERNAL_ATTRIBUTES = new Set(["innerHTML", "outerHTML", "textContent", "classList", "style", "dataset"]);

const BOOL_ATTRIBUTES = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "compact",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "noresize",
  "noshade",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "truespeed",
];

export class SSRElement<K extends keyof HTMLElementTagNameMap | string = keyof HTMLElementTagNameMap | string>
  extends SSRParentNode<NodeTypeElement, SSRDocument>
  implements Partial<Element>
{
  readonly nodeType = TYPE_ELEMENT;
  public readonly tagName: K;
  public readonly lowerTagName: K;

  get mockElement(): HTMLElement {
    return this as unknown as HTMLElement;
  }

  private _attributes: Record<string, any> = {};
  private _styleStorage: Record<string, string> = {};
  private _styleProxy: CSSStyleDeclaration;

  public readonly dataset: DOMStringMap;
  public readonly classList: DOMTokenList;

  constructor(tagName: K, ownerDocument?: SSRDocument) {
    super(ownerDocument);
    this.tagName = tagName.toUpperCase() as unknown as K;
    this.lowerTagName = tagName.toLowerCase() as unknown as K;

    // Initialize style proxy
    this._styleProxy = this._createStyleProxy();
    // Initialize dataset proxy
    this.dataset = this._createDatasetProxy();
    // Initialize classList
    this.classList = this._createClassList();

    // Return a Proxy of the element to allow arbitrary property assignment
    // biome-ignore lint/correctness/noConstructorReturn: Proxy for attributes
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop === "__isProxy") return true;
        if (prop === "__target") return target;

        if (typeof prop !== "string") {
          return Reflect.get(target, prop, receiver);
        }

        if (prop in target || INTERNAL_ATTRIBUTES.has(prop)) {
          return Reflect.get(target, prop, receiver);
        }

        const sProp = prop as string;

        // Handle aria- properties: el.ariaLabel -> aria-label
        if (sProp.startsWith("aria") && sProp.length > 4 && sProp[4] === sProp[4].toUpperCase()) {
          return target.getAttribute(camelToKebab(sProp));
        }

        // Handle boolean attributes: return boolean instead of string
        if (BOOL_ATTRIBUTES.includes(sProp.toLowerCase())) {
          return target.hasAttribute(sProp);
        }

        return target.getAttribute(sProp);
      },
      set(target, prop, value, receiver) {
        if (typeof prop !== "string") {
          return Reflect.set(target, prop, value, receiver);
        }

        if (prop in target || INTERNAL_ATTRIBUTES.has(prop)) {
          return Reflect.set(target, prop, value, receiver);
        }

        const sProp = prop as string;

        // Handle aria- properties
        if (sProp.startsWith("aria") && sProp.length > 4 && sProp[4] === sProp[4].toUpperCase()) {
          target.setAttribute(camelToKebab(sProp), value);
          return true;
        }

        // Handle boolean attributes
        if (BOOL_ATTRIBUTES.includes(sProp.toLowerCase())) {
          if (value === true || value === "true" || value === "") {
            target.setAttribute(sProp, true);
          } else {
            target.removeAttribute(sProp);
          }
          return true;
        }

        // Sync with attributes for arbitrary props
        target.setAttribute(sProp, value);

        // Allow arbitrary property assignment
        (target as any)[prop] = value;
        return true;
      },
    }) as any;
  }

  get nodeName(): K {
    return this.tagName;
  }
  get nodeValue(): null {
    return null;
  }
  get ownerDocument(): Document {
    return this._ownerDocument!.mockDocument;
  }

  get id(): string {
    return this.getAttribute("id") || "";
  }
  set id(value: string) {
    const oldID = this.getAttribute("id");
    if (oldID) {
      this._ownerDocument?.idMap.delete(oldID);
    }
    if (value) {
      this._ownerDocument?.idMap.set(value, this);
    }
    this.setAttribute("id", value);
  }

  get style(): CSSStyleDeclaration {
    return this._styleProxy;
  }

  set style(val: any) {
    if (typeof val === "string") {
      this._styleProxy.cssText = val;
    } else if (val && typeof val === "object") {
      Object.keys(this._styleStorage).forEach((k) => delete this._styleStorage[k]);
      Object.assign(this._styleProxy, val);
    }
  }

  get className(): string {
    return this.getAttribute("class") || "";
  }
  set className(value: string) {
    this.setAttribute("class", value);
  }

  get textContent(): string {
    const children = this.childNodes as unknown as SSRNodeList;
    return children.nodes
      .filter((node) => !isComment(node))
      .map((node) => node.textContent ?? "")
      .join("");
  }

  set textContent(value: string | null) {
    const children = this.childNodes as unknown as SSRNodeList;
    children.nodes.length = 0;
    if (value !== null && value !== undefined) {
      this.appendChild(new SSRTextNode(str(value), this._ownerDocument!));
    }
  }

  get innerHTML(): string {
    const children = this.childNodes as unknown as SSRNodeList;
    return children.nodes.map((c) => c.toString()).join("");
  }

  set innerHTML(val: string) {
    const children = this.childNodes as unknown as SSRNodeList;
    children.nodes.length = 0;
    if (val) {
      // In SSR, we often just want raw HTML. We can use a text node that doesn't escape.
      const raw = new SSRTextNode(str(val), this._ownerDocument!);
      (raw as any).toString = () => str(val);
      this.appendChild(raw);
    }
  }

  get outerHTML(): string {
    return this.toString();
  }

  setAttribute(name: string, value: any): void {
    this._attributes[name.toLowerCase()] = value;
  }

  getAttribute(name: string): any | null {
    const attr = name.toLowerCase();
    if (attr === "style") {
      const s = this._serializeStyle();
      return s || null;
    }
    const val = this._attributes[attr];
    return val === undefined ? null : val;
  }

  hasAttribute(name: string): boolean {
    return name.toLowerCase() in this._attributes;
  }

  removeAttribute(name: string): void {
    delete this._attributes[name.toLowerCase()];
  }

  matches(selector: string): boolean {
    if (!selector) return false;
    if (selector === "*") return true;

    if (selector.startsWith("#")) return this.id === selector.slice(1);
    if (selector.startsWith(".")) return this.classList.contains(selector.slice(1));

    if (selector.startsWith("[") && selector.endsWith("]")) {
      const content = selector.slice(1, -1);
      if (content.includes("=")) {
        const [n, v] = content.split("=");
        const unquoted = v.replace(/^["']|["']$/g, "");
        return str(this.getAttribute(n)) === unquoted;
      }
      return this.hasAttribute(content);
    }

    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  toString(): string {
    const styleStr = this._serializeStyle();
    const currentStyle = this._attributes.style;
    if (styleStr) this._attributes.style = styleStr;

    const attrs = Object.entries(this._attributes)
      .filter(([, value]) => !isFn(value))
      .filter(
        ([name]) =>
          !BOOL_ATTRIBUTES.includes(name.toLowerCase()) ||
          (this._attributes[name] !== false && this._attributes[name] !== undefined),
      )
      .map(([name, value]) => {
        if (BOOL_ATTRIBUTES.includes(name.toLowerCase())) return name.toLowerCase();
        return `${name}="${escapeAttribute(str(value))}"`;
      })
      .sort(([a], [b]) => a.localeCompare(b))
      .join(" ");

    if (styleStr) {
      if (currentStyle === undefined) delete this._attributes.style;
      else this._attributes.style = currentStyle;
    }

    const attrStr = attrs ? ` ${attrs}` : "";

    const selfClosing = [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ];

    if (selfClosing.includes(this.lowerTagName)) {
      return `<${this.lowerTagName}${attrStr} />`;
    }

    return `<${this.lowerTagName}${attrStr}>${this.innerHTML}</${this.lowerTagName}>`;
  }

  private _serializeStyle(): string {
    const parts = Object.entries(this._styleStorage)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}: ${v}`);
    return parts.length > 0 ? `${parts.join("; ")};` : "";
  }

  private _createStyleProxy(): CSSStyleDeclaration {
    const storage = this._styleStorage;
    const self = this;
    return new Proxy({} as any, {
      get(_, prop) {
        if (typeof prop !== "string") return Reflect.get(storage, prop);
        if (prop === "toString") return () => self._serializeStyle();
        if (prop === "cssText") return self._serializeStyle();
        if (prop === "setProperty") return (k: string, v: string) => (storage[k] = v);
        if (prop === "getPropertyValue") return (k: string) => storage[k];
        if (prop === "removeProperty") return (k: string) => delete storage[k];

        if (prop in storage) return storage[prop];
        return storage[camelToKebab(prop)] || "";
      },
      set(_, prop, value) {
        if (typeof prop !== "string") return Reflect.set(storage, prop, value);
        if (prop === "cssText") {
          Object.keys(storage).forEach((k) => delete storage[k]);
          str(value)
            .split(";")
            .forEach((s: string) => {
              const parts = s.split(":");
              if (parts.length >= 2) {
                const k = parts[0].trim();
                const v = parts.slice(1).join(":").trim();
                if (k && v) storage[camelToKebab(k)] = v;
              }
            });
          return true;
        }

        storage[camelToKebab(prop)] = str(value);
        return true;
      },
    });
  }

  private _createDatasetProxy(): DOMStringMap {
    const attrs = this._attributes;
    return new Proxy({} as any, {
      get(_, prop) {
        if (typeof prop !== "string") return undefined;
        return attrs[`data-${camelToKebab(prop)}`];
      },
      set(_, prop, value) {
        if (typeof prop !== "string") return false;
        attrs[`data-${camelToKebab(prop)}`] = value;
        return true;
      },
    });
  }

  private _createClassList(): DOMTokenList {
    return {
      add: (...classes: string[]) => {
        const current = this.className.split(/\s+/).filter(Boolean);
        classes.forEach((c) => {
          if (!current.includes(c)) current.push(c);
        });
        this.className = current.join(" ");
      },
      remove: (...classes: string[]) => {
        const current = this.className.split(/\s+/).filter(Boolean);
        this.className = current.filter((c) => !classes.includes(c)).join(" ");
      },
      contains: (cls: string) => this.className.split(/\s+/).includes(cls),
      toggle: (cls: string, force?: boolean) => {
        const exists = this.classList.contains(cls);
        const next = force !== undefined ? force : !exists;
        if (next) this.classList.add(cls);
        else this.classList.remove(cls);
        return next;
      },
      toString: () => this.className,
    } as any;
  }
}
