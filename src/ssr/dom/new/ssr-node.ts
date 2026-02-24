import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../../constants";
import { isFn } from "../../../util/type-guards/primitive-types";
import { ServerNodeList } from "../server-node-list";
import type { SupportedNodeTypes } from "./types";

export abstract class SSRNode<T extends SupportedNodeTypes> implements Node {
  readonly ELEMENT_NODE = TYPE_ELEMENT;
  readonly TEXT_NODE = TYPE_TEXT_NODE;
  readonly COMMENT_NODE = TYPE_COMMENT_NODE;
  readonly DOCUMENT_NODE = TYPE_DOCUMENT;

  readonly ATTRIBUTE_NODE = 2;
  readonly CDATA_SECTION_NODE = 4;
  readonly ENTITY_REFERENCE_NODE = 5;
  readonly ENTITY_NODE = 6;
  readonly PROCESSING_INSTRUCTION_NODE = 7;
  readonly DOCUMENT_TYPE_NODE = 10;
  readonly DOCUMENT_FRAGMENT_NODE = 11;
  readonly NOTATION_NODE = 12;

  readonly DOCUMENT_POSITION_DISCONNECTED = 0x01;
  readonly DOCUMENT_POSITION_PRECEDING = 0x02;
  readonly DOCUMENT_POSITION_FOLLOWING = 0x04;
  readonly DOCUMENT_POSITION_CONTAINS = 0x08;
  readonly DOCUMENT_POSITION_CONTAINED_BY = 0x10;
  readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 0x20;

  constructor(protected _ownerDocument?: Document) {}

  protected _parentNode: ParentNode | null = null;

  abstract readonly nodeType: T;

  public readonly childNodes = new ServerNodeList() as unknown as NodeListOf<ChildNode>;

  protected get serverChildNodes(): ServerNodeList {
    return this.childNodes as unknown as ServerNodeList;
  }

  abstract get nodeName(): string;

  abstract get nodeValue(): string | null;

  get parentNode(): ParentNode | null {
    return this._parentNode ?? null;
  }

  protected set parentNode(value: ParentNode | null) {
    this._parentNode = value;
  }

  get ownerDocument(): Document | null {
    if (this._ownerDocument) {
      return this._ownerDocument;
    }
    return this.parentNode?.ownerDocument ?? null;
  }

  protected set ownerDocument(value: Document) {
    this._ownerDocument = value;
  }

  get isConnected(): boolean {
    if (this.nodeType === TYPE_DOCUMENT) return true;
    return !!this.ownerDocument;
  }

  get parentElement(): HTMLElement | null {
    return this.parentNode?.nodeType === TYPE_ELEMENT ? (this.parentNode as HTMLElement) : null;
  }

  get baseURI(): string {
    return "/";
  }

  get nextSibling(): ChildNode | null {
    if (!this.parentNode) {
      return null;
    }
    const siblings = this.parentNode.childNodes as unknown as ServerNodeList;
    if (!siblings) {
      return null;
    }
    const index = siblings.nodes.indexOf(this as unknown as Node);
    if (index === -1) {
      return null;
    }
    return (siblings[index + 1] as unknown as ChildNode) ?? null;
  }

  get previousSibling(): ChildNode | null {
    if (!this.parentNode) {
      return null;
    }
    const siblings = this.parentNode.childNodes as unknown as ServerNodeList;
    if (!siblings) {
      return null;
    }
    const index = siblings.nodes.indexOf(this as unknown as Node);
    if (index === -1) {
      return null;
    }
    return (siblings[index - 1] as unknown as ChildNode) ?? null;
  }

  get firstChild(): ChildNode | null {
    return (this.childNodes[0] as unknown as ChildNode) ?? null;
  }

  get lastChild(): ChildNode | null {
    return (this.childNodes[this.childNodes.length - 1] as unknown as ChildNode) ?? null;
  }

  abstract get textContent(): string | null;

  abstract set textContent(value: string | null);

  cloneNode(_deep?: boolean): Node {
    throw new Error("Method not implemented.");
  }

  isEqualNode(_otherNode: Node | null): boolean {
    throw new Error("Method not implemented.");
  }

  normalize(): void {
    throw new Error("Method not implemented.");
  }

  isSameNode(otherNode: Node | null): boolean {
    return (this as Node) === otherNode;
  }

  compareDocumentPosition(_other: Node): number {
    throw new Error("Method not implemented.");
  }

  isDefaultNamespace(_namespace: string | null): boolean {
    throw new Error("Method not implemented.");
  }

  lookupPrefix(_namespace: string | null): string | null {
    throw new Error("Method not implemented.");
  }

  lookupNamespaceURI(_prefix: string | null): string | null {
    throw new Error("Method not implemented.");
  }

  getRootNode(): Node {
    if (this.parentNode) {
      return this.parentNode.getRootNode();
    }
    return this as unknown as Node;
  }

  hasChildNodes(): boolean {
    return this.childNodes.length > 0;
  }

  appendChild<T extends Node>(node: T): T {
    this.serverChildNodes.nodes.push(node as unknown as Node);
    (node as any).parentNode = this as unknown as ParentNode;
    return node;
  }

  removeChild<T extends Node>(node: T): T {
    this.serverChildNodes.nodes.splice(this.serverChildNodes.nodes.indexOf(node as unknown as Node), 1);
    (node as any).parentNode = null;
    return node;
  }

  replaceChild<T extends Node>(newChild: Node, oldChild: T): T {
    const index = this.serverChildNodes.nodes.indexOf(oldChild as unknown as Node);
    if (index === -1) {
      throw new Error("Reference node not found");
    }
    this.serverChildNodes.nodes[index] = newChild as unknown as Node;
    (newChild as any).parentNode = this as unknown as ParentNode;
    return oldChild;
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    if (!child) {
      return this.appendChild(node);
    }
    const index = this.serverChildNodes.nodes.indexOf(child as unknown as Node);
    if (index === -1) {
      throw new Error("Reference node not found");
    }
    this.serverChildNodes.nodes.splice(index, 0, node as unknown as Node);
    (node as any).parentNode = this as unknown as ParentNode;
    return node;
  }

  contains(other: Node): boolean {
    if (other === (this as unknown as Node)) {
      return true;
    }

    if (!this.childNodes) {
      return false;
    }

    for (const child of this.serverChildNodes.nodes) {
      if (child.contains(other)) {
        return true;
      }
    }

    return false;
  }

  private eventListeners: Map<string, Set<EventListenerOrEventListenerObject>> = new Map();

  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: AddEventListenerOptions | boolean,
  ): void {
    if (!callback) return;
    const listeners = this.eventListeners.get(type) ?? new Set();
    listeners.add(callback);
    this.eventListeners.set(type, listeners);
  }

  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    _options?: EventListenerOptions | boolean,
  ): void {
    if (!callback) return;
    const listeners = this.eventListeners.get(type);
    if (!listeners) return;
    listeners.delete(callback);
  }

  dispatchEvent(event: Event): boolean {
    const listeners = this.eventListeners.get(event.type);
    if (!listeners) return true;
    for (const listener of listeners) {
      if (isFn(listener)) {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
    return true;
  }

  abstract toString(): string;
}
