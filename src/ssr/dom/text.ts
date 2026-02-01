import { escapeText } from "../../element/escape-utils";
import { TEXT_NODE } from "../../types";
import { createServerNode, type InternalServerNode } from "./node";
import type { ServerNode } from "./types";

export type ServerTextNode = ServerNode &
  InternalServerNode & {
    data: string;
  };

/**
 * Creates a server-side text node.
 */
export function createServerTextNode(text: string): ServerTextNode {
  const node = createServerNode(TEXT_NODE) as ServerTextNode;
  node.data = String(text);

  // Override toString to escape content
  node.toString = () => escapeText(node.data);

  return node;
}
