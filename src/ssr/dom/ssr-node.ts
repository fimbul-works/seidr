import { TYPE_COMMENT_NODE, TYPE_DOCUMENT, TYPE_ELEMENT, TYPE_TEXT_NODE } from "../../constants";
import { isFn } from "../../util/type-guards/primitive-types";
import type { SSRDocument } from "./ssr-document";
import { SSRNodeList } from "./ssr-node-list";
import type { SupportedNodeTypes } from "./types";

export abstract class SSRNode<T extends SupportedNodeTypes, D extends SSRDocument | null = SSRDocument | null>
  implements Node
{
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

  constructor(protected _ownerDocument: D = null as D) {}

  protected _parentNode: ParentNode | null = null;

  abstract readonly nodeType: T;

  public readonly childNodes = new SSRNodeList() as unknown as NodeListOf<ChildNode>;

  protected get serverChildNodes(): SSRNodeList {
    return this.childNodes as unknown as SSRNodeList;
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
      return this._ownerDocument.mockDocument;
    }
    return this.parentNode?.ownerDocument ?? null;
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
    const siblings = this.parentNode.childNodes as unknown as SSRNodeList;
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
    const siblings = this.parentNode.childNodes as unknown as SSRNodeList;
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

  isEqualNode(otherNode: Node | null): boolean {
    if (!otherNode) return false;
    if (this.nodeType !== otherNode.nodeType) return false;
    if (this.nodeType === 3 || this.nodeType === 8) {
      return (this as any).data === (otherNode as any).data;
    }
    if (this.nodeType === 1) {
      const elA = this as unknown as Element;
      const elB = otherNode as unknown as Element;
      if (elA.tagName !== elB.tagName) return false;
      return true;
    }
    return false;
  }

  normalize(): void {
    const nodes = this.serverChildNodes.nodes;
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i];
      const next = nodes[i + 1];
      if (current.nodeType === 3 && next.nodeType === 3) {
        (current as Text).data += (next as Text).data;
        nodes.splice(i + 1, 1);
        (next as any).parentNode = null;
        i--;
      }
    }
  }

  isSameNode(otherNode: Node | null): boolean {
    if (!otherNode) return false;
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
    return this.serverChildNodes.nodes.length > 0;
  }

  contains(other: Node | null): boolean {
    if (!other) return false;
    if (this.isSameNode(other)) return true;
    for (const child of this.serverChildNodes.nodes) {
      if ((child as any).contains?.(other)) return true;
    }
    return false;
  }

  appendChild<T extends Node>(node: T): T {
    return this.insertBefore(node, null);
  }

  removeChild<T extends Node>(node: T): T {
    const target = (node as any).__target || node;
    const nodes = this.serverChildNodes.nodes;
    const index = nodes.findIndex((n) => ((n as any).__target || n) === target);

    if (index === -1) {
      throw new Error("The node to be removed is not a child of this node.");
    }

    nodes.splice(index, 1);
    (target as any).parentNode = null;
    return node;
  }

  replaceChild<T extends Node>(newChild: Node, oldChild: T): T {
    this.insertBefore(newChild, oldChild);
    return this.removeChild(oldChild);
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    const parentNode = this as unknown as ParentNode;

    // 1. Cycle and hierarchy check
    if (node === (this as unknown as T)) {
      throw new Error("Cycle detected: cannot insert node into itself");
    }

    if (node.contains(parentNode)) {
      throw new Error("Hierarchy error: cannot insert a node into its own descendant");
    }

    // 2. Remove from old parent
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    // 3. Find insertion point
    const nodes = this.serverChildNodes.nodes;
    let index = nodes.length;

    if (child) {
      index = nodes.indexOf(child);
      if (index === -1) {
        throw new Error("The node before which the new node is to be inserted is not a child of this node.");
      }
    }

    // 4. Normal insert (Preserve the incoming node object/proxy)
    nodes.splice(index, 0, node as unknown as Node);

    try {
      (node as any).parentNode = parentNode;
    } catch {
      // Ignore: Native DOM Nodes only have getters for parentNode,
      // but they shouldn't crash SSR structural mapping where we mix SSR nodes with simulated native ones.
    }

    return node;
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
