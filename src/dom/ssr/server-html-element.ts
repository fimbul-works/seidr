import type { CleanupFunction } from "../../types.js";
import { isObj, isSeidr, isStr } from "../../util/is.js";
import type { SeidrElementInterface } from "../element.js";

export const ServerElementMap = new Map<string, ServerHTMLElement>();

/**
 * Server-side DOM utilities that mirror the client-side API
 * but generate HTML strings instead of actual DOM elements.
 */
export type Attributes = Record<string, string | number | boolean | null | undefined>;

/**
 * Mock DOMTokenList for classList support on server side.
 */
class ServerDOMTokenList {
  private classes: Set<string>;
  private updateCallback?: (value: string) => void;

  constructor(classValue: string = "", updateCallback?: (value: string) => void) {
    this.classes = new Set(classValue.split(" ").filter(Boolean));
    this.updateCallback = updateCallback;
  }

  contains(className: string): boolean {
    return this.classes.has(className);
  }

  add(className: string): void {
    this.classes.add(className);
    this.notifyUpdate();
  }

  toggle(className: string, force?: boolean): boolean {
    if (force === true) {
      this.classes.add(className);
      this.notifyUpdate();
      return true;
    } else if (force === false) {
      this.classes.delete(className);
      this.notifyUpdate();
      return false;
    }

    if (this.classes.has(className)) {
      this.classes.delete(className);
      this.notifyUpdate();
      return false;
    } else {
      this.classes.add(className);
      this.notifyUpdate();
      return true;
    }
  }

  remove(className: string): void {
    this.classes.delete(className);
    this.notifyUpdate();
  }

  toString(): string {
    return Array.from(this.classes).join(" ");
  }

  get value(): string {
    return this.toString();
  }

  set value(val: string) {
    this.classes = new Set(val.split(" ").filter(Boolean));
    this.notifyUpdate();
  }

  private notifyUpdate() {
    if (this.updateCallback) {
      this.updateCallback(this.toString());
    }
  }
}

/**
 * Mock CSSStyleDeclaration for server-side rendering.
 * Stores styles as a string since we don't have actual DOM on server.
 */
class ServerCSSStyleDeclaration {
  constructor(
    private getStyle: () => string,
    private setStyle: (style: string) => void,
  ) {}

  // Support string assignment (e.g., element.style = "color: red;")
  toString(): string {
    return this.getStyle();
  }

  // Support individual properties (e.g., element.style.color = "red")
  setProperty(property: string, value: string): void {
    const currentStyle = this.getStyle();
    const styles = currentStyle
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const colonIndex = s.indexOf(":");
        if (colonIndex === -1) return null;
        return [s.slice(0, colonIndex).trim(), s.slice(colonIndex + 1).trim()] as [string, string];
      })
      .filter((parts): parts is [string, string] => parts !== null);

    const styleMap = new Map<string, string>(styles);
    styleMap.set(property, value);

    this.setStyle(
      Array.from(styleMap.entries())
        .map(([k, v]) => `${k}: ${v}`)
        .join("; "),
    );
  }

  getPropertyValue(property: string): string {
    const currentStyle = this.getStyle();
    const styles = currentStyle
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const colonIndex = s.indexOf(":");
        if (colonIndex === -1) return null;
        return [s.slice(0, colonIndex).trim(), s.slice(colonIndex + 1).trim()] as [string, string];
      })
      .filter((parts): parts is [string, string] => parts !== null);

    const styleMap = new Map<string, string>(styles);
    return styleMap.get(property) || "";
  }
}

export class ServerHTMLElement implements SeidrElementInterface {
  // Internal storage
  private _style: string = "";
  private _textContent: string = "";
  private _className: string = "";
  private _innerHTML: string = "";

  // Public properties matching HTMLElement interface
  public readonly tagName: string;
  public style: ServerCSSStyleDeclaration;
  public parentElement?: ServerHTMLElement;
  private _id?: string;
  private _value?: string;
  private _checked?: boolean;
  private _disabled?: boolean;
  private _readonly?: boolean;
  private _required?: boolean;
  private _type?: string;
  private _href?: string;
  private _src?: string;

  public classList: ServerDOMTokenList;
  public dataset: Record<string, string> = {};

  constructor(
    tag: string,
    attrs: Attributes = {},
    public children: (ServerHTMLElement | string)[] = [],
  ) {
    this.tagName = tag.toUpperCase();

    // Initialize style with custom CSSStyleDeclaration
    this.style = new ServerCSSStyleDeclaration(
      () => this._style,
      (style) => (this._style = style),
    );

    // Initialize classList with callback to update className
    this.classList = new ServerDOMTokenList("", (value) => {
      this._className = value;
    });

    // Initialize attributes and process special properties
    this._attributes = {};

    // Process all attributes
    for (const [key, value] of Object.entries(attrs)) {
      // Handle Seidr observables - evaluate them to get the value
      const resolvedValue = isSeidr(value) ? value.value : value;

      // Handle special properties that shouldn't be attributes
      if (key === "className") {
        this._className = String(resolvedValue);
        this.classList.value = this._className;
      } else if (key === "textContent") {
        this._textContent = String(resolvedValue);
      } else if (key === "innerHTML") {
        this._innerHTML = String(resolvedValue);
      } else if (key === "id") {
        this._id = String(resolvedValue);
      } else if (key === "value") {
        this._value = String(resolvedValue);
      } else if (key === "checked") {
        this._checked = Boolean(resolvedValue);
      } else if (key === "disabled") {
        this._disabled = Boolean(resolvedValue);
      } else if (key === "readonly") {
        this._readonly = Boolean(resolvedValue);
      } else if (key === "required") {
        this._required = Boolean(resolvedValue);
      } else if (key === "type") {
        this._type = String(resolvedValue);
      } else if (key === "href") {
        this._href = String(resolvedValue);
      } else if (key === "src") {
        this._src = String(resolvedValue);
      } else if (key === "style") {
        this._style = String(resolvedValue);
      } else {
        // Regular attribute
        this._attributes[key] = resolvedValue;
      }
    }
  }

  get isSeidrElement(): true {
    return true;
  }

  get id(): string | undefined {
    return this._id;
  }

  set id(id: string | undefined) {
    if (this._id) {
      ServerElementMap.delete(this._id);
    }
    this._id = id;
    if (this._id) {
      ServerElementMap.set(this._id, this);
    }
  }

  get className(): string {
    return this._className;
  }

  set className(value: string) {
    this._className = value;
    this.classList.value = value;
  }

  get textContent(): string {
    return this._textContent;
  }

  set textContent(value: string) {
    this._textContent = value;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }

  set innerHTML(value: string) {
    this._innerHTML = value;
  }

  get value(): string | undefined {
    return this._value;
  }

  set value(value: string | undefined) {
    this._value = value;
  }

  get checked(): boolean | undefined {
    return this._checked;
  }

  set checked(value: boolean | undefined) {
    this._checked = value;
  }

  get disabled(): boolean | undefined {
    return this._disabled;
  }

  set disabled(value: boolean | undefined) {
    this._disabled = value;
  }

  get readonly(): boolean | undefined {
    return this._readonly;
  }

  set readonly(value: boolean | undefined) {
    this._readonly = value;
  }

  get required(): boolean | undefined {
    return this._required;
  }

  set required(value: boolean | undefined) {
    this._required = value;
  }

  get type(): string | undefined {
    return this._type;
  }

  set type(value: string | undefined) {
    this._type = value;
  }

  get href(): string | undefined {
    return this._href;
  }

  set href(value: string | undefined) {
    this._href = value;
  }

  get src(): string | undefined {
    return this._src;
  }

  set src(value: string | undefined) {
    this._src = value;
  }

  // Internal attributes storage
  private _attributes: Attributes = {};

  on(_event: string, _handler: (ev: any) => any, _options?: any): CleanupFunction {
    return () => {};
  }

  addEventListener(_event: string, _handler: any, _options?: any): void {
    // No-op on server side
  }

  removeEventListener(_event: string, _handler: any, _options?: any): void {
    // No-op on server side
  }

  appendChild(child: ServerHTMLElement | string) {
    this.children.push(child);
    if (isObj(child) && child !== null) {
      child.parentElement = this;
    }
  }

  insertBefore(child: ServerHTMLElement | string, currentChild: ServerHTMLElement | string) {
    const index = this.children.indexOf(currentChild);
    if (index === -1) {
      throw new Error("Cannot insert before non-existing child");
    }
    this.children.splice(index, 0, child);
    if (isObj(child) && child !== null) {
      child.parentElement = this;
    }
  }

  removeChild(child: ServerHTMLElement | string): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      if (isObj(child) && child !== null) {
        child.parentElement = undefined;
      }
    }
  }

  clear() {
    this.children.forEach((child) => {
      if (isObj(child) && child !== null) {
        child.remove();
      }
    });
    this.children = [];
  }

  remove(): void {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
    this.clear();
    this.parentElement = undefined;
  }

  getAttribute(name: string): string | null {
    if (name === "class") {
      return this._className || null;
    }
    if (name === "id") {
      return this._id || null;
    }
    if (name === "style") {
      return this._style || null;
    }
    if (name === "value") {
      return this._value || null;
    }
    if (name === "checked") {
      return this._checked ? "true" : null;
    }
    if (name === "disabled") {
      return this._disabled ? "true" : null;
    }
    if (name === "readonly") {
      return this._readonly ? "true" : null;
    }
    if (name === "required") {
      return this._required ? "true" : null;
    }
    if (name === "type") {
      return this._type || null;
    }
    if (name === "href") {
      return this._href || null;
    }
    if (name === "src") {
      return this._src || null;
    }
    const value = this._attributes[name];
    return value != null ? String(value) : null;
  }

  setAttribute(name: string, value: string): void {
    const attrName = name === "class" ? "className" : name;
    this._attributes[attrName] = value;
    if (attrName === "className") {
      this.className = value;
    }
  }

  hasAttribute(name: string): boolean {
    return name in this._attributes;
  }

  removeAttribute(name: string): void {
    const attrName = name === "class" ? "className" : name;
    delete this._attributes[attrName];
  }

  querySelector(_selector: string): ServerHTMLElement | null {
    // Simplified - return null for now
    // Could implement basic selector support if needed
    return null;
  }

  querySelectorAll(_selector: string): ServerHTMLElement[] {
    // Simplified - return empty array for now
    // Could implement basic selector support if needed
    return [];
  }

  click(..._args: unknown[]) {}

  toString(): string {
    // Build attributes string
    const attrEntries: string[] = [];

    // Add id
    if (this._id) {
      attrEntries.push(`id="${this.escapeHtml(this._id)}"`);
    }

    // Add class
    if (this._className) {
      attrEntries.push(`class="${this.escapeHtml(this._className)}"`);
    }

    // Add style
    if (this._style) {
      attrEntries.push(`style="${this.escapeHtml(this._style)}"`);
    }

    // Add other attributes
    for (const [key, value] of Object.entries(this._attributes)) {
      if (value != null && value !== false && key !== "className") {
        if (value === true) {
          attrEntries.push(key);
        } else {
          const attrName = key === "className" ? "class" : key;
          attrEntries.push(`${attrName}="${this.escapeHtml(String(value))}"`);
        }
      }
    }

    // Add special properties that should be attributes
    if (this._value !== undefined) attrEntries.push(`value="${this.escapeHtml(String(this._value))}"`);
    if (this._checked !== undefined && this._checked) attrEntries.push("checked");
    if (this._disabled !== undefined && this._disabled) attrEntries.push("disabled");
    if (this._readonly !== undefined && this._readonly) attrEntries.push("readonly");
    if (this._required !== undefined && this._required) attrEntries.push("required");
    if (this._type !== undefined) attrEntries.push(`type="${this.escapeHtml(this._type)}"`);
    if (this._href !== undefined) attrEntries.push(`href="${this.escapeHtml(this._href)}"`);
    if (this._src !== undefined) attrEntries.push(`src="${this.escapeHtml(this._src)}"`);

    const attrs = attrEntries.filter(Boolean).join(" ");
    const openTag = attrs ? `<${this.tagName.toLocaleLowerCase()} ${attrs}>` : `<${this.tagName.toLowerCase()}>`;

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

    if (voidElements.includes(this.tagName.toLocaleLowerCase())) {
      return openTag.replace(">", " />");
    }

    // Build inner HTML
    let innerHtml = this._innerHTML;

    if (!innerHtml) {
      // Combine textContent and children
      const parts: string[] = [];

      if (this._textContent) {
        parts.push(this.escapeHtml(this._textContent));
      }

      if (this.children.length > 0) {
        parts.push(...this.children.map((child) => (isStr(child) ? this.escapeHtml(child) : child.toString())));
      }

      innerHtml = parts.join("");
    }

    // Always return closing tag for non-void elements
    return `${openTag}${innerHtml}</${this.tagName.toLocaleLowerCase()}>`;
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
