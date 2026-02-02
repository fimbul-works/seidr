import { escapeAttribute } from "../../element/escape-utils";
import { ELEMENT_NODE } from "../../types";
import { createCaseProxy } from "./case-proxy";
import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import { createServerTextNode } from "./text";
import type { ServerNode, ServerParentNode } from "./types";

export type ServerElement<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap> = ServerParentNode &
  ServerNode &
  InternalServerNode & {
    tagName: K;
    id: string;
    className: string;
    style: any;
    dataset: any;
    attributes: Record<string, string>;
    classList: DOMTokenList;
    innerHTML: string;
    setAttribute(name: string, value: string): void;
    getAttribute(name: string): string | null;
    hasAttribute(name: string): boolean;
    removeAttribute(name: string): void;
  };

/**
 * Creates a server-side element.
 */
export function createServerElement<K extends keyof HTMLElementTagNameMap>(tagName: K): ServerElement {
  const node = createServerNode(ELEMENT_NODE) as ServerElement;
  node.tagName = tagName.toUpperCase() as K;

  const _attributes: Record<string, string> = {};
  node.attributes = _attributes;

  // dataset proxy
  const datasetProxy = createCaseProxy({
    prefix: "data-",
    dropPrefix: true,
    storage: _attributes as any,
  });
  node.dataset = datasetProxy.proxy;

  // style proxy
  const styleStorage: Record<string, string> = {};
  const styleProxy = createCaseProxy({
    storage: styleStorage as any,
    serialize: (s) => {
      return Object.entries(s)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");
    },
  });
  node.style = new Proxy(styleProxy.proxy, {
    get(target, prop, receiver) {
      if (prop === "setProperty") {
        return (key: string, value: string) => {
          target[key as any] = value;
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
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver);
    },
  });

  Object.defineProperties(node, {
    id: {
      get: () => _attributes["id"] ?? "",
      set: (val) => {
        if (val) _attributes["id"] = String(val);
        else delete _attributes["id"];
      },
    },
    className: {
      get: () => _attributes["class"] ?? "",
      set: (val) => {
        if (val) _attributes["class"] = String(val);
        else delete _attributes["class"];
      },
    },
    innerHTML: {
      get: () => node._childNodes.map((c) => c.toString()).join(""),
      set: (val) => {
        node._childNodes.length = 0;
        if (val) {
          // For SSR, setting innerHTML is mostly used for raw HTML injection.
          // We'll treat it as a special text-like node that renders raw.
          const raw = createServerTextNode(String(val));
          raw.toString = () => String(val);
          node.appendChild(raw);
        }
      },
    },
    classList: {
      get: () => {
        return {
          add: (...classes: string[]) => {
            const current = node.className.split(/\s+/).filter(Boolean);
            classes.forEach((c) => {
              if (!current.includes(c)) current.push(c);
            });
            node.className = current.join(" ");
          },
          remove: (...classes: string[]) => {
            const current = node.className.split(/\s+/).filter(Boolean);
            const filtered = current.filter((c) => !classes.includes(c));
            node.className = filtered.join(" ");
          },
          toggle: (cls: string, force?: boolean) => {
            const current = node.className.split(/\s+/).filter(Boolean);
            const exists = current.includes(cls);
            const next = force !== undefined ? force : !exists;
            if (next) {
              if (!exists) node.classList.add(cls);
            } else {
              if (exists) node.classList.remove(cls);
            }
            return next;
          },
          contains: (cls: string) => node.className.split(/\s+/).includes(cls),
          toString: () => node.className,
        } as DOMTokenList;
      },
    },
    textContent: {
      get: () => node._childNodes.map((c) => c.textContent || "").join(""),
      set: (val: string | null) => {
        node._childNodes.length = 0;
        if (val !== null) {
          node.appendChild(createServerTextNode(String(val)));
        }
      },
    },
  });

  node.setAttribute = (name, value) => {
    _attributes[name.toLowerCase()] = String(value);
  };

  node.getAttribute = (name) => {
    if (name.toLowerCase() === "style") {
      return styleProxy.toString() || null;
    }
    return _attributes[name.toLowerCase()] ?? null;
  };

  node.hasAttribute = (name) => {
    return name.toLowerCase() in _attributes;
  };

  node.removeAttribute = (name) => {
    delete _attributes[name.toLowerCase()];
  };

  node.toString = () => {
    const styleStr = styleProxy.toString();
    if (styleStr) {
      _attributes["style"] = styleStr;
    }

    const boolProps = ["disabled", "checked", "selected", "readOnly", "required", "multiple", "hidden", "autofocus"];
    const activeBoolAttributes = boolProps.filter((p) => (node as any)[p] === true).map((p) => p.toLowerCase());

    const attrs = [
      ...Object.entries(_attributes).map(([name, value]) => `${name}="${escapeAttribute(value)}"`),
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

    const children = node._childNodes.map((c) => c.toString()).join("");
    return `<${tagName}${attrStr}>${children}</${tagName}>`;
  };

  return applyParentNodeMethods(node);
}
