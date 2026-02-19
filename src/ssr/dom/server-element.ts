import { TYPE_ELEMENT, TYPE_PROP } from "../../constants";
import { escapeAttribute } from "../../util/escape";
import { camelToKebab } from "../../util/string";
import { isComment } from "../../util/type-guards/dom-node-types";
import { isEmpty, isObj } from "../../util/type-guards/primitive-types";
import { createCaseProxy } from "./case-proxy";
import { createServerNode } from "./server-node";
import type { ServerNodeList } from "./server-node-list";
import { applyParentNodeMethods } from "./server-parent-node";
import { createServerTextNode } from "./server-text-node";
import type { ServerDocument, ServerElement } from "./types";

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

const INTERNAL_ATTRIBUTES = new Set([
  "nodeType",
  "tagName",
  "ownerDocument",
  "isConnected",

  "parentNode",
  "parentElement",
  "nextSibling",
  "previousSibling",

  "childNodes",

  "append",
  "prepend",
  "appendChild",
  "insertBefore",
  "replaceChildren",
  "removeChild",

  "attributes",
  "hasAttribute",
  "getAttribute",
  "setAttribute",
  "removeAttribute",

  "dataset",

  "style",
  "className",
  "classList",

  "innerHTML",
  "textContent",

  "addEventListener",
  "removeEventListener",

  "toString",

  "getElementById",
  "getElementsByTagName",
  "getElementsByClassName",
  "querySelector",
  "querySelectorAll",

  TYPE_PROP,
  "on",
  "clear",
  "remove",
]);

/**
 * Creates a server-side element.
 */
export function createServerElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  ownerDocument: ServerDocument | null = null,
): ServerElement<K> {
  const element = applyParentNodeMethods(createServerNode(TYPE_ELEMENT, ownerDocument)) as ServerElement<K>;
  const tag = tagName.toUpperCase() as K;

  let attributes: Record<string, any> = {};

  const datasetProxy = createCaseProxy({
    prefix: "data-",
    dropPrefix: true,
    storage: attributes,
  });

  const styleStorage: Record<string, string> = {};

  const styleProxy = createCaseProxy({
    storage: styleStorage,
    serialize: (s) => {
      const parts = Object.entries(s)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}: ${v}`);
      return parts.length > 0 ? `${parts.join("; ")};` : "";
    },
    parse: (val) => {
      const obj: Record<string, string> = {};
      if (!val) return obj;
      val.split(";").forEach((s) => {
        const parts = s.split(":");
        if (parts.length >= 2) {
          const k = parts[0].trim();
          const v = parts.slice(1).join(":").trim();
          if (k && v) obj[k] = v;
        }
      });
      return obj;
    },
  });

  const styleObj = new Proxy(styleProxy.proxy, {
    get(target, prop, receiver) {
      if (prop === "toString") {
        return () => styleProxy.toString();
      }

      if (prop === "setProperty") {
        return (key: string, value: string) => {
          if (key === "cssText") {
            styleProxy.fromString(value);
          } else {
            target[key as any] = value;
          }
        };
      }

      if (prop === "getPropertyValue") {
        return (key: string) => target[key as any];
      }

      if (prop === "removeProperty") {
        return (key: string) => {
          delete target[key as any];
          return "";
        };
      }

      if (prop === "cssText") {
        return styleProxy.toString();
      }

      // Emulate browser behavior for unknown properties
      if (!(prop in target)) {
        return "";
      }

      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      if (prop === "cssText") {
        styleProxy.fromString(value);
        return true;
      }

      return Reflect.set(target, prop, value, receiver);
    },
  });

  const classList = {
    add: (...classes: string[]) => {
      const current = element.className.split(/\s+/).filter(Boolean);
      classes.forEach((c) => {
        if (!current.includes(c)) current.push(c);
      });
      element.className = current.join(" ");
    },
    remove: (...classes: string[]) => {
      const current = element.className.split(/\s+/).filter(Boolean);
      const filtered = current.filter((c) => !classes.includes(c));
      element.className = filtered.join(" ");
    },
    toggle: (cls: string, force?: boolean) => {
      const current = element.className.split(/\s+/).filter(Boolean);
      const exists = current.includes(cls);
      const next = force !== undefined ? force : !exists;
      if (next) {
        if (!exists) element.classList.add(cls);
      } else {
        if (exists) element.classList.remove(cls);
      }
      return next;
    },
    contains: (cls: string) => element.className.split(/\s+/).includes(cls),
    toString: () => element.className,
  } as DOMTokenList;

  Object.defineProperties(element, {
    tagName: {
      get: () => tag,
      enumerable: true,
    },
    id: {
      get: () => attributes.id ?? "",
      set: (val) => {
        if (val) attributes.id = String(val);
        else delete attributes.id;
      },
    },
    className: {
      get: () => attributes.class ?? "",
      set: (val) => {
        if (val) attributes.class = String(val);
        else delete attributes.class;
      },
    },
    classList: {
      get: () => classList,
    },
    attributes: {
      get: () => attributes,
      set: (value: Record<string, any>) => {
        attributes = value;
      },
    },
    dataset: {
      get: () => datasetProxy.proxy,
    },
    style: {
      get: () => styleObj,
      set: (val: any) => {
        if (typeof val === "string") {
          styleProxy.fromString(val);
        } else if (isObj(val)) {
          // Clear and copy
          Object.keys(styleStorage).forEach((k) => delete styleStorage[k]);
          Object.assign(styleProxy.proxy, val);
        }
      },
    },
    innerHTML: {
      get: () => (element.childNodes as ServerNodeList).serverNodes.map((c) => c.toString()).join(""),
      set: (val) => {
        (element.childNodes as ServerNodeList).serverNodes.length = 0;
        if (val) {
          // For SSR, setting innerHTML is mostly used for raw HTML injection.
          // We'll treat it as a special text-like node that renders raw.
          const raw = createServerTextNode(String(val));
          raw.toString = () => String(val);
          element.appendChild(raw);
        }
      },
    },
    outerHTML: {
      get: () => element.toString(),
    },
    textContent: {
      get: () =>
        (element.childNodes as ServerNodeList).serverNodes
          .filter((child) => !isComment(child))
          .map((c) => c.textContent || "")
          .join(""),
      set: (val: string | null) => {
        (element.childNodes as ServerNodeList).serverNodes.length = 0;
        if (!isEmpty(val)) {
          element.appendChild(createServerTextNode(String(val)));
        }
      },
    },
    setAttribute: {
      get: () => (name: string, value: any) => {
        attributes[name.toLowerCase()] = value;
      },
    },
    getAttribute: {
      get: () => (name: string) => {
        const attr = name.toLowerCase();
        if (attr === "style") {
          return styleProxy.toString() ?? null;
        }
        return attributes[attr] ?? null;
      },
    },
    hasAttribute: {
      get: () => (name: string) => {
        return name.toLowerCase() in attributes;
      },
    },
    removeAttribute: {
      get: () => (name: string) => {
        delete attributes[name.toLowerCase()];
      },
    },
    matches: {
      get: () => (selector: string) => {
        if (!selector) return false;
        if (selector === "*") return true;

        // Attribute selector
        if (selector.startsWith("[") && selector.endsWith("]")) {
          const content = selector.slice(1, -1);
          if (content.includes("=")) {
            const [name, value] = content.split("=");
            const unquoted = value.replace(/^["']|["']$/g, "");
            return element.getAttribute(name) === unquoted;
          }
          return element.hasAttribute(content);
        }

        // Very basic selector parser
        if (selector.startsWith("#")) {
          return element.id === selector.slice(1);
        }
        if (selector.startsWith(".")) {
          return element.classList.contains(selector.slice(1));
        }

        const tagName = element.tagName;
        return tagName?.toLowerCase() === selector.toLowerCase();
      },
    },
    toString: {
      value: () => {
        const styleStr = styleProxy.toString();

        if (styleStr) {
          attributes.style = styleStr;
        }

        const activeBoolAttributes = BOOL_ATTRIBUTES.filter(
          (p) => attributes[p] !== undefined && attributes[p] !== false,
        ).map((p) => p.toLowerCase());

        const attrs = [
          ...Object.entries(attributes)
            .filter(([name]) => !BOOL_ATTRIBUTES.some((p) => p === name.toLowerCase()))
            .map(([name, value]) => `${name}="${escapeAttribute(String(value))}"`),
          ...activeBoolAttributes,
        ]
          .sort() // Deterministic output for testing
          .join(" ");

        const attrStr = attrs ? ` ${attrs}` : "";

        // Self-closing tags
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

        if (selfClosing.includes(tagName.toLowerCase())) {
          return `<${tagName}${attrStr} />`;
        }

        const children = (element.childNodes as ServerNodeList).serverNodes.map((c) => c.toString()).join("");

        return `<${tagName}${attrStr}>${children}</${tagName}>`;
      },
    },
    addEventListener: {
      get: () => () => {},
    },
    removeEventListener: {
      get: () => () => {},
    },
  });

  const proxy = new Proxy(element, {
    get(target, prop, receiver) {
      if (typeof prop !== "string") {
        return Reflect.get(target, prop, receiver);
      }

      // if (prop === "__isProxy") return true;
      // if (prop === "__target") return target;

      if (prop in target || INTERNAL_ATTRIBUTES.has(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      // Handle camelCase aria* and data* properties
      let effectiveProp = prop;
      if (prop.startsWith("aria") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
        effectiveProp = camelToKebab(prop);
      } else if (prop.startsWith("data") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
        effectiveProp = camelToKebab(prop);
      }

      const val = target.getAttribute(effectiveProp);
      if (BOOL_ATTRIBUTES.includes(effectiveProp.toLowerCase())) {
        return val === "true" || val === "" || target.hasAttribute(effectiveProp);
      }

      return val;
    },
    set(target, prop, value, receiver) {
      if (typeof prop !== "string") {
        return Reflect.set(target, prop, value, receiver);
      }

      if (prop in target || INTERNAL_ATTRIBUTES.has(prop)) {
        return Reflect.set(target, prop, value, receiver);
      }

      // Handle camelCase aria* and data* properties
      let effectiveProp = prop;
      if (prop.startsWith("aria") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
        effectiveProp = camelToKebab(prop);
      } else if (prop.startsWith("data") && prop.length > 4 && prop[4] === prop[4].toUpperCase()) {
        effectiveProp = camelToKebab(prop);
      }

      if (BOOL_ATTRIBUTES.includes(effectiveProp.toLowerCase())) {
        if (value === true || value === "true" || value === "") {
          target.setAttribute(effectiveProp, true);
        } else {
          target.removeAttribute(effectiveProp);
        }
        return true;
      }

      target.setAttribute(effectiveProp, value);
      return true;
    },
  });

  return proxy;
}
