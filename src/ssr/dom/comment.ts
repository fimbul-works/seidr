import { escapeText } from "../../element/escape-utils";
import { COMMENT_NODE } from "../../types";
import { createServerNode, type InternalServerNode } from "./node";
import type { ServerNode } from "./types";

export type ServerCommentNode = ServerNode &
  InternalServerNode & {
    data: string;
  };

/**
 * Creates a server-side comment node.
 */
export function createServerComment(text: string): ServerCommentNode {
  const node = createServerNode(COMMENT_NODE) as ServerCommentNode;
  node.data = String(text);

  // Override toString to wrap in comment markers
  node.toString = () => `<!--${escapeText(node.data)}-->`;

  return node;
}
