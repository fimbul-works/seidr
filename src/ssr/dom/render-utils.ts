import { type Seidr, unwrapSeidr } from "../../seidr";
import { escapeHTML } from "../../util/html";
import { camelToKebab, kebabToCamel } from "../../util/string";
import { isEmpty } from "../../util/type-guards";

export { camelToKebab, kebabToCamel };

/**
 * Renders a style value (string or object) to a semicolon-separated string.
 */
export function renderStyle(style: string | Seidr<string> | Record<string, string>): string {
  if (!style) return "";
  const resolved = unwrapSeidr<any>(style);
  if (typeof resolved === "string") return resolved.trim();
  if (typeof resolved === "object") {
    return (
      Object.entries(resolved)
        .map(([k, v]) => [camelToKebab(k), unwrapSeidr(v)])
        .filter(([_, v]) => !isEmpty(v))
        .map(([k, v]) => `${k}:${v}`)
        .join(";") + (Object.keys(resolved).length > 0 ? ";" : "")
    );
  }
  return String(resolved);
}

export function parseStyleString(style: string): Record<string, string> {
  return style.split(";").reduce(
    (acc, s) => {
      const firstColon = s.indexOf(":");
      if (firstColon === -1) return acc;
      const k = s.slice(0, firstColon).trim();
      const v = s.slice(firstColon + 1).trim();
      if (k && v) acc[k] = v;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function flattenStyleObject(style: Record<string, string | Seidr<string>>): string {
  const entries = Object.entries(style);
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k}:${unwrapSeidr(v)}`).join(";") + ";";
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
