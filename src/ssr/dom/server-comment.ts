import { TYPE_COMMENT_NODE } from "../../constants";
import { escapeHTML } from "../../util/escape";
import { createServerNode } from "./server-node";
import type { ServerCommentNode, ServerDocument } from "./types";

/**
 * Creates a server-side comment node.
 *
 * @param {string} text The text content of the comment.
 * @param {ServerDocument | null} ownerDocument The owner document.
 * @returns {ServerCommentNode} A server-side comment node.
 */
export function createServerComment(text: string, ownerDocument: ServerDocument | null = null): ServerCommentNode {
  const node = createServerNode(TYPE_COMMENT_NODE, ownerDocument) as ServerCommentNode;
  node.data = text;
  node.toString = () => `<!--${escapeHTML(node.data)}-->`;
  return node;
}
