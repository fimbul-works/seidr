import type { SeidrElementInterface } from "../core/index";
import { isFn, isObj, isStr, unwrapSeidr } from "../core/util";

/**
 * Global map of server-side HTML elements indexed by their ID attribute.
 *
 * This map allows for O(1) lookup of elements by ID during server-side rendering,
 * mirroring the behavior of `document.getElementById()` on the client side.
 *
 * @example
 * ```typescript
 * const div = new ServerHTMLElement("div", { id: "my-div" });
 * const found = ServerElementMap.get("my-div"); // Returns the div element
 * ```
 */
export const ServerElementMap = new Map<string, ServerHTMLElement>();

/**
 * Server-side DOM utilities that mirror the client-side API
 * but generate HTML strings instead of actual DOM elements.
 *
 * @internal
 */
export type Attributes = Record<string, string | number | boolean | null | undefined>;

/**
 * Mock DOMTokenList for classList support on server side.
 *
 * Provides a subset of the DOMTokenList API for manipulating CSS classes
 * during server-side rendering. Changes are tracked via an optional callback.
 *
 * @internal
 * @example
 * ```typescript
 * const classList = new ServerDOMTokenList("foo bar", (value) => {
 *   console.log("Classes changed to:", value);
 * });
 *
 * classList.add("baz"); // Triggers callback with "foo bar baz"
 * classList.toggle("foo"); // Removes "foo", triggers callback
 * ```
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
 *
 * Stores styles as a string since we don't have actual DOM on server.
 * Supports both string assignment (e.g., `element.style = "color: red;"`) and
 * individual property manipulation (e.g., `element.style.color = "red"`).
 *
 * @internal
 * @example
 * ```typescript
 * const style = new ServerCSSStyleDeclaration(
 *   () => "color: blue;",
 *   (s) => console.log("Style set to:", s)
 * );
 *
 * style.setProperty("font-size", "14px"); // Sets style
 * style.getPropertyValue("color"); // Returns "blue"
 * ```
 */
class ServerCSSStyleDeclaration {
  constructor(
    private getStyle: () => string,
    private setStyle: (style: string) => void,
  ) {}

  toString(): string {
    return this.getStyle();
  }

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

/**
 * Server-side HTMLElement implementation for SSR.
 *
 * This class mimics the browser's HTMLElement API but generates HTML strings
 * instead of manipulating actual DOM elements. It's used during server-side
 * rendering to create HTML markup that can be sent to the client.
 *
 * @template T - The HTML tag name (e.g., "div", "span", "button")
 *
 * @example
 * ```typescript
 * const div = new ServerHTMLElement("div", { className: "container" }, [
 *   new ServerHTMLElement("span", { textContent: "Hello" })
 * ]);
 *
 * console.log(div.toString());
 * // Output: <div class="container"><span>Hello</span></div>
 * ```
 *
 * @internal
 */
export class ServerHTMLElement implements SeidrElementInterface {
  /**
   * Internal style storage.
   * @internal
   */
  private _style: string = "";

  /**
   * Internal text content storage.
   * @internal
   */
  private _textContent: string = "";

  /**
   * Internal class name storage.
   * @internal
   */
  private _className: string = "";

  /**
   * Internal inner HTML storage.
   * @internal
   */
  private _innerHTML: string = "";

  /**
   * The HTML tag name (e.g., "DIV", "SPAN", "BUTTON").
   *
   * @type {string}
   * @readonly
   */
  public readonly tagName: string;

  /**
   * CSS style declaration for inline styles.
   *
   * @type {ServerCSSStyleDeclaration}
   */
  public style: ServerCSSStyleDeclaration;

  public parentElement?: ServerHTMLElement;

  get parentNode() {
    return this.parentElement;
  }

  get nextSibling(): any {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this as any);
    return this.parentElement.children[index + 1] || null;
  }

  /**
   * Element ID attribute.
   *
   * Automatically registers the element in {@link ServerElementMap} when set.
   *
   * @type {string | undefined}
   */
  private _id?: string;

  /**
   * Element value property (for inputs, textareas, etc.).
   *
   * @type {string | undefined}
   * @internal
   */
  private _value?: string;

  /**
   * Checked state for checkboxes and radio buttons.
   *
   * @type {boolean | undefined}
   * @internal
   */
  private _checked?: boolean;

  /**
   * Disabled state for form elements.
   *
   * @type {boolean | undefined}
   * @internal
   */
  private _disabled?: boolean;

  /**
   * Readonly state for form elements.
   *
   * @type {boolean | undefined}
   * @internal
   */
  private _readonly?: boolean;

  /**
   * Required state for form elements.
   *
   * @type {boolean | undefined}
   * @internal
   */
  private _required?: boolean;

  /**
   * Input type (e.g., "text", "checkbox", "radio").
   *
   * @type {string | undefined}
   * @internal
   */
  private _type?: string;

  /**
   * Href attribute for anchor tags.
   *
   * @type {string | undefined}
   * @internal
   */
  private _href?: string;

  /**
   * Src attribute for image, script, iframe tags.
   *
   * @type {string | undefined}
   * @internal
   */
  private _src?: string;

  /**
   * Class list for CSS class manipulation.
   *
   * Provides methods to add, remove, toggle, and check for CSS classes.
   *
   * @type {ServerDOMTokenList}
   */
  public classList: ServerDOMTokenList;

  /**
   * Data attributes (data-* attributes).
   *
   * Stores custom data attributes that can be accessed via `dataset-*` properties.
   *
   * @type {Record<string, string>}
   */
  public dataset: Record<string, string> = {};

  /**
   * Internal attributes storage.
   *
   * @type {Attributes}
   * @internal
   */
  private _attributes: Attributes = {};

  /**
   * Create a new server-side HTML element.
   *
   * Initializes a mock HTMLElement for server-side rendering with the given
   * tag name, attributes, and children. Processes Seidr observables by evaluating
   * their current value (no reactive binding on server side).
   *
   * @param {string} tag - HTML tag name (e.g., "div", "span", "button")
   * @param {Attributes} [attrs={}] - Element attributes, properties, and event handlers
   * @param {(ServerHTMLElement | string)[]} [children=[]] - Child elements or text nodes
   * @returns {ServerHTMLElement} A server-side HTML element mock
   *
   * @example
   * Create a div with class and children
   * ```typescript
   * const div = new ServerHTMLElement(
   *   "div",
   *   { className: "container", id: "main" },
   *   [new ServerHTMLElement("span", { textContent: "Hello" })]
   * );
   * ```
   *
   * @example
   * Create an input with reactive binding evaluated
   * ```typescript
   * const disabled = new Seidr(false);
   * const input = new ServerHTMLElement("input", {
   *   type: "text",
   *   disabled, // Automatically evaluates to disabled.value
   *   value: "Initial text"
   * });
   * ```
   */
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

    // Process all attributes
    for (const [key, value] of Object.entries(attrs)) {
      // Handle Seidr observables - evaluate them to get the value
      const resolvedValue = unwrapSeidr(value);

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

  /**
   * Type guard identifying this as a Seidr element.
   *
   * Always returns `true` for ServerHTMLElement instances.
   *
   * @type {true}
   * @readonly
   */
  get isSeidrElement(): true {
    return true;
  }

  /**
   * Element ID attribute.
   *
   * Automatically registers the element in {@link ServerElementMap} when set.
   *
   * @type {string | undefined}
   */
  get id(): string | undefined {
    return this._id;
  }

  /**
   * Set element ID attribute.
   *
   * Automatically removes old ID from {@link ServerElementMap} and registers new ID.
   *
   * @param {string | undefined} id - New ID value
   */
  set id(id: string | undefined) {
    if (this._id) {
      ServerElementMap.delete(this._id);
    }
    this._id = id;
    if (this._id) {
      ServerElementMap.set(this._id, this);
    }
  }

  /**
   * CSS class name.
   *
   * Gets or sets the element's CSS class names. Automatically syncs with `classList`.
   *
   * @type {string}
   */
  get className(): string {
    return this._className;
  }

  /**
   * Set CSS class name.
   *
   * @param {string} value - New class name value
   */
  set className(value: string) {
    this._className = value;
    this.classList.value = value;
  }

  /**
   * Text content of the element.
   *
   * @type {string}
   */
  get textContent(): string {
    return this._textContent;
  }

  /**
   * Set text content of the element.
   *
   * @param {string} value - New text content
   */
  set textContent(value: string) {
    this._textContent = value;
  }

  /**
   * Inner HTML content.
   *
   * @type {string}
   */
  get innerHTML(): string {
    return this._innerHTML;
  }

  /**
   * Set inner HTML content.
   *
   * @param {string} value - New inner HTML
   */
  set innerHTML(value: string) {
    this._innerHTML = value;
  }

  /**
   * Element value (for inputs, textareas, selects, etc.).
   *
   * @type {string | undefined}
   */
  get value(): string | undefined {
    return this._value;
  }

  /**
   * Set element value.
   *
   * @param {string | undefined} value - New value
   */
  set value(value: string | undefined) {
    this._value = value;
  }

  /**
   * Checked state (for checkboxes and radio buttons).
   *
   * @type {boolean | undefined}
   */
  get checked(): boolean | undefined {
    return this._checked;
  }

  /**
   * Set checked state.
   *
   * @param {boolean | undefined} value - New checked state
   */
  set checked(value: boolean | undefined) {
    this._checked = value;
  }

  /**
   * Disabled state (for form elements).
   *
   * @type {boolean | undefined}
   */
  get disabled(): boolean | undefined {
    return this._disabled;
  }

  /**
   * Set disabled state.
   *
   * @param {boolean | undefined} value - New disabled state
   */
  set disabled(value: boolean | undefined) {
    this._disabled = value;
  }

  /**
   * Readonly state (for form elements).
   *
   * @type {boolean | undefined}
   */
  get readonly(): boolean | undefined {
    return this._readonly;
  }

  /**
   * Set readonly state.
   *
   * @param {boolean | undefined} value - New readonly state
   */
  set readonly(value: boolean | undefined) {
    this._readonly = value;
  }

  /**
   * Required state (for form elements).
   *
   * @type {boolean | undefined}
   */
  get required(): boolean | undefined {
    return this._required;
  }

  /**
   * Set required state.
   *
   * @param {boolean | undefined} value - New required state
   */
  set required(value: boolean | undefined) {
    this._required = value;
  }

  /**
   * Input type (e.g., "text", "checkbox", "radio").
   *
   * @type {string | undefined}
   */
  get type(): string | undefined {
    return this._type;
  }

  /**
   * Set input type.
   *
   * @param {string | undefined} value - New input type
   */
  set type(value: string | undefined) {
    this._type = value;
  }

  /**
   * Href attribute (for anchor tags).
   *
   * @type {string | undefined}
   */
  get href(): string | undefined {
    return this._href;
  }

  /**
   * Set href attribute.
   *
   * @param {string | undefined} value - New href value
   */
  set href(value: string | undefined) {
    this._href = value;
  }

  /**
   * Src attribute (for images, scripts, iframes).
   *
   * @type {string | undefined}
   */
  get src(): string | undefined {
    return this._src;
  }

  /**
   * Set src attribute.
   *
   * @param {string | undefined} value - New src value
   */
  set src(value: string | undefined) {
    this._src = value;
  }

  /**
   * Register an event listener (no-op on server side).
   *
   * This method exists for API compatibility but does nothing on the server.
   *
   * @param {string} _event - Event name (ignored)
   * @param {Function} _handler - Event handler (ignored)
   * @param {any} _options - Event listener options (ignored)
   * @returns {() => void} No-op cleanup function
   *
   * @example
   * ```typescript
   * const button = new ServerHTMLElement("button");
   * const cleanup = button.on("click", () => console.log("clicked"));
   * cleanup(); // Does nothing on server side
   * ```
   */
  on(_event: string, _handler: (ev: any) => any, _options?: any): () => void {
    return () => {};
  }

  /**
   * Add an event listener (no-op on server side).
   *
   * This method exists for API compatibility but does nothing on the server.
   *
   * @param {string} _event - Event name (ignored)
   * @param {any} _handler - Event handler (ignored)
   * @param {any} [_options] - Event listener options (ignored)
   * @returns {void}
   */
  addEventListener(_event: string, _handler: any, _options?: any): void {
    // No-op on server side
  }

  /**
   * Remove an event listener (no-op on server side).
   *
   * This method exists for API compatibility but does nothing on the server.
   *
   * @param {string} _event - Event name (ignored)
   * @param {any} _handler - Event handler (ignored)
   * @param {any} [_options] - Event listener options (ignored)
   * @returns {void}
   */
  removeEventListener(_event: string, _handler: any, _options?: any): void {
    // No-op on server side
  }

  /**
   * Append a child element or text node to this element.
   *
   * @param {ServerHTMLElement | string} child - Child element or text node to append
   * @returns {void}
   *
   * @example
   * ```typescript
   * const parent = new ServerHTMLElement("div");
   * const child = new ServerHTMLElement("span", { textContent: "Hello" });
   * parent.appendChild(child);
   * ```
   */
  appendChild(child: ServerHTMLElement | string) {
    this.children.push(child);
    if (isObj(child) && child !== null) {
      child.parentElement = this;
    }
  }

  /**
   * Insert a child element before another child element.
   *
   * @param {ServerHTMLElement | string} child - Child element to insert
   * @param {ServerHTMLElement | string} currentChild - Reference child element to insert before
   * @returns {void}
   * @throws {Error} When currentChild is not found in children array
   *
   * @example
   * ```typescript
   * const parent = new ServerHTMLElement("div", {}, [
   *   new ServerHTMLElement("span", { textContent: "World" })
   * ]);
   * const hello = new ServerHTMLElement("span", { textContent: "Hello " });
   * parent.insertBefore(hello, parent.children[0]);
   * ```
   */
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

  /**
   * Remove a child element from this element's children.
   *
   * @param {ServerHTMLElement | string} child - Child element to remove
   * @returns {void}
   *
   * @example
   * ```typescript
   * const parent = new ServerHTMLElement("div", {}, [
   *   new ServerHTMLElement("span", { textContent: "Remove me" })
   * ]);
   * parent.removeChild(parent.children[0]);
   * ```
   */
  removeChild(child: ServerHTMLElement | string): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      if (isObj(child) && child !== null) {
        child.parentElement = undefined;
      }
    }
  }

  /**
   * Remove all children from this element.
   *
   * Calls `remove()` on all child elements and clears the children array.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const parent = new ServerHTMLElement("div", {}, [
   *   new ServerHTMLElement("span", { textContent: "Child 1" }),
   *   new ServerHTMLElement("span", { textContent: "Child 2" })
   * ]);
   * parent.clear(); // All children removed
   * ```
   */
  clear() {
    this.children.forEach((child) => {
      if (isObj(child) && child !== null) {
        child.remove();
      }
    });
    this.children = [];
  }

  /**
   * Remove this element from its parent.
   *
   * Removes this element from its parent's children array and clears all children.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const parent = new ServerHTMLElement("div", {}, [
   *   new ServerHTMLElement("span", { textContent: "Remove me" })
   * ]);
   * parent.children[0].remove(); // Span removed from parent
   * ```
   */
  remove(): void {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
    this.clear();
    this.parentElement = undefined;
  }

  /**
   * Get the value of an attribute.
   *
   * Returns the value of the specified attribute, or `null` if the attribute
   * doesn't exist or has no value.
   *
   * @param {string} name - Name of the attribute to get
   * @returns {string | null} Attribute value or null
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div", {
   *   id: "my-div",
   *   className: "container",
   *   disabled: true
   * });
   * div.getAttribute("id"); // Returns: "my-div"
   * div.getAttribute("class"); // Returns: "container"
   * div.getAttribute("disabled"); // Returns: "true"
   * div.getAttribute("nonexistent"); // Returns: null
   * ```
   */
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

  /**
   * Set an attribute value.
   *
   * Sets the specified attribute to the given value. Undefined values are rejected.
   * Special handling for "class" attribute (also sets className property).
   *
   * @param {string} name - Name of the attribute to set
   * @param {any} value - Value to set the attribute to
   * @returns {void}
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div");
   * div.setAttribute("id", "my-div");
   * div.setAttribute("class", "container");
   * div.setAttribute("disabled", true);
   * ```
   */
  setAttribute(name: string, value: any): void {
    // Reject undefined values
    if (value === undefined) return;

    const attrName = name === "class" ? "className" : name;
    this._attributes[attrName] = value;
    if (attrName === "className") {
      this.className = value;
    }
  }

  /**
   * Check if an attribute exists.
   *
   * @param {string} name - Name of the attribute to check
   * @returns {boolean} True if attribute exists
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div", { id: "my-div" });
   * div.hasAttribute("id"); // Returns: true
   * div.hasAttribute("class"); // Returns: false
   * ```
   */
  hasAttribute(name: string): boolean {
    return name in this._attributes;
  }

  /**
   * Remove an attribute.
   *
   * @param {string} name - Name of the attribute to remove
   * @returns {void}
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div", { id: "my-div", className: "container" });
   * div.removeAttribute("id");
   * div.getAttribute("id"); // Returns: null
   * ```
   */
  removeAttribute(name: string): void {
    const attrName = name === "class" ? "className" : name;
    delete this._attributes[attrName];
  }

  /**
   * Query for the first matching element (not implemented).
   *
   * This method exists for API compatibility but always returns `null`.
   *
   * @param {string} _selector - CSS selector (ignored)
   * @returns {ServerHTMLElement | null} Always returns null
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div");
   * div.querySelector(".class"); // Returns: null
   * ```
   */
  querySelector(_selector: string): ServerHTMLElement | null {
    // Simplified - return null for now
    // Could implement basic selector support if needed
    return null;
  }

  /**
   * Check if element contains a child.
   *
   * @param {any} node - Node to check
   * @returns {boolean} True if node is a child/descendant
   */
  contains(node: any): boolean {
    if (node === this) return true;
    return this.children.some(
      (child) => child === node || (child instanceof ServerHTMLElement && child.contains(node)),
    );
  }

  /**
   * Query for all matching elements (not implemented).
   *
   * This method exists for API compatibility but always returns an empty array.
   *
   * @param {string} _selector - CSS selector (ignored)
   * @returns {ServerHTMLElement[]} Always returns empty array
   *
   * @example
   * ```typescript
   * const div = new ServerHTMLElement("div");
   * div.querySelectorAll(".class"); // Returns: []
   * ```
   */
  querySelectorAll(_selector: string): ServerHTMLElement[] {
    // Simplified - return empty array for now
    // Could implement basic selector support if needed
    return [];
  }

  /**
   * Simulate a click event (no-op on server side).
   *
   * This method exists for API compatibility but does nothing on the server.
   *
   * @param {...unknown[]} _args - Click arguments (ignored)
   * @returns {void}
   */
  click(..._args: unknown[]) {}

  /**
   * Convert the element to an HTML string.
   *
   * Generates complete HTML markup including opening tag, attributes, children,
   * and closing tag. Handles self-closing void elements (e.g., `<img/>`, `<br/>`)
   * and escapes HTML entities in attribute values and text content.
   *
   * @returns {string} HTML string representation of this element and all descendants
   *
   * @example
   * Basic element
   * ```typescript
   * const div = new ServerHTMLElement("div", { className: "container" });
   * div.toString(); // Returns: '<div class="container"></div>'
   * ```
   *
   * @example
   * Element with children
   * ```typescript
   * const div = new ServerHTMLElement("div", {}, [
   *   new ServerHTMLElement("span", { textContent: "Hello" })
   * ]);
   * div.toString(); // Returns: '<div><span>Hello</span></div>'
   * ```
   *
   * @example
   * Self-closing void element
   * ```typescript
   * const img = new ServerHTMLElement("img", { src: "/image.png" });
   * img.toString(); // Returns: '<img src="/image.png" />'
   * ```
   *
   * @example
   * HTML escaping for security
   * ```typescript
   * const div = new ServerHTMLElement("div", {
   *   textContent: '<script>alert("XSS")</script>'
   * });
   * div.toString();
   * // Returns: '<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>'
   * ```
   */
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
      // Skip functions
      if (isFn(value)) continue;

      // Skip empty - and className
      if (value === null || value === false || key === "className") continue;

      if (value === true) {
        attrEntries.push(key);
      } else {
        const attrName = key === "className" ? "class" : key;
        attrEntries.push(`${attrName}="${this.escapeHtml(String(value))}"`);
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

    const camelToKebabCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

    // Add dataset attributes (data-*)
    for (const [key, value] of Object.entries(this.dataset)) {
      if (value != null) {
        const dataAttrName = key.startsWith("data-") ? key : `data-${camelToKebabCase(key)}`;
        attrEntries.push(`${dataAttrName}="${this.escapeHtml(String(value))}"`);
      }
    }

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
   *
   * Converts special characters that have meaning in HTML to their
   * HTML entity equivalents to prevent injection and ensure proper rendering.
   *
   * @param {string} text - Text to escape special characters from
   * @returns {string} Escaped text safe for HTML attribute or content usage
   *
   * @example
   * ```typescript
   * escapeHtml('<script>alert("XSS")</script>');
   * // Returns: "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
   * ```
   */
  escapeHtml(text: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
}

/**
 * Server-side Comment implementation for SSR.
 * @internal
 */
export class ServerComment {
  public parentElement?: ServerHTMLElement;
  constructor(public text: string) {}

  get parentNode() {
    return this.parentElement;
  }

  get nextSibling(): any {
    if (!this.parentElement) return null;
    const index = this.parentElement.children.indexOf(this as any);
    return this.parentElement.children[index + 1] || null;
  }

  toString() {
    return `<!--${this.text}-->`;
  }
  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this as any);
    }
  }
}
