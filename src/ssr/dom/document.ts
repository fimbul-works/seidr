import { DOCUMENT_NODE } from "../../types";
import { createServerComment } from "./comment";
import { createServerDocumentFragment } from "./document-fragment";
import { createServerElement } from "./element";
import { createServerNode, type InternalServerNode } from "./node";
import { applyParentNodeMethods } from "./parent-node";
import { createServerTextNode } from "./text";
import type { ServerNode, ServerParentNode } from "./types";

export type ServerDocument = ServerNode &
  InternalServerNode &
  ServerParentNode & {
    body: any;
    head: any;
    documentElement: any;
    createElement(tagName: string): any;
    createTextNode(text: string): any;
    createComment(text: string): any;
    createDocumentFragment(): any;
  };

/**
 * Creates a server-side document.
 * Minimalist version to avoid heavy tree setup.
 */
export function createServerDocument(): ServerDocument {
  const node = createServerNode(DOCUMENT_NODE) as InternalServerNode & ServerNode;
  const augmented = applyParentNodeMethods(node) as ServerDocument;

  augmented.createElement = (tagName: string) => createServerElement(tagName as any, augmented);
  augmented.createTextNode = (text: string) => createServerTextNode(text, augmented);
  augmented.createComment = (text: string) => createServerComment(text, augmented);
  augmented.createDocumentFragment = () => createServerDocumentFragment(augmented);

  // Lazy structure properties
  let _head: any = null;
  let _body: any = null;
  let _html: any = null;

  Object.defineProperties(augmented, {
    documentElement: {
      get: () => {
        if (!_html) {
          _html = augmented.createElement("html");
          augmented.appendChild(_html);
        }
        return _html;
      },
      enumerable: true,
    },
    head: {
      get: () => {
        if (!_head) {
          _head = augmented.createElement("head");
          augmented.documentElement.prepend(_head);
        }
        return _head;
      },
      enumerable: true,
    },
    body: {
      get: () => {
        if (!_body) {
          _body = augmented.createElement("body");
          augmented.documentElement.appendChild(_body);
        }
        return _body;
      },
      enumerable: true,
    },
  });

  return augmented;
}
