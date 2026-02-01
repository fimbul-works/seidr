import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import { DOCUMENT_FRAGMENT_NODE, type ServerNode, type ServerNodeType } from "./types";

export type ServerDocumentFragment = ServerNode &
  InternalServerNode & {
    appendChild(node: ServerNodeType): void;
    append(...nodes: ServerNodeType[]): void;
    // ... more ParentNode methods will be added via a shared utility
  };

/**
 * Creates a server-side document fragment.
 */
export function createServerDocumentFragment(): ServerDocumentFragment {
  const node = createServerNode(DOCUMENT_FRAGMENT_NODE) as ServerDocumentFragment;

  applyParentNodeMethods(node);

  return node;
}
