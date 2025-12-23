import type { CleanupFunction } from "../../types.js";
import type { SeidrElementInterface } from "../element.js";

/**
 * Server-side DOM utilities that mirror the client-side API
 * but generate HTML strings instead of actual DOM elements.
 */
export type Attributes = Record<string, string | number | boolean | null | undefined>;

export class ServerHTMLElement implements SeidrElementInterface {
  public style: string = "";
  public parentElement?: ServerHTMLElement;

  constructor(
    public tagName: string,
    public attributes: Attributes = {},
    public children: (ServerHTMLElement | string)[] = [],
  ) {}

  get isSeidrElement(): true {
    return true;
  }

  on(_event: string, _handler: (ev: any) => any, _options?: any): CleanupFunction {
    return () => {};
  }

  appendChild(child: ServerHTMLElement) {
    child.parentElement = this;
    this.children.push(child);
  }

  insertBefore(child: ServerHTMLElement, currentChild: ServerHTMLElement | string) {
    const index = this.children.indexOf(currentChild);
    if (index === -1) {
      throw new Error("Cannot insert before non-existing child");
    }
    child.parentElement = this;
    this.children.splice(index, 0, child);
  }

  clear() {
    this.children.forEach((child) => child instanceof ServerHTMLElement && child.remove());
    this.children = [];
  }

  remove(): void {
    this.clear();
    this.parentElement = undefined;
  }

  destroy(): void {
    this.remove();
  }

  toString(): string {
    const attrs = Object.entries(this.attributes)
      .filter(([_, value]) => value != null && value !== false)
      .map(([key, value]) => {
        if (value === true) return key;
        // Convert className to class for HTML
        const attrName = key === "className" ? "class" : key;
        return `${attrName}="${this.escapeHtml(String(value))}"`;
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
      .map((child) => (typeof child === "string" ? this.escapeHtml(child) : child.toString()))
      .join("");

    return `${openTag}${childHtml}</${this.tagName}>`;
  }

  /**
   * Escape special HTML characters.
   * @param text - Text to escape special characters from
   * @returns Escaped text
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
