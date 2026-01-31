import { unwrapSeidr } from "../../seidr";
import { escapeHTML } from "../../util/html";
import { isHTMLElement, isObj, isStr } from "../../util/type-guards";
import { renderElementToString } from "./render-server-html-element";
import { camelToKebab, kebabToCamel, renderStyle } from "./render-utils";
import { createServerNode } from "./server-node";
import { ELEMENT_NODE, type NodeTypeElement, type ServerNodeType } from "./types";
import { nodeWithChildElementNodesExtension, type ServerNodeWithChildElementNodes } from "./with-child-elements";
import { nodeWithChildNodesExtension } from "./with-child-nodes";
import { nodeWithElementPropertiesExtension, type ServerElementPropertiesExtension } from "./with-element-properties";
import { nodeWithParentExtension, type ServerNodeWithParent } from "./with-parent";

/**
 * Global map of server-side HTML elements indexed by their ID attribute.
 */
export const ServerElementMap = new Map<string, any>();

export type Attributes = Record<string, any>;

export interface ServerHTMLElement
  extends ServerNodeWithParent<NodeTypeElement>,
    ServerNodeWithChildElementNodes<NodeTypeElement>,
    ServerElementPropertiesExtension {
  tagName: string;
  id?: string;
  className: string;
  classList: any;
  style: any;
  dataset: Record<string, string>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: any): void;
  removeAttribute(name: string): void;
  hasAttribute(name: string): boolean;
  on(event: string, handler: (ev: any) => any, options?: any): () => void;
  addEventListener(event: string, handler: any, options?: any): void;
  removeEventListener(event: string, handler: any, options?: any): void;
  isSeidrElement: true;
}

export function createServerHTMLElement(
  tag: string,
  attrs: Attributes = {},
  children: ServerNodeType[] = [],
): ServerHTMLElement {
  const node = createServerNode(ELEMENT_NODE, { tagName: tag.toUpperCase() });
  const base = nodeWithParentExtension(
    nodeWithElementPropertiesExtension(nodeWithChildElementNodesExtension(nodeWithChildNodesExtension(node)) as any),
  );

  // Actually children can be passed as 3rd arg
  for (const child of children) {
    base.appendChild(child);
  }

  const _attributes: Record<string, any> = {};
  const _styleObj: Record<string, string> = {};
  const originalRemove = (base as any).remove;

  const parseStyle = (style: string) => {
    // Clear existing
    for (const k in _styleObj) delete _styleObj[k];
    style.split(";").forEach((s) => {
      const firstColon = s.indexOf(":");
      if (firstColon === -1) return;
      const k = s.slice(0, firstColon).trim();
      const v = s.slice(firstColon + 1).trim();
      if (k && v) _styleObj[k] = v;
    });
  };

  const flattenStyle = () => {
    const entries = Object.entries(_styleObj);
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}:${v}`).join(";") + ";";
  };

  const syncStyle = () => {
    _attributes["style"] = flattenStyle();
  };

  const styleProxy = new Proxy(_styleObj, {
    get(target, prop) {
      if (prop === "setProperty") {
        return (p: string, v: string) => {
          target[camelToKebab(p)] = String(v);
          syncStyle();
        };
      }
      if (prop === "getPropertyValue") {
        return (p: string) => target[camelToKebab(p)] || "";
      }
      if (prop === "removeProperty") {
        return (p: string) => {
          delete target[camelToKebab(p)];
          syncStyle();
        };
      }
      if (prop === "toString") {
        return () => flattenStyle();
      }
      if (typeof prop === "string") {
        return target[camelToKebab(prop)];
      }
      return undefined;
    },
    set(target, prop, value) {
      if (typeof prop === "string") {
        target[camelToKebab(prop)] = String(value);
        syncStyle();
        return true;
      }
      return false;
    },
    ownKeys(target) {
      return Object.keys(target).map((k) => kebabToCamel(k));
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === "string") {
        const kebab = camelToKebab(prop);
        if (kebab in target) {
          return { enumerable: true, configurable: true, value: target[kebab] };
        }
      }
      return undefined;
    },
  });

  const datasetProxy = new Proxy(_attributes, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      const attrName = "data-" + camelToKebab(prop).replace(/^data-/, "");
      return target[attrName];
    },
    set(target, prop, value) {
      if (typeof prop !== "string") return false;
      const attrName = "data-" + camelToKebab(prop).replace(/^data-/, "");
      target[attrName] = value;
      return true;
    },
    ownKeys(target) {
      return Object.keys(target)
        .filter((k) => k.startsWith("data-"))
        .map((k) => kebabToCamel(k.slice(5)));
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop !== "string") return undefined;
      const attrName = "data-" + camelToKebab(prop).replace(/^data-/, "");
      if (attrName in target) {
        return { enumerable: true, configurable: true, value: target[attrName] };
      }
      return undefined;
    },
  });

  const elementProperties = {
    isSeidrElement: { value: true, enumerable: true },
    dataset: { value: datasetProxy, enumerable: true },
    id: {
      get() {
        return _attributes["id"] ?? "";
      },
      set(v: string) {
        this.setAttribute("id", v);
      },
      enumerable: true,
      configurable: true,
    },
    className: {
      get() {
        return _attributes["class"] ?? "";
      },
      set(v: string) {
        this.setAttribute("class", v);
      },
      enumerable: true,
      configurable: true,
    },
    getAttribute: { value: (name: string) => _attributes[name] ?? null, enumerable: true },
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
          const val = String(resolved);
          parseStyle(val);
          _attributes["style"] = val;
        } else if (name === "class" || name === "className") {
          const val = String(resolved);
          _attributes["class"] = val;
          _attributes["className"] = val;
        } else {
          _attributes[name] = resolved;
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
          for (const k in _styleObj) delete _styleObj[k];
          delete _attributes["style"];
        } else if (name === "class" || name === "className") {
          delete _attributes["class"];
          delete _attributes["className"];
        } else {
          delete _attributes[name];
        }
      },
      enumerable: true,
    },
    hasAttribute: { value: (name: string) => name in _attributes, enumerable: true },
    on: { value: () => () => {}, enumerable: true },
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
        this.remove();
      },
      enumerable: true,
      configurable: true,
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
          _attributes["style"] = resolved;
        } else if (typeof resolved === "object" && resolved !== null) {
          for (const k in _styleObj) delete _styleObj[k];
          for (const [k, val] of Object.entries(resolved)) {
            _styleObj[camelToKebab(k)] = String(unwrapSeidr(val));
          }
          syncStyle();
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
        return renderElementToString(this.tagName, {
          id: this.id,
          className: this.className,
          style: flattenStyle(),
          dataset: datasetProxy,
          attributes: _attributes,
          innerHTML: this.innerHTML,
        });
      },
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
    const attrName = camelToKebab(prop);
    Object.defineProperty(element, prop, {
      get() {
        return this.getAttribute(attrName);
      },
      set(v) {
        this.setAttribute(attrName, v);
      },
      enumerable: true,
      configurable: true,
    });
  }

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

  return element as any;
}
