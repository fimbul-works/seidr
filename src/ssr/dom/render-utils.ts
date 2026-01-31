import { unwrapSeidr } from "../../seidr";
import { escapeHTML } from "../../util/html";

/**
 * Converts camelCase string to kebab-case.
 */
export function camelToKebab(str: string): string {
  if (str.startsWith("data") && str.length > 4 && str[4] === str[4].toUpperCase()) {
    return (
      "data-" +
      str
        .slice(4)
        .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        .replace(/^-/, "")
    );
  }
  const kebab = str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  if (kebab.startsWith("webkit-") || kebab.startsWith("moz-") || kebab.startsWith("ms-")) {
    return "-" + kebab;
  }
  return kebab;
}

/**
 * Converts kebab-case string to camelCase.
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Renders a style value (string or object) to a semicolon-separated string.
 */
export function renderStyle(style: any): string {
  if (!style) return "";
  const resolved = unwrapSeidr(style);
  if (typeof resolved === "string") return resolved.trim();
  if (typeof resolved === "object") {
    return Object.entries(resolved)
      .filter(([_, v]) => v != null)
      .map(([k, v]) => `${camelToKebab(k)}:${unwrapSeidr(v)}`)
      .join(";");
  }
  return String(resolved);
}

/**
 * Renders dataset object to data-* attributes string.
 */
export function renderDataset(dataset: Record<string, any>): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(dataset)) {
    const resolved = unwrapSeidr(value);
    if (resolved == null || resolved === false) continue;

    const attrName = key.startsWith("data-") ? key : `data-${camelToKebab(key)}`;
    if (resolved === true) {
      parts.push(attrName);
    } else {
      parts.push(`${attrName}="${escapeHTML(String(resolved))}"`);
    }
  }
  return parts;
}

/**
 * Renders a single attribute to string.
 */
export function renderAttribute(name: string, value: any): string | null {
  const resolved = unwrapSeidr(value);
  if (resolved == null || resolved === false) return null;

  const attrName = name === "className" ? "class" : camelToKebab(name);

  if (resolved === true) return attrName;
  return `${attrName}="${escapeHTML(String(resolved))}"`;
}
