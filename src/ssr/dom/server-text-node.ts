import { TYPE_TEXT_NODE } from "../../constants";
import { escapeHTML } from "../../util/escape";
import { createServerNode } from "./server-node";
import type { ServerDocument, ServerTextNode } from "./types";

/**
 * Creates a server-side text node.
 *
 * @param {string} text The text content of the node.
 * @param {ServerDocument | null} ownerDocument The owner document of the node.
 * @returns {ServerTextNode} The created text node.
 */
export function createServerTextNode(text: string, ownerDocument: ServerDocument | null = null): ServerTextNode {
  const node = createServerNode(TYPE_TEXT_NODE, ownerDocument) as ServerTextNode;
  node.data = text;
  node.toString = () => escapeHTML(node.data);
  return node;
}
