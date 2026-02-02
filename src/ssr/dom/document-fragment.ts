import { DOCUMENT_FRAGMENT_NODE } from "../../types";
import type { ServerDocument } from "./document";
import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import type { ServerNode, ServerNodeType } from "./types";

export type ServerDocumentFragment = ServerNode &
  InternalServerNode & {
    appendChild(node: ServerNodeType): void;
    append(...nodes: ServerNodeType[]): void;
    // ... more ParentNode methods will be added via a shared utility
  };

/**
 * Creates a server-side document fragment.
 */
export function createServerDocumentFragment(ownerDocument: ServerDocument | null = null): ServerDocumentFragment {
  const node = createServerNode(DOCUMENT_FRAGMENT_NODE, ownerDocument) as ServerDocumentFragment;

  applyParentNodeMethods(node);

  return node;
}
