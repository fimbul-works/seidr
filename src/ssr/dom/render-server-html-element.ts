import { escapeHTML } from "../../util/html";
import { renderAttribute, renderDataset, renderStyle } from "./render-utils";

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
export function renderElementToString(
  tag: string,
  props: {
    id?: string;
    className?: string;
    style?: any;
    dataset?: Record<string, any>;
    attributes?: Record<string, any>;
    innerHTML?: string;
  },
): string {
  const tagName = tag.toLowerCase();
  const attrParts: string[] = [];

  // 1. Core attributes
  const idAttr = props.id ? `id="${escapeHTML(props.id)}"` : null;
  if (idAttr) attrParts.push(idAttr);

  const classAttr = props.className ? `class="${escapeHTML(props.className)}"` : null;
  if (classAttr) attrParts.push(classAttr);

  const styleStr = renderStyle(props.style);
  const styleAttr = styleStr ? `style="${styleStr}"` : null;
  if (styleAttr) attrParts.push(styleAttr);

  // 2. Dataset
  if (props.dataset) {
    attrParts.push(...renderDataset(props.dataset));
  }

  // 3. Other attributes
  if (props.attributes) {
    for (const [name, value] of Object.entries(props.attributes)) {
      if (["id", "class", "className", "style"].includes(name)) continue;
      // Skip data attributes as they are handled by props.dataset
      if (props.dataset && name.startsWith("data-")) continue;

      const attr = renderAttribute(name, value);
      if (attr) attrParts.push(attr);
    }
  }

  const attrs = attrParts.length > 0 ? " " + attrParts.join(" ") : "";

  if (VOID_ELEMENTS.has(tagName)) {
    return `<${tagName}${attrs} />`;
  }

  return `<${tagName}${attrs}>${props.innerHTML || ""}</${tagName}>`;
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
