import { DOCUMENT_FRAGMENT_NODE } from "../../types";
import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import type { ServerNode, ServerParentNode } from "./types";

export type ServerDocumentFragment = ServerNode & ServerParentNode & InternalServerNode;

/**
 * Creates a server-side document fragment.
 */
export function createServerDocumentFragment(): ServerDocumentFragment {
  const node = createServerNode(DOCUMENT_FRAGMENT_NODE) as ServerDocumentFragment;

  applyParentNodeMethods(node);

  return node;
}
