import { isFn, isObj } from "../../util/type-guards";
import {
  type BaseServerNodeInterface,
  COMMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  type SupportedNodeTypes,
  TEXT_NODE,
} from "./types";

/**
 * Creates a server-side node.
 * @param {AllowedNodeTypes} type - The type of node to create
 * @param {...object[][]} extensions - Additional properties to apply to the node
 * @returns The created node.
 */
export function createServerNode<
  T extends SupportedNodeTypes = SupportedNodeTypes,
  N extends BaseServerNodeInterface<T> = BaseServerNodeInterface<T>,
>(type: T, ...extensions: Array<((node: N) => N) | object>): N {
  const allowedTypes = [ELEMENT_NODE, TEXT_NODE, COMMENT_NODE, DOCUMENT_FRAGMENT_NODE];
  if (!allowedTypes.includes(type)) {
    throw new Error(`Unsupported node type: ${type}`);
  }

  // Create base Node object
  const node: any = {};
  Object.defineProperties(node, {
    nodeType: { get: () => type, enumerable: true, configurable: true },
    nodeValue: { get: () => null, enumerable: true, configurable: true },
  });

  // Apply extensions
  for (const ext of extensions) {
    if (isFn(ext)) {
      Object.assign(node, ext(node));
    } else if (isObj(ext)) {
      Object.defineProperties(node, Object.getOwnPropertyDescriptors(ext));
    } else {
      throw new Error("Extension must be a function or an object");
    }
  }

  // Apply common properties
  Object.defineProperties(node, {
    nodeName: {
      get: () => {
        switch (type) {
          case ELEMENT_NODE:
            if (!("tagName" in node) || typeof node.tagName !== "string") throw new Error("tagName is required");
            return node.tagName.toUpperCase();
          case TEXT_NODE:
            return "#text";
          case COMMENT_NODE:
            return "#comment";
          case DOCUMENT_FRAGMENT_NODE:
            return "#document-fragment";
        }
        throw new Error("Invalid node type");
      },
      enumerable: true,
      configurable: true,
    },
  });

  return node as N;
}
