/**
 * Server-side DOM utilities that mirror the client-side API
 * but generate HTML strings instead of actual DOM elements.
 */
export type Attributes = Record<string, string | number | boolean | null | undefined>;

export interface ServerElement {
  tagName: string;
  attributes: Attributes;
  children: (ServerElement | string)[];
  toString(): string;
}

export class ServerHTMLElement implements ServerElement {
  constructor(
    public tagName: string,
    public attributes: Attributes = {},
    public children: (ServerElement | string)[] = [],
  ) {}

  toString(): string {
    const attrs = Object.entries(this.attributes)
      .filter(([_, value]) => value != null && value !== false)
      .map(([key, value]) => {
        if (value === true) return key;
        // Convert className to class for HTML
        const attrName = key === "className" ? "class" : key;
        return `${attrName}="${escapeHtml(String(value))}"`;
      })
      .join(" ");

    const openTag = attrs ? `<${this.tagName} ${attrs}>` : `<${this.tagName}>`;

    // Self-closing tags
    const voidElements = [
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
      "source",
      "track",
      "wbr",
    ];
    if (voidElements.includes(this.tagName)) {
      return openTag.replace(">", " />");
    }

    const childHtml = this.children
      .map((child) => (typeof child === "string" ? escapeHtml(child) : child.toString()))
      .join("");

    return `${openTag}${childHtml}</${this.tagName}>`;
  }
}

/**
 * Escape special HTML characters.
 * @param text - Text to escape special characters from
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Server-side element creator that mirrors the client-side API
 */
export const createElement = <K extends string>(
  tagName: K,
  props?: Attributes,
  children?: (ServerElement | string)[],
): ServerElement => new ServerHTMLElement(tagName, { ...props }, children || []);

/**
 * Server-side component interface
 */
export interface ServerComponent<T> {
  html: string;
  hydrationData?: T;
}

/**
 * Create a server-rendered component
 */
export function serverComponent<T>(factory: () => ServerElement, hydrationData?: T): ServerComponent<T> {
  return {
    html: factory().toString(),
    hydrationData,
  };
}
