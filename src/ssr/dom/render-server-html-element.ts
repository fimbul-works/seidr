import { renderAttribute, renderDataset, renderStyle } from "./render-utils";
import type { ServerHTMLElement } from "./server-html-element";

/**
 * Void elements that do not have a closing tag.
 */
export const VOID_ELEMENTS = new Set([
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
]);

/**
 * Renders the full element to string.
 */
export function renderElementToString<K extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap>(
  el: ServerHTMLElement<K>,
): string {
  const tagName = el.tagName.toLowerCase();
  const attrParts: string[] = [];

  const attributesProxy = (el as any).attributes;
  if (attributesProxy && typeof attributesProxy.toString === "function") {
    const attrs = attributesProxy.toString();
    if (attrs) attrParts.push(attrs);
  } else {
    // Fallback for modular nodes or nodes without a CaseProxy
    if (el.id) {
      const idAttr = renderAttribute("id", el.id);
      if (idAttr) attrParts.push(idAttr);
    }
    if (el.className) {
      const classAttr = renderAttribute("className", el.className);
      if (classAttr) attrParts.push(classAttr);
    }
    const styleStr = renderStyle((el as any).style);
    if (styleStr) attrParts.push(`style="${styleStr}"`);

    if ((el as any).dataset) {
      attrParts.push(...renderDataset((el as any).dataset));
    }

    // Other common attributes that might be directly on the node
    const common = ["href", "src", "type", "value", "name", "title", "placeholder"];
    for (const key of common) {
      const val = (el as any)[key];
      if (val !== undefined && val !== null) {
        const attr = renderAttribute(key, val);
        if (attr) attrParts.push(attr);
      }
    }
  }

  const attrs = attrParts.length > 0 ? " " + attrParts.join(" ") : "";

  if (VOID_ELEMENTS.has(tagName)) {
    return `<${tagName}${attrs} />`;
  }

  return `<${tagName}${attrs}>${el.innerHTML || ""}</${tagName}>`;
}

/**
 * Helper to render just the opening tag.
 */
export function renderOpeningTag(tag: string, attrParts: string[]): string {
  const tagName = tag.toLowerCase();
  const attrs = attrParts.length > 0 ? " " + attrParts.join(" ") : "";
  const isVoid = VOID_ELEMENTS.has(tagName);
  return `<${tagName}${attrs}${isVoid ? " /" : ""}>`;
}

/**
 * Helper to render the closing tag.
 */
export function renderClosingTag(tag: string): string {
  const tagName = tag.toLowerCase();
  if (VOID_ELEMENTS.has(tagName)) return "";
  return `</${tagName}>`;
}
