import { escapeText } from "../../element/escape-utils";
import { TEXT_NODE } from "../../types";
import type { ServerDocument } from "./document";
import { createServerNode, type InternalServerNode } from "./node";
import type { ServerNode } from "./types";

export type ServerTextNode = ServerNode &
  InternalServerNode & {
    data: string;
  };

/**
 * Creates a server-side text node.
 */
export function createServerTextNode(text: string, ownerDocument: ServerDocument | null = null): ServerTextNode {
  const node = createServerNode(TEXT_NODE, ownerDocument) as ServerTextNode;
  node.data = String(text);

  // Override toString to escape content
  node.toString = () => escapeText(node.data);

  return node;
}
