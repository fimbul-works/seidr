import { escapeHTML } from "../../util/html";
import { createServerNode } from "./server-node";
import {
  type BaseServerNodeInterface,
  COMMENT_NODE,
  type NodeTypeComment,
  type NodeTypeText,
  TEXT_NODE,
} from "./types";
import { nodeWithParentExtension, type ServerNodeWithParent } from "./with-parent";

export interface CharacterDataNodeExtension {
  data: string;
  textContent: string;
  nodeValue: string;
  readonly length: number;
  appendData(data: string): void;
  deleteData(offset: number, count: number): void;
  insertData(offset: number, data: string): void;
  replaceData(offset: number, count: number, data: string): void;
  toString(): string;
}

export function characterDataNodeExtension(
  text: string,
  toStringFn: (data: string) => string,
): CharacterDataNodeExtension {
  let _data = text;

  return {
    get data() {
      return _data;
    },
    set data(value: string) {
      _data = value;
    },
    get textContent() {
      return _data;
    },
    set textContent(value: string) {
      _data = value;
    },
    get length(): number {
      return _data.length;
    },
    get nodeValue(): string {
      return _data;
    },
    set nodeValue(value: string) {
      _data = value;
    },
    appendData(data: string): void {
      _data += data;
    },
    deleteData(offset: number, count: number): void {
      _data = _data.slice(0, offset) + _data.slice(offset + count);
    },
    insertData(offset: number, data: string): void {
      _data = _data.slice(0, offset) + data + _data.slice(offset);
    },
    replaceData(offset: number, count: number, data: string): void {
      _data = _data.slice(0, offset) + data + _data.slice(offset + count);
    },
    toString() {
      return toStringFn(_data);
    },
  };
}

export type ServerTextNode = BaseServerNodeInterface<NodeTypeText> &
  CharacterDataNodeExtension &
  ServerNodeWithParent<NodeTypeText>;

/**
 * Creates a server-side text node.
 * @param text - The text content of the node
 * @returns The created node
 */
export function createServerTextNode(text: string): ServerTextNode {
  const textNode = createServerNode<NodeTypeText, ServerTextNode>(
    TEXT_NODE,
    characterDataNodeExtension(text, (text) => escapeHTML(text)),
  );
  return nodeWithParentExtension(textNode);
}

export type ServerCommentNode = BaseServerNodeInterface<NodeTypeComment> &
  CharacterDataNodeExtension &
  ServerNodeWithParent<NodeTypeComment>;

/**
 * Creates a server-side comment node.
 * @param text - The comment content of the node
 * @returns The created node
 */
export function createServerCommentNode(text: string): ServerCommentNode {
  const commentNode = createServerNode<NodeTypeComment, ServerCommentNode>(
    COMMENT_NODE,
    characterDataNodeExtension(text, (text) => `<!--${escapeHTML(text)}-->`),
  );
  return nodeWithParentExtension(commentNode);
}
/**
 * Creates a server-side raw HTML node.
 * This node will not be escaped when rendered to string.
 * @param html - The raw HTML content
 * @returns The created node
 */
export function createServerRawHTMLNode(html: string): ServerTextNode {
  const textNode = createServerNode<NodeTypeText, ServerTextNode>(
    TEXT_NODE,
    characterDataNodeExtension(html, (text) => text),
  );
  return nodeWithParentExtension(textNode);
}
