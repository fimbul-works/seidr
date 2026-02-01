import { DOCUMENT_NODE } from "../../types";
import { createServerComment } from "./comment";
import { createServerDocumentFragment } from "./document-fragment";
import { createServerElement } from "./element";
import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import { createServerTextNode } from "./text";
import type { ServerNode } from "./types";

export type ServerDocument = ServerNode &
  InternalServerNode & {
    body: any;
    head: any;
    documentElement: any;
    createElement(tagName: string): any;
    createTextNode(text: string): any;
    createComment(text: string): any;
    createDocumentFragment(): any;
    appendChild(node: ServerNode): void;
  };

/**
 * Creates a server-side document.
 */
export function createServerDocument(): ServerDocument {
  const node = createServerNode(DOCUMENT_NODE) as ServerDocument;

  node.createElement = (tagName: string) => createServerElement(tagName as any);
  node.createTextNode = (text: string) => createServerTextNode(text);
  node.createComment = (text: string) => createServerComment(text);
  node.createDocumentFragment = () => createServerDocumentFragment();

  node.appendChild = (child: ServerNode) => {
    const c = child as any;
    c._parentNode = node;
    node._childNodes.push(c);
  };

  return applyParentNodeMethods(node);
}
