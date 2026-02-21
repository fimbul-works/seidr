import { TYPE_DOCUMENT } from "../../constants";
import { createServerComment } from "./server-comment";
import { createServerElement } from "./server-element";
import { createServerNode } from "./server-node";
import { applyParentNodeMethods } from "./server-parent-node";
import { createServerTextNode } from "./server-text-node";
import type { ServerDocument } from "./types";

/**
 * Creates a server-side document.
 * Minimalist version to avoid heavy tree setup.
 */
export function createServerDocument(): ServerDocument {
  const document = applyParentNodeMethods(createServerNode(TYPE_DOCUMENT)) as ServerDocument;

  document.createElement = (tagName: string) => createServerElement(tagName as keyof HTMLElementTagNameMap, document);
  document.createTextNode = (text: string) => createServerTextNode(text, document);
  document.createComment = (text: string) => createServerComment(text, document);

  const html = document.createElement("html");
  const head = document.createElement("head");
  const body = document.createElement("body");
  html.appendChild(head);
  html.appendChild(body);
  document.appendChild(html);

  Object.defineProperties(document, {
    documentElement: {
      get: () => html,
      enumerable: true,
    },
    head: {
      get: () => head,
      enumerable: true,
    },
    body: {
      get: () => body,
      enumerable: true,
    },
  });

  return document;
}
